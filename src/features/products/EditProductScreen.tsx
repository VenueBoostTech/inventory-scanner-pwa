import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useProduct, useUpdateProduct } from '@/hooks/api/useProducts';
import { useCategories, useBrands } from '@/hooks/api/useProductMeta';

export function EditProductScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product } = useProduct(id || '');
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();

  const [title, setTitle] = useState('');
  const [titleAl, setTitleAl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [shortDescriptionAl, setShortDescriptionAl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAl, setDescriptionAl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [price, setPrice] = useState('');
  const [priceAl, setPriceAl] = useState('');
  const [priceEur, setPriceEur] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('');
  const [lowQuantity, setLowQuantity] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setTitle(product.title || '');
      setTitleAl(product.titleAl || '');
      setShortDescription(product.shortDescription || '');
      setShortDescriptionAl(product.shortDescriptionAl || '');
      setDescription(product.description || '');
      setDescriptionAl(product.descriptionAl || '');
      setCategoryId(product.category?.id || '');
      setBrandId(product.brand?.id || '');
      setPrice(product.pricing?.price?.toString() || '');
      setPriceAl(product.pricing?.priceAl?.toString() || '');
      setPriceEur(product.pricing?.priceEur?.toString() || '');
      setUnitMeasure(product.unitMeasure || '');
      setLowQuantity(product.lowQuantity?.toString() || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('products.editProduct')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title || title.length < 2) {
      toast({
        title: t('common.error'),
        description: t('products.titleRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (!id) return;

    try {
      await updateProduct({
        productId: id,
        title: title.trim(),
        titleAl: titleAl.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        shortDescriptionAl: shortDescriptionAl.trim() || undefined,
        description: description.trim() || undefined,
        descriptionAl: descriptionAl.trim() || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        price: price ? parseFloat(price) : undefined,
        priceAl: priceAl ? parseFloat(priceAl) : undefined,
        priceEur: priceEur ? parseFloat(priceEur) : undefined,
        unitMeasure: unitMeasure || undefined,
        lowQuantity: lowQuantity ? parseInt(lowQuantity) : undefined,
      });

      toast({
        title: t('products.productUpdated'),
        description: t('products.productUpdatedDesc'),
      });
      navigate(`/products/${id}`);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('products.updateError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader
        title={t('products.editProduct')}
        showBack
        action={
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="border-none bg-[#164945] text-white hover:bg-[#123b37]"
          >
            {isPending ? t('common.loading') : t('common.save')}
          </Button>
        }
      />

      <div className="space-y-4 px-4 py-4">
        {/* Image */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{t('products.image')}</h3>
              <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-border bg-muted/60">
                {product.imagePath ? (
                  <img
                    src={product.imagePath}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                📷 {t('products.change')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.basicInformation')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('products.title')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('products.titlePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.titleAlbanian')}</label>
                <Input
                  value={titleAl}
                  onChange={(e) => setTitleAl(e.target.value)}
                  placeholder={t('products.titleAlbanianPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.shortDescription')}</label>
                <Input
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder={t('products.shortDescriptionPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.shortDescriptionAlbanian')}</label>
                <Input
                  value={shortDescriptionAl}
                  onChange={(e) => setShortDescriptionAl(e.target.value)}
                  placeholder={t('products.shortDescriptionAlbanianPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.description')}</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('products.descriptionPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.descriptionAlbanian')}</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={descriptionAl}
                  onChange={(e) => setDescriptionAl(e.target.value)}
                  placeholder={t('products.descriptionAlbanianPlaceholder')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.classification')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.category')}</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
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

              {brands.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('products.brand')} ({t('products.optional')})
                  </label>
                  <Select value={brandId} onValueChange={setBrandId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.selectBrand')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('products.none')}</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.pricing')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('products.priceDefault')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.priceLek')}</label>
                <Input
                  type="number"
                  value={priceAl}
                  onChange={(e) => setPriceAl(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.priceEur')}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceEur}
                  onChange={(e) => setPriceEur(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Settings */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.stockSettings')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.unitOfMeasure')}</label>
                <Input
                  value={unitMeasure}
                  onChange={(e) => setUnitMeasure(e.target.value)}
                  placeholder="pcs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('products.lowStockAlertThreshold')}</label>
                <Input
                  type="number"
                  value={lowQuantity}
                  onChange={(e) => setLowQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t('products.adjustStockNote')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/products/${product.id}`)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 border-none bg-[#164945] text-white hover:bg-[#123b37]"
          >
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
