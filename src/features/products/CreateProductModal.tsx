import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useCreateProduct } from '@/hooks/api/useCreateProduct';
import { useCategories } from '@/hooks/api/useProductMeta';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { Loader2, Upload, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductModal({ open, onOpenChange }: CreateProductModalProps) {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  
  // Get categories and warehouses (with children for hierarchical view)
  const { data: categoriesData } = useCategories(true);
  const categories = categoriesData || [];
  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const warehouses = warehousesData?.data || [];

  // Required fields
  const [title, setTitle] = useState('');
  const [titleAl, setTitleAl] = useState('');
  const [productSku, setProductSku] = useState('');
  
  // Optional fields
  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [shortDescriptionAl, setShortDescriptionAl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAl, setDescriptionAl] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [priceAl, setPriceAl] = useState('');
  const [priceEur, setPriceEur] = useState('');
  const [initialQuantity, setInitialQuantity] = useState('');
  const [lowQuantity, setLowQuantity] = useState('');
  const [enableLowStockAlert, setEnableLowStockAlert] = useState(false);
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Reset form when modal closes
  const handleClose = () => {
    if (!isPending) {
      setTitle('');
      setTitleAl('');
      setProductSku('');
      setBarcode('');
      setShortDescription('');
      setShortDescriptionAl('');
      setDescription('');
      setDescriptionAl('');
      setCategoryIds([]);
      setPriceAl('');
      setPriceEur('');
      setInitialQuantity('');
      setLowQuantity('');
      setEnableLowStockAlert(false);
      setWarehouseId('');
      setImage(null);
      setImagePreview(null);
      onOpenChange(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error'),
          description: t('products.imageInvalidType'),
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('common.error'),
          description: t('products.imageTooLarge'),
          variant: 'destructive',
        });
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Auto-enable low stock alert if lowQuantity is set
  useMemo(() => {
    if (lowQuantity && parseFloat(lowQuantity) > 0) {
      setEnableLowStockAlert(true);
    }
  }, [lowQuantity]);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: t('common.error'),
        description: t('products.titleRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (!titleAl.trim()) {
      toast({
        title: t('common.error'),
        description: t('products.titleAlRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (!productSku.trim()) {
      toast({
        title: t('common.error'),
        description: t('products.skuRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const request: any = {
        title: title.trim(),
        titleAl: titleAl.trim(),
        productSku: productSku.trim(),
      };

      // Optional fields
      if (barcode.trim()) {
        request.barcode = barcode.trim();
      }

      if (shortDescription.trim()) {
        request.shortDescription = shortDescription.trim();
      }

      if (shortDescriptionAl.trim()) {
        request.shortDescriptionAl = shortDescriptionAl.trim();
      }

      if (description.trim()) {
        request.description = description.trim();
      }

      if (descriptionAl.trim()) {
        request.descriptionAl = descriptionAl.trim();
      }

      if (categoryIds.length > 0) {
        request.categoryIds = categoryIds;
      }

      if (priceAl.trim()) {
        const priceAlValue = parseFloat(priceAl);
        if (!isNaN(priceAlValue) && priceAlValue >= 0) {
          request.priceAl = priceAlValue;
        }
      }

      if (priceEur.trim()) {
        const priceEurValue = parseFloat(priceEur);
        if (!isNaN(priceEurValue) && priceEurValue >= 0) {
          request.priceEur = priceEurValue;
        }
      }

      if (initialQuantity.trim()) {
        const qty = parseInt(initialQuantity);
        if (!isNaN(qty) && qty >= 0) {
          request.initialQuantity = qty;
        }
      }

      if (lowQuantity.trim()) {
        const lowQty = parseFloat(lowQuantity);
        if (!isNaN(lowQty) && lowQty >= 0) {
          request.lowQuantity = lowQty;
        }
      }

      if (enableLowStockAlert) {
        request.enableLowStockAlert = true;
      }

      if (warehouseId) {
        request.warehouseId = warehouseId;
      }

      if (image) {
        request.image = image;
      }

      const result = await createProduct(request);

      toast({
        title: t('products.productCreated'),
        description: t('products.productCreatedDesc'),
      });

      handleClose();
      
      // Navigate to the newly created product
      if (result?.product?.id) {
        navigate(`/products/${result.product.id}`);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('products.createError');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>{t('products.createProduct')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{t('products.image')}</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 rounded-lg object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-1 hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('products.uploadImage')}</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            )}
          </div>

          {/* Required Fields */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('products.requiredFields')}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">{t('products.titleLabel')} ({t('common.english')}) *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('products.titlePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleAl">{t('products.titleLabel')} ({t('common.albanian')}) *</Label>
                <Input
                  id="titleAl"
                  value={titleAl}
                  onChange={(e) => setTitleAl(e.target.value)}
                  placeholder={t('products.titleAlPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productSku">{t('products.sku')} *</Label>
                <Input
                  id="productSku"
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  placeholder={t('products.skuPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">{t('products.barcode')}</Label>
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder={t('products.barcodePlaceholder')}
                />
                <p className="text-xs text-muted-foreground">{t('products.barcodeHint')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Optional Fields - Descriptions */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('products.descriptions')}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="shortDescription">{t('products.shortDescription')} ({t('common.english')})</Label>
                <Input
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder={t('products.shortDescriptionPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescriptionAl">{t('products.shortDescription')} ({t('common.albanian')})</Label>
                <Input
                  id="shortDescriptionAl"
                  value={shortDescriptionAl}
                  onChange={(e) => setShortDescriptionAl(e.target.value)}
                  placeholder={t('products.shortDescriptionAlPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('products.description')} ({t('common.english')})</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('products.descriptionPlaceholder')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionAl">{t('products.description')} ({t('common.albanian')})</Label>
                <textarea
                  id="descriptionAl"
                  value={descriptionAl}
                  onChange={(e) => setDescriptionAl(e.target.value)}
                  placeholder={t('products.descriptionAlPlaceholder')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Optional Fields - Classification & Pricing */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('products.classificationAndPricing')}</h3>
              
              <div className="space-y-2">
                <Label>{t('products.category')}</Label>
                <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-white p-3 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('products.noCategories')}</p>
                  ) : (
                    categories.map((category) => {
                      const categoryName = category.title || category.name || '';
                      const categoryNameAl = category.title_al || category.nameAl || '';
                      const displayName = language === 'sq' && categoryNameAl ? categoryNameAl : categoryName;
                      const isParentSelected = categoryIds.includes(category.id);
                      const hasChildren = category.children && category.children.length > 0;
                      
                      return (
                        <div key={category.id} className="space-y-1">
                          {/* Parent Category */}
                          <label
                            className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                              isParentSelected
                                ? 'border-[#164945] bg-[#164945]/10'
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isParentSelected}
                              onChange={() => {
                                if (isParentSelected) {
                                  // Remove parent and all its children
                                  const childIds = category.children?.map(c => c.id) || [];
                                  setCategoryIds(prev => prev.filter(id => id !== category.id && !childIds.includes(id)));
                                } else {
                                  // Add parent (children are optional, user can select separately)
                                  setCategoryIds(prev => [...prev, category.id]);
                                }
                              }}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#164945] focus:ring-[#164945]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{displayName}</span>
                                {category.products_count !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    ({category.products_count})
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                          
                          {/* Children Categories */}
                          {hasChildren && (
                            <div className="ml-6 space-y-1">
                              {category.children!.map((child) => {
                                const childName = child.title || child.name || '';
                                const childNameAl = child.title_al || child.nameAl || '';
                                const childDisplayName = language === 'sq' && childNameAl ? childNameAl : childName;
                                const isChildSelected = categoryIds.includes(child.id);
                                
                                return (
                                  <label
                                    key={child.id}
                                    className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                                      isChildSelected
                                        ? 'border-[#164945] bg-[#164945]/10'
                                        : 'border-border hover:bg-muted/50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChildSelected}
                                      onChange={() => {
                                        if (isChildSelected) {
                                          setCategoryIds(prev => prev.filter(id => id !== child.id));
                                        } else {
                                          setCategoryIds(prev => [...prev, child.id]);
                                        }
                                      }}
                                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#164945] focus:ring-[#164945]"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{childDisplayName}</span>
                                        {child.products_count !== undefined && (
                                          <span className="text-xs text-muted-foreground">
                                            ({child.products_count})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {categoryIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('products.selectedCategories')}: {categoryIds.length}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="priceAl">{t('products.priceAl')}</Label>
                  <Input
                    id="priceAl"
                    type="number"
                    min="0"
                    step="1"
                    value={priceAl}
                    onChange={(e) => setPriceAl(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceEur">{t('products.priceEur')}</Label>
                  <Input
                    id="priceEur"
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceEur}
                    onChange={(e) => setPriceEur(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional Fields - Stock Management */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('products.stockManagement')}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity">{t('products.initialQuantity')}</Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    min="0"
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouseId">{t('products.warehouse')}</Label>
                  <Select value={warehouseId || undefined} onValueChange={(value) => setWarehouseId(value || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.selectWarehouse')} />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowQuantity">{t('products.lowQuantity')}</Label>
                <Input
                  id="lowQuantity"
                  type="number"
                  min="0"
                  value={lowQuantity}
                  onChange={(e) => setLowQuantity(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">{t('products.lowQuantityHint')}</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableLowStockAlert"
                  checked={enableLowStockAlert}
                  onChange={(e) => setEnableLowStockAlert(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="enableLowStockAlert" className="text-sm font-normal cursor-pointer">
                  {t('products.enableLowStockAlert')}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-[#164945] text-white hover:bg-[#123b37]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.creating')}
              </>
            ) : (
              t('products.createProduct')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

