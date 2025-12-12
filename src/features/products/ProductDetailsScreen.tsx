import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useProduct } from '@/hooks/api/useProducts';
import {
  Package,
  Edit,
  MoreVertical,
  Copy,
  Minus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Truck,
  ClipboardList,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { ProductGallery } from './ProductGallery';
import { AdjustStockModal } from './AdjustStockModal';

export function ProductDetailsScreen() {
  const { t, language } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: product, isLoading } = useProduct(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('products.title')} showBack />
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('products.title')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const getStockStatusBadge = () => {
    if (product.stockStatus === 'in_stock') {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {t('products.inStock')}
        </Badge>
      );
    }
    if (product.stockStatus === 'low_stock') {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('products.lowStockStatus')}
        </Badge>
      );
    }
    if (product.stockStatus === 'out_of_stock') {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          {t('products.outOfStock')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-50 text-gray-700 border-gray-200">
        <Minus className="h-3 w-3 mr-1" />
        {t('products.notTracked')}
      </Badge>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'STOCK_ADJUSTMENT':
        return <Package className="h-4 w-4" />;
      case 'SCAN':
        return <ClipboardList className="h-4 w-4" />;
      case 'TRANSFER':
        return <Truck className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'STOCK_ADJUSTMENT':
        return t('products.stockAdjustment');
      case 'SCAN':
        return t('products.scan');
      case 'TRANSFER':
        return t('products.transfer');
      default:
        return type;
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common.copied'),
      description: `${label} ${t('common.copiedToClipboard')}`,
    });
  };

  const handleAdjustStock = () => {
    setAdjustModalOpen(true);
  };

  const handleTransfer = () => {
    navigate(`/operations/transfers?productId=${product.id}`);
  };

  const handleViewHistory = () => {
    navigate(`/operations/activities?productId=${product.id}`);
  };

  const handleLinkBarcode = () => {
    navigate(`/products/${product.id}/link-barcode`);
  };

  const handleEdit = () => {
    navigate(`/products/${product.id}/edit`);
  };

  const displayTitle = language === 'sq' && product.titleAl ? product.titleAl : product.title;

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader
        title={displayTitle}
        showBack
      />

      <div className="space-y-4 px-4 py-4">
        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{displayTitle}</h1>
            {product.titleAl && language === 'en' && (
              <p className="text-sm text-muted-foreground">{product.titleAl}</p>
            )}
            {product.title && language === 'sq' && (
              <p className="text-sm text-muted-foreground">{product.title}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              {product.category && <span>{t('products.category')}: {product.category.name}</span>}
              {product.brand && (
                <>
                  <span>•</span>
                  <span>{t('products.brand')}: {product.brand.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="h-10 w-10 p-0"
              title={t('common.edit')}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCopy(product.sku, 'SKU')}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('products.copySku')}
                </DropdownMenuItem>
                {product.hasBarcode && product.barcode && (
                  <DropdownMenuItem onClick={() => handleCopy(product.barcode!, t('products.barcode'))}>
                    <Copy className="h-4 w-4 mr-2" />
                    {t('products.copyBarcode')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Gallery */}
        <ProductGallery
          mainImage={product.imagePath}
          gallery={product.gallery || []}
          title={displayTitle}
        />


        {/* Stock Status */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.stockStatus')}</h3>
            <div className="space-y-3">
              {getStockStatusBadge()}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.stockQuantity}</p>
                  <p className="text-xs text-muted-foreground">{t('products.currentStock')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.lowQuantity}</p>
                  <p className="text-xs text-muted-foreground">{t('products.lowAlertThreshold')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.unitMeasure}</p>
                  <p className="text-xs text-muted-foreground">{t('products.unit')}</p>
                </div>
              </div>
              {product.enableLowStockAlert && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t('products.lowStockAlertsOn')}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdjustStock}
                className="w-full h-10"
              >
                {t('products.adjust')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Identifiers */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.identifiers')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('products.sku')}</p>
                  <p className="text-sm font-medium">{product.sku}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleCopy(product.sku, 'SKU')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="border-t border-border pt-2" />
              {product.hasBarcode ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('products.barcode')}</p>
                    <p className="text-sm font-medium">{product.barcode}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => product.barcode && handleCopy(product.barcode, t('products.barcode'))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('products.barcode')}</p>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-medium">{t('products.notLinked')}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLinkBarcode}
                    className="h-10 gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    {t('products.link')}
                  </Button>
                </div>
              )}
              {product.articleNo && (
                <>
                  <div className="border-t border-border pt-2" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('products.articleNo')}</p>
                      <p className="text-sm font-medium">{product.articleNo}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopy(product.articleNo, t('products.articleNo'))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.pricing')}</h3>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('products.price')}</p>
              <p className="text-lg font-semibold">
                €{product.pricing?.priceEur?.toFixed(2) || product.pricing?.price?.toFixed(2) || '0.00'} / {product.pricing?.priceAl?.toLocaleString() || '0'} L
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sale Info */}
        {product.saleInfo?.isOnSale && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{t('products.saleInfo')}</h3>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                  {t('products.readOnly')}
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {t('products.onSale')}
                </Badge>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    {t('products.type')}: {product.saleInfo.discountType === 'percentage' 
                      ? `${product.saleInfo.discountPercent || product.saleInfo.discountValue}% ${t('products.off')} (${t('products.percentage')})`
                      : `€${product.saleInfo.discountAmount?.toFixed(2) || '0.00'} ${t('products.off')} (${t('products.fixed')})`}
                  </p>
                  <p className="text-muted-foreground">
                    {t('products.salePrice')}: €{product.saleInfo.salePriceEur?.toFixed(2) || product.saleInfo.salePrice?.toFixed(2) || '0.00'} / {product.saleInfo.salePriceAl?.toLocaleString() || '0'} L
                  </p>
                  {product.saleInfo.discountAmount && (
                    <p className="text-muted-foreground">
                      {t('products.youSave')}: €{product.saleInfo.discountAmount.toFixed(2)}
                    </p>
                  )}
                  {product.saleInfo.dateSaleStart && product.saleInfo.dateSaleEnd && (
                    <p className="text-muted-foreground">
                      {t('products.valid')}: {format(new Date(product.saleInfo.dateSaleStart), 'MMM d')} - {format(new Date(product.saleInfo.dateSaleEnd), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Stats */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.activityStats')}</h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('products.totalActivities')}: {product.stats?.totalActivities || 0}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.stats?.breakdown?.adjustments || 0}</p>
                  <p className="text-xs text-muted-foreground">{t('products.adjusts')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.stats?.breakdown?.scans || 0}</p>
                  <p className="text-xs text-muted-foreground">{t('products.scans')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.stats?.breakdown?.transfers || 0}</p>
                  <p className="text-xs text-muted-foreground">{t('products.transfer')}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {product.stats?.firstActivityAt && (
                  <p>{t('products.first')}: {format(new Date(product.stats.firstActivityAt), 'MMM d, yyyy')}</p>
                )}
                {product.stats?.lastActivityAt && (
                  <p>{t('products.last')}: {format(new Date(product.stats.lastActivityAt), 'MMM d, yyyy')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex-1 min-w-0">{t('products.recentActivity')}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewHistory}
                className="h-8 shrink-0 gap-1 px-2"
              >
                {t('products.viewAll')}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {product.stats?.recentActivities?.map((activity: any) => (
                <div key={activity.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm font-medium">{getActivityLabel(activity.type)}</span>
                    {activity.quantityChange && (
                      <span className={`text-sm font-medium ${activity.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {activity.quantityChange > 0 ? '+' : ''}{activity.quantityChange} {t('products.units')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.createdAt), 'MMM d, yyyy, h:mm a')}
                  </p>
                  {activity.previousQuantity !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {activity.previousQuantity} → {activity.newQuantity} • "{activity.notes}"
                    </p>
                  )}
                  {activity.createdBy && (
                    <p className="text-xs text-muted-foreground">
                      {t('products.by')}: {activity.createdBy.name}
                    </p>
                  )}
                  {activity.toWarehouse && (
                    <p className="text-xs text-muted-foreground">
                      {t('products.to')}: {activity.toWarehouse.name}
                    </p>
                  )}
                  <div className="border-t border-border pt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{t('products.description')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="h-8 w-8 p-0"
              >
                {descriptionExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {descriptionExpanded && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground">{product.description}</p>
                </div>
                {product.descriptionAl && (
                  <div>
                    <p className="text-sm text-foreground">{product.descriptionAl}</p>
                  </div>
                )}
                {(product.weight || product.dimensions) && (
                  <div className="space-y-1 pt-2 border-t border-border">
                    {product.weight && (
                      <p className="text-sm text-muted-foreground">
                        {t('products.weight')}: {product.weight}g
                      </p>
                    )}
                    {product.dimensions && (
                      <p className="text-sm text-muted-foreground">
                        {t('products.dimensions')}: {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.quickActions')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdjustStock}
                className="h-10 gap-2"
              >
                <Package className="h-4 w-4" />
                {t('products.adjustStock')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransfer}
                className="h-10 gap-2"
              >
                <Truck className="h-4 w-4" />
                {t('products.transfer')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewHistory}
                className="h-10 gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                {t('products.fullHistory')}
              </Button>
              {!product.hasBarcode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLinkBarcode}
                  className="h-10 gap-2"
                >
                  <Tag className="h-4 w-4" />
                  {t('products.linkBarcode')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        product={product}
      />
    </div>
  );
}
