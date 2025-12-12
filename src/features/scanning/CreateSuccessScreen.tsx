import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { CheckCircle2, Package, Scan } from 'lucide-react';

interface LocationState {
  product: any;
  barcode: string;
}

export function CreateSuccessScreen() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const { product, barcode } = (location.state as LocationState) || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product || !barcode) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('scan.success')} showBack={false} />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const getProductDisplayName = () => {
    return language === 'sq' && product.titleAl ? product.titleAl : product.title;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('scan.success')} showBack={false} />
      <div className="space-y-4 px-4 py-4">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{t('scan.productCreated')}</h1>
          <p className="text-sm text-muted-foreground text-center">
            {t('scan.productCreatedSuccessfully')}
          </p>
        </div>

        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                {product.imagePath ? (
                  <img
                    src={product.imagePath}
                    alt={getProductDisplayName()}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{getProductDisplayName()}</p>
                <p className="text-xs text-muted-foreground">
                  {t('products.sku')}: {product.sku}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('products.barcode')}: {barcode} ✓
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <Package className="mr-2 h-4 w-4" />
          {t('products.adjustStock')}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/scan')}
        >
          <Scan className="mr-2 h-4 w-4" />
          {t('scan.scanAnother')}
        </Button>
      </div>
    </div>
  );
}
