import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import {
  CheckCircle2,
  XCircle,
  Package,
  Search,
  Plus,
  Scan,
  AlertCircle,
} from 'lucide-react';
import type { ScanResult } from '@/types/api';

interface LocationState {
  scanResult: ScanResult;
  barcode: string;
  source?: 'scan' | 'sku_search'; // Indicates if this came from a scan or SKU search
}

export function ScanResultScreen() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const { scanResult, barcode, source = 'scan' } = (location.state as LocationState) || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!scanResult || !barcode) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('scan.scanResult')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const isFound = scanResult.result === 'found' && scanResult.product;
  const product = scanResult.product;
  
  // Calculate stockStatus if not provided by backend
  const getStockStatus = (product: any): 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_tracked' => {
    if (product.stockStatus) {
      return product.stockStatus;
    }
    
    if (!product.enableStock) {
      return 'not_tracked';
    }
    
    if (product.stockQuantity === 0) {
      return 'out_of_stock';
    }
    
    if (product.enableLowStockAlert && product.lowQuantity !== undefined && product.lowQuantity !== null && product.stockQuantity <= product.lowQuantity) {
      return 'low_stock';
    }
    
    return 'in_stock';
  };
  
  const stockStatus = product ? getStockStatus(product) : 'not_tracked';

  if (isFound && product) {
    // Product Found Screen
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('scan.scanResult')} showBack />
        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-semibold text-foreground">{t('scan.productFound')}</h1>
          </div>

          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              {product.imagePath ? (
                <div className="mb-3 flex justify-center">
                  <img
                    src={product.imagePath}
                    alt={product.title}
                    className="h-32 w-32 rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <h2 className="text-lg font-semibold text-foreground">
                {language === 'sq' && product.titleAl ? product.titleAl : product.title}
              </h2>
              {product.titleAl && product.title && language === 'sq' && (
                <p className="text-sm text-muted-foreground mt-1">{product.title}</p>
              )}
              {product.titleAl && product.title && language !== 'sq' && (
                <p className="text-sm text-muted-foreground mt-1">{product.titleAl}</p>
              )}
              
              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {product.categories.map((cat) => {
                    const catName = language === 'sq' && cat.nameAl ? cat.nameAl : cat.name;
                    return (
                      <Badge key={cat.id} variant="outline" className="text-xs">
                        {catName}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('products.sku')}:</span>
                  <span className="text-sm font-medium">{product.sku}</span>
                </div>
                {product.barcode && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('products.barcode')}:</span>
                    <span className="text-sm font-medium">{product.barcode}</span>
                  </div>
                )}
                
                {/* Pricing */}
                {product.pricing && (
                  <>
                    {product.pricing.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('products.price')}:</span>
                        <span className="text-sm font-medium">
                          {typeof product.pricing.price === 'object' && product.pricing.price.formatted
                            ? product.pricing.price.formatted
                            : typeof product.pricing.price === 'object' && product.pricing.price.amount !== undefined
                            ? `${product.pricing.price.currencySymbol || ''}${product.pricing.price.amount}`
                            : product.pricing.price}
                        </span>
                      </div>
                    )}
                    {product.pricing.priceEur && 
                     product.pricing.price && 
                     typeof product.pricing.price === 'object' && 
                     product.pricing.price.currency !== 'EUR' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('products.priceEur')}:</span>
                        <span className="text-sm font-medium">
                          {typeof product.pricing.priceEur === 'object' && product.pricing.priceEur.formatted
                            ? product.pricing.priceEur.formatted
                            : typeof product.pricing.priceEur === 'object' && product.pricing.priceEur.amount !== undefined
                            ? `€${product.pricing.priceEur.amount.toFixed(2)}`
                            : `€${typeof product.pricing.priceEur === 'number' ? product.pricing.priceEur.toFixed(2) : product.pricing.priceEur}`}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <h3 className="text-sm font-semibold mb-3">{t('products.stockStatus')}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('products.stock')}:</span>
                  <span className="text-sm font-medium">
                    {product.stockQuantity} {t('operations.units')}
                  </span>
                </div>
                {product.lowQuantity !== undefined && product.lowQuantity !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('products.lowQty')}:</span>
                    <span className="text-sm font-medium">{product.lowQuantity}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('operations.status')}:</span>
                  <span
                    className={`text-sm font-medium ${
                      stockStatus === 'in_stock'
                        ? 'text-emerald-600'
                        : stockStatus === 'low_stock'
                        ? 'text-yellow-600'
                        : stockStatus === 'out_of_stock'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {stockStatus === 'in_stock'
                      ? t('products.inStock')
                      : stockStatus === 'low_stock'
                      ? t('products.lowStockStatus')
                      : stockStatus === 'out_of_stock'
                      ? t('products.outOfStock')
                      : t('products.notTracked')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            {t('products.adjustStock')}
          </Button>

          {source === 'scan' ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/products/${product.id}`)}
                className="w-full"
              >
                {t('operations.viewDetails')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/scan')}
                className="w-full"
              >
                {t('scan.scanAgain')}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate(`/products/${product.id}`)}
              className="w-full"
            >
              {t('operations.viewDetails')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Product Not Found Screen
  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('scan.scanResult')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-semibold text-foreground">{t('scan.productNotFound')}</h1>
        </div>

        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {source === 'sku_search' ? t('scan.searchedSku') : t('scan.scannedBarcode')}:
              </p>
              <p className="text-lg font-semibold text-foreground">{barcode}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <p className="text-sm text-muted-foreground text-center">
              {source === 'sku_search' 
                ? t('scan.skuNotInSystem') 
                : t('scan.barcodeNotInSystem')}
            </p>
          </CardContent>
        </Card>

        {source === 'sku_search' ? (
          <>
            <Button
              className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
              onClick={() => navigate('/products')}
            >
              <Search className="mr-2 h-4 w-4" />
              {t('scan.searchProducts')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/scan/create-product', { state: { sku: barcode } })}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('scan.createNewProduct')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/scan')}
            >
              <Search className="mr-2 h-4 w-4" />
              {t('scan.searchAgain')}
            </Button>
          </>
        ) : (
          <>
            <Button
              className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
              onClick={() => navigate('/scan/search', { state: { barcode } })}
            >
              <Search className="mr-2 h-4 w-4" />
              {t('scan.searchAndLink')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/scan/create-product', { state: { barcode } })}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('scan.createNewProduct')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/scan')}
            >
              <Scan className="mr-2 h-4 w-4" />
              {t('scan.scanAgain')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
