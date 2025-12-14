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
  Smartphone,
  Monitor,
  Store,
  Link as LinkIcon,
  ShoppingCart,
} from 'lucide-react';
import { format } from 'date-fns';
import { ProductGallery } from './ProductGallery';
import { AdjustStockModal } from './AdjustStockModal';
import { authStore } from '@/stores/authStore';

export function ProductDetailsScreen() {
  const { t, language } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(true);
  const canEditProduct = authStore((state) => state.canEditProduct());
  const canAdjustStock = authStore((state) => state.canAdjustStock());
  const canInitiateTransfer = authStore((state) => state.canInitiateTransfer());

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
    switch (type?.toLowerCase()) {
      case 'adjustment':
        return Package;
      case 'transfer':
        return Truck;
      case 'count':
        return ClipboardList;
      case 'scan':
        return ClipboardList;
      case 'order_created':
      case 'order_cancelled':
      case 'order_returned':
      case 'order_refunded':
        return ShoppingCart;
      default:
        return Package;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    if (!type) return '—';
    switch (type.toLowerCase()) {
      case 'adjustment':
        return t('operations.adjustment');
      case 'transfer':
        return t('operations.transfer');
      case 'count':
        return t('operations.count');
      case 'order_created':
        return t('operations.orderCreated');
      case 'order_cancelled':
        return t('operations.orderCancelled');
      case 'order_returned':
        return t('operations.orderReturned');
      case 'order_refunded':
        return t('operations.orderRefunded');
      default:
        return type;
    }
  };

  const getSourceIcon = (source: string) => {
    const normalizedSource = source?.toUpperCase();
    switch (normalizedSource) {
      case 'MOBILE_SCANNING':
        return Smartphone;
      case 'PANDACOMET':
        return Monitor;
      case 'ORDER':
        return Store;
      case 'WOOCOMMERCE':
      case 'WEBHOOK':
        return LinkIcon;
      default:
        return Monitor;
    }
  };

  const getReasonLabel = (reason: string) => {
    if (!reason) return '—';
    const reasonMap: Record<string, string> = {
      'received_shipment': t('operations.receivedShipment'),
      'return_customer': t('operations.returnCustomer'),
      'found_during_count': t('operations.foundDuringCount'),
      'damaged_items': t('operations.damagedItems'),
      'expired_items': t('operations.expiredItems'),
      'theft_loss': t('operations.theftLoss'),
      'inventory_correction': t('operations.inventoryCorrection'),
      'other': t('common.other'),
    };
    return reasonMap[reason] || reason;
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

  const displayTitle = product.titleAl || product.title || '—';

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
            <h1 className="text-xl font-semibold text-foreground">
              {product.titleAl || product.title || '—'}
            </h1>
            {product.titleAl && product.title && product.titleAl !== product.title && (
              <p className="text-sm text-muted-foreground mt-1">{product.title}</p>
            )}
            {!product.titleAl && product.title && (
              <p className="text-sm text-muted-foreground mt-1">{product.title}</p>
            )}
            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm font-medium text-muted-foreground">{t('products.categories')}:</span>
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
            {product.brand && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{t('products.brand')}: {product.brand.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canEditProduct && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="h-10 w-10 p-0"
                title={t('common.edit')}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
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
                  <p className="text-sm text-muted-foreground">{t('products.stock')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  {product.enableLowStockAlert ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-1">
                      {t('products.enabled')}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-50 text-red-700 border-red-200 mb-1">
                      {t('products.disabled')}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground">{t('products.alertStatus')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.lowQuantity ?? 0}</p>
                  <p className="text-sm text-muted-foreground">{t('products.lowQty')}</p>
                </div>
              </div>
              {product.enableLowStockAlert && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t('products.lowStockAlertsOn')}</span>
                </div>
              )}
            </div>
            {canAdjustStock && (
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
            )}
          </CardContent>
        </Card>

        {/* Identifiers */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.identifiers')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('products.sku')}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">{t('products.barcode')}</p>
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
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('products.barcode')}</p>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <p className="text-sm font-medium">{t('products.notLinked')}</p>
                      </div>
                    </div>
                  </div>
                  {canEditProduct && (
                    <div className="border-t border-border pt-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLinkBarcode}
                        className="w-full h-10 gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {t('products.linkBarcode')}
                      </Button>
                    </div>
                  )}
                </>
              )}
              {product.articleNo && (
                <>
                  <div className="border-t border-border pt-2" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('products.articleNo')}</p>
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
        {product.pricing && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <h3 className="text-sm font-semibold mb-3">{t('products.pricing')}</h3>
              <div className="space-y-3">
                {/* Main currency (price is the final version) */}
                {product.pricing.price && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Price (ALL)
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {typeof product.pricing.price === 'object' && product.pricing.price !== null
                        ? (product.pricing.price as any).formatted || `${(product.pricing.price as any).amount} ${(product.pricing.price as any).currencySymbol || 'L'}`
                        : `${product.pricing.price} L`}
                    </p>
                  </div>
                )}
                {/* EUR price */}
                {product.pricing.priceEur && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Price (EUR)</p>
                    <p className="text-lg font-semibold text-foreground">
                      {typeof product.pricing.priceEur === 'object' && product.pricing.priceEur !== null
                        ? (product.pricing.priceEur as any).formatted || `${(product.pricing.priceEur as any).currencySymbol || '€'}${(product.pricing.priceEur as any).amount.toFixed(2)}`
                        : `€${product.pricing.priceEur.toFixed(2)}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <p className="text-sm text-muted-foreground">{t('products.adjusts')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.stats?.breakdown?.scans || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('products.scans')}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-semibold">{product.stats?.breakdown?.transfers || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('products.transfer')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                {product.stats?.firstActivityAt && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t('products.firstActivity')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {typeof product.stats.firstActivityAt === 'object' && product.stats.firstActivityAt !== null
                        ? (product.stats.firstActivityAt as any).formattedDateTime || (product.stats.firstActivityAt as any).date || '—'
                        : product.stats.firstActivityAt || '—'}
                    </p>
                  </div>
                )}
                {product.stats?.lastActivityAt && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t('products.mostRecentActivity')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {typeof product.stats.lastActivityAt === 'object' && product.stats.lastActivityAt !== null
                        ? (product.stats.lastActivityAt as any).formattedDateTime || (product.stats.lastActivityAt as any).date || '—'
                        : product.stats.lastActivityAt || '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <h3 className="text-sm font-semibold mb-3">{t('products.recentActivity')}</h3>
            <div className="space-y-3">
              {product.stats?.recentActivities?.map((activity: any) => {
                const TypeIcon = getActivityIcon(activity.activityType);
                const SourceIconComponent = getSourceIcon(activity.source);
                return (
                  <div key={activity.id} className="space-y-2 pb-3 border-b border-border last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{getActivityTypeLabel(activity.activityType)}</span>
                      {activity.quantity !== 0 && (
                        <span className={`text-sm font-semibold ${activity.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {activity.quantity > 0 ? '+' : ''}{activity.quantity}
                        </span>
                      )}
                    </div>
                    {(activity.stockBefore != null && activity.stockAfter != null) && (
                      <div className="text-sm text-muted-foreground pl-6">
                        {activity.stockBefore} → {activity.stockAfter}
                      </div>
                    )}
                    <div className="flex items-center gap-3 pl-6">
                      <div className="flex items-center gap-1.5">
                        <SourceIconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {activity.createdAt?.formattedDateTime || activity.createdAt?.date || format(new Date(activity.createdAt), 'MMM d, yyyy, h:mm a')}
                        </span>
                      </div>
                      {activity.staff && (
                        <span className="text-sm text-muted-foreground">
                          • {activity.staff.name}
                        </span>
                      )}
                      {!activity.staff && (
                        <span className="text-sm text-muted-foreground">
                          • {t('operations.system')}
                        </span>
                      )}
                    </div>
                    {activity.reason && (
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{t('operations.reason')}:</span> <span className="font-medium">{getReasonLabel(activity.reason)}</span>
                        </p>
                      </div>
                    )}
                    {activity.notes && (
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{t('operations.notes')}:</span> <span className="font-medium">{activity.notes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewHistory}
                className="w-full h-8 gap-1"
              >
                {t('products.viewAll')}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Short Description */}
        {(product.shortDescriptionAl || product.shortDescription) && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <h3 className="text-sm font-semibold mb-3">{t('products.shortDescription')}</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Albanian</p>
                  <p className="text-sm text-foreground">
                    {product.shortDescriptionAl && product.shortDescriptionAl.trim() !== '<p><br></p>' && product.shortDescriptionAl.trim() !== ''
                      ? product.shortDescriptionAl.replace(/<[^>]*>/g, '').trim() || '—'
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">English</p>
                  <p className="text-sm text-foreground">
                    {product.shortDescription && product.shortDescription.trim() !== '<p><br></p>' && product.shortDescription.trim() !== ''
                      ? product.shortDescription.replace(/<[^>]*>/g, '').trim() || '—'
                      : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Albanian</p>
                  <div className="text-sm text-foreground">
                    {product.descriptionAl && product.descriptionAl.trim() !== '<p><br></p>' && product.descriptionAl.trim() !== ''
                      ? <div dangerouslySetInnerHTML={{ __html: product.descriptionAl }} />
                      : <span>—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">English</p>
                  <div className="text-sm text-foreground">
                    {product.description && product.description.trim() !== '<p><br></p>' && product.description.trim() !== ''
                      ? <div dangerouslySetInnerHTML={{ __html: product.description }} />
                      : <span>—</span>}
                  </div>
                </div>
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
              {canAdjustStock && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdjustStock}
                  className="h-10 gap-2"
                >
                  <Package className="h-4 w-4" />
                  {t('products.adjustStock')}
                </Button>
              )}
              {canInitiateTransfer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTransfer}
                  className="h-10 gap-2"
                >
                  <Truck className="h-4 w-4" />
                  {t('products.transfer')}
                </Button>
              )}
              {!product.hasBarcode && canEditProduct && (
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
