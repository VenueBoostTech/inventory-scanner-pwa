import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useScanSearch } from '@/hooks/api/useScanSearch';
import { apiClient } from '@/lib/api-client';
import { Search, Package, Plus, Link2 } from 'lucide-react';
import { getDeviceInfo } from '@/lib/device';

interface LocationState {
  barcode: string;
}

export function SearchProductsScreen() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { mutateAsync: searchProducts, isPending: isSearching } = useScanSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isLinking, setIsLinking] = useState(false);

  const { barcode } = (location.state as LocationState) || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!barcode) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('scan.searchProducts')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const deviceInfo = getDeviceInfo();
      const result = await searchProducts({
        searchTerm: term,
        originalBarcode: barcode,
        deviceInfo,
      });

      setSearchResults(result.products || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('scan.searchError'),
        variant: 'destructive',
      });
    }
  };

  const handleLinkBarcode = async (product: any) => {
    setSelectedProduct(product);
    setLinkModalOpen(true);
  };

  const confirmLink = async () => {
    if (!selectedProduct) return;

    setIsLinking(true);
    try {
      await apiClient.put(`/products/${selectedProduct.id}/link-barcode`, {
        barcode,
      });

      toast({
        title: t('scan.barcodeLinked'),
        description: t('scan.barcodeLinkedDesc'),
      });

      setLinkModalOpen(false);
      navigate('/scan/link-success', {
        state: {
          product: selectedProduct,
          barcode,
        },
      });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        const message = error.response.data.message;
        toast({
          title: t('common.error'),
          description: message || t('scan.barcodeAlreadyUsed'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.error'),
          description: t('scan.linkError'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsLinking(false);
    }
  };

  const getProductDisplayName = (product: any) => {
    return language === 'sq' && product.titleAl ? product.titleAl : product.title;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('scan.searchProducts')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">{t('scan.searchProducts')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('scan.barcodeToLink')}: <span className="font-medium">{barcode}</span>
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('scan.searchProductsPlaceholder')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              void handleSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {isSearching && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground px-1">
              {t('scan.foundProducts').replace('{count}', String(searchResults.length))}
            </p>
            <div className="space-y-3">
              {searchResults.map((product) => (
                <Card key={product.id} className="border border-border bg-white shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          {product.imagePath ? (
                            <img
                              src={product.imagePath}
                              alt={getProductDisplayName(product)}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {getProductDisplayName(product)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('products.sku')}: {product.sku}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('products.stock')}: {product.stockQuantity} {t('operations.units')}
                            {product.hasBarcode ? (
                              <span className="ml-2 text-emerald-600">• {t('scan.hasBarcode')}</span>
                            ) : (
                              <span className="ml-2 text-muted-foreground">• {t('scan.noBarcode')}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {!product.hasBarcode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLinkBarcode(product)}
                          className="shrink-0"
                        >
                          <Link2 className="mr-1 h-3 w-3" />
                          {t('scan.link')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchTerm && searchResults.length === 0 && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-8">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{t('scan.noProductsFound')}</p>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  {t('scan.noProductsFoundDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isSearching && searchResults.length === 0 && !searchTerm && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('scan.startSearching')}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground text-center mb-3">
            {t('scan.notInList')}
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/scan/create-product', { state: { barcode } })}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('scan.createNewProduct')}
          </Button>
        </div>
      </div>

      {/* Link Confirmation Modal */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('scan.linkBarcode')}</DialogTitle>
            <DialogDescription>{t('scan.linkBarcodeDesc')}</DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-3">
              <Card className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('products.product')}:</p>
                      <p className="text-sm font-semibold">{getProductDisplayName(selectedProduct)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('products.sku')}:</p>
                      <p className="text-sm">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('scan.currentBarcode')}:</p>
                      <p className="text-sm">{selectedProduct.barcode || t('scan.none')}</p>
                    </div>
                    <div className="border-t border-border pt-2">
                      <p className="text-xs text-muted-foreground">{t('scan.newBarcode')}:</p>
                      <p className="text-sm font-semibold">{barcode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setLinkModalOpen(false)}
              disabled={isLinking}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={confirmLink}
              disabled={isLinking}
              className="border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {isLinking ? t('common.loading') : t('scan.confirmAndLink')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
