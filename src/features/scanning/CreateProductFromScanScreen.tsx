import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useCreateProductFromScan } from '@/hooks/api/useCreateProductFromScan';
import { useProducts } from '@/hooks/api/useProducts';
import { authStore } from '@/stores/authStore';
import { getDeviceInfo } from '@/lib/device';
import { Package, Lock } from 'lucide-react';

interface LocationState {
  barcode: string;
}

export function CreateProductFromScanScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { mutateAsync: createProduct, isPending } = useCreateProductFromScan();
  const { data: products } = useProducts();
  
  const [title, setTitle] = useState('');
  const [titleAl, setTitleAl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceEur, setPriceEur] = useState('');
  const [priceLek, setPriceLek] = useState('');
  const [initialQuantity, setInitialQuantity] = useState('0');

  const { barcode } = (location.state as LocationState) || {};
  const profile = authStore((state) => state.profile);
  const warehouseId = profile?.permissions?.warehouseIds?.[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!barcode) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('scan.createProduct')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  // Extract unique categories from products
  const categories = products
    ? Array.from(
        new Map(
          products
            .filter((p) => p.category)
            .map((p) => [p.category!.id, p.category!])
        ).values()
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: t('common.error'),
        description: t('products.titleRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: t('common.error'),
        description: t('products.categoryRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (!warehouseId) {
      toast({
        title: t('common.error'),
        description: t('products.warehouseRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const price = priceEur ? parseFloat(priceEur) : 0;
      const priceLekValue = priceLek ? parseFloat(priceLek) : undefined;
      const quantity = parseInt(initialQuantity) || 0;

      const result = await createProduct({
        barcode,
        title: title.trim(),
        titleAl: titleAl.trim() || undefined,
        categoryId,
        price,
        priceLek: priceLekValue,
        initialQuantity: quantity,
        warehouseId,
      });

      toast({
        title: t('scan.productCreated'),
        description: t('scan.productCreatedDesc'),
      });

      navigate('/scan/create-success', {
        state: {
          product: result.product,
          barcode,
        },
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('scan.createError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('scan.createProduct')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">{t('scan.newProduct')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t('scan.barcodeFromScan')}:
                </Label>
                <div className="relative">
                  <Input
                    value={barcode}
                    disabled
                    className="pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('products.title')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('products.titlePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleAl">{t('products.titleAlbanian')}</Label>
                <Input
                  id="titleAl"
                  value={titleAl}
                  onChange={(e) => setTitleAl(e.target.value)}
                  placeholder={t('products.titleAlbanianPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {t('products.category')} <span className="text-red-500">*</span>
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t('products.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="priceEur">
                    {t('products.priceEur')} (€)
                  </Label>
                  <Input
                    id="priceEur"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceEur}
                    onChange={(e) => setPriceEur(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceLek">
                    {t('products.priceLek')} (Lek)
                  </Label>
                  <Input
                    id="priceLek"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceLek}
                    onChange={(e) => setPriceLek(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialQuantity">
                  {t('scan.initialStockQuantity')}
                </Label>
                <Input
                  id="initialQuantity"
                  type="number"
                  min="0"
                  value={initialQuantity}
                  onChange={(e) => setInitialQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
          >
            {isPending ? t('common.loading') : t('scan.createProduct')}
          </Button>
        </form>
      </div>
    </div>
  );
}
