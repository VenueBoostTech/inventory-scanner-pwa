import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useScanner } from '@/hooks/useScanner';
import { Package, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

// Mock data
const mockProducts: Record<string, any> = {
  prod_001: {
    id: 'prod_001',
    title: 'Coffee Beans',
    sku: 'COF-001',
    barcode: null,
    hasBarcode: false,
    imagePath: 'https://cdn.example.com/products/coffee.jpg',
  },
};

export function LinkBarcodeScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isScanning, error, startScanning, stopScanning } = useScanner();
  const [barcode, setBarcode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [conflictingProduct, setConflictingProduct] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const product = id ? mockProducts[id] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('products.linkBarcode')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const handleDecoded = (code: string) => {
    setBarcode(code);
    stopScanning();
  };

  const handleCheckBarcode = async () => {
    if (!barcode || barcode.trim() === '') {
      toast({
        title: t('common.error'),
        description: t('products.pleaseScanOrEnterBarcode'),
        variant: 'destructive',
      });
      return;
    }

    if (barcode === product.sku) {
      toast({
        title: t('common.error'),
        description: t('products.barcodeCannotBeSameAsSku'),
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);

    // TODO: Call API to check if barcode is available
    // Simulate API call
    setTimeout(() => {
      // Mock: Check if barcode is already used
      const mockConflict = barcode === '8901234567890' ? {
        id: 'prod_002',
        title: 'Tea Bags',
        sku: 'TEA-001',
      } : null;

      if (mockConflict) {
        setConflictingProduct(mockConflict);
        setErrorMessage(t('products.barcodeAlreadyLinkedTo').replace('{product}', mockConflict.title));
        setErrorModalOpen(true);
      } else {
        // Success - link barcode
        handleLinkBarcode();
      }
      setIsChecking(false);
    }, 1000);
  };

  const handleLinkBarcode = async () => {
    // TODO: Call API to link barcode
    setSuccessModalOpen(true);
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate(`/products/${product.id}`);
  };

  const handleErrorClose = () => {
    setErrorModalOpen(false);
    setBarcode('');
    setConflictingProduct(null);
  };

  const handleViewConflictingProduct = () => {
    if (conflictingProduct) {
      navigate(`/products/${conflictingProduct.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('products.linkBarcode')} showBack />

      <div className="space-y-4 px-4 py-4">
        {/* Product Info */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-center gap-3">
              {product.imagePath ? (
                <img
                  src={product.imagePath}
                  alt={product.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{product.title}</p>
                <p className="text-xs text-muted-foreground">{t('products.sku')}: {product.sku}</p>
                <p className="text-xs text-muted-foreground">
                  {t('products.current')}: {t('products.noBarcodeLinked')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan Barcode */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.scanBarcode')}</h3>
            <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-border bg-muted/60 mb-3">
              <div
                id="scanner"
                className="scanner-container h-full w-full"
                aria-label="Camera preview"
              />
              {!isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  {t('products.pointCameraAtBarcode')}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                if (isScanning) {
                  stopScanning();
                } else {
                  startScanning(handleDecoded);
                }
              }}
            >
              <Zap className="h-4 w-4" />
              {isScanning ? t('scan.stop') : t('scan.startScanning')}
            </Button>
          </CardContent>
        </Card>

        {/* OR Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">{t('products.or')}</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Manual Entry */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.enterManually')}</h3>
            <Input
              placeholder={t('products.enterBarcode')}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="mb-3"
            />
            <Button
              onClick={handleCheckBarcode}
              disabled={!barcode || isChecking}
              className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {isChecking ? t('products.checking') : t('products.linkBarcode')}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="mt-2">{t('products.barcodeLinkedSuccessfully')}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{barcode}</p>
              <p className="text-sm text-muted-foreground">
                → {product.title} ({product.sku})
              </p>
            </div>

            <Button
              onClick={handleSuccessClose}
              className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('products.backToProduct')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div className="mt-2">{t('products.barcodeAlreadyLinked')}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {conflictingProduct && (
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">{conflictingProduct.title}</p>
                <p className="text-xs text-muted-foreground">{t('products.sku')}: {conflictingProduct.sku}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleErrorClose}
                className="flex-1"
              >
                {t('products.tryDifferentBarcode')}
              </Button>
              {conflictingProduct && (
                <Button
                  onClick={handleViewConflictingProduct}
                  className="flex-1 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                >
                  {t('products.viewProduct')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
