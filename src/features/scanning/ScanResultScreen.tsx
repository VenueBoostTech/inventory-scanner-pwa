import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Package,
  Search,
  Plus,
  Scan,
  ArrowRight,
} from 'lucide-react';
import type { ScanResult } from '@/types/api';

interface LocationState {
  scanResult: ScanResult;
  barcode: string;
}

export function ScanResultScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { scanResult, barcode } = (location.state as LocationState) || {};

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
                  />
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <h2 className="text-lg font-semibold text-foreground">{product.title}</h2>
              {product.titleAl && (
                <p className="text-sm text-muted-foreground">{product.titleAl}</p>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('products.barcode')}:</span>
                  <span className="text-sm font-medium">{product.barcode}</span>
                </div>
                {product.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('products.price')}:</span>
                    <span className="text-sm font-medium">€{product.price.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('products.stock')}:</span>
                  <span className="text-sm font-medium">
                    {product.stockQuantity} {t('operations.units')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('operations.status')}:</span>
                  <span
                    className={`text-sm font-medium ${
                      product.stockStatus === 'in_stock'
                        ? 'text-emerald-600'
                        : product.stockStatus === 'low_stock'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {product.stockStatus === 'in_stock'
                      ? t('products.inStock')
                      : product.stockStatus === 'low_stock'
                      ? t('products.lowStockStatus')
                      : t('products.outOfStock')}
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

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/products/${product.id}`)}
              className="w-full"
            >
              {t('products.viewDetails')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/scan')}
              className="w-full"
            >
              {t('scan.scanAgain')}
            </Button>
          </div>
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
              <p className="text-sm text-muted-foreground">{t('scan.scannedBarcode')}:</p>
              <p className="text-lg font-semibold text-foreground">{barcode}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <p className="text-sm text-muted-foreground text-center">
              {t('scan.barcodeNotInSystem')}
            </p>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
