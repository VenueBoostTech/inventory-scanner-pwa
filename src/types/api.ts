export interface Product {
  id: string;
  title: string;
  titleAl: string | null;
  sku: string;
  barcode: string | null;
  hasBarcode: boolean;
  articleNo: string;
  stockQuantity: number;
  lowQuantity: number;
  enableStock: boolean;
  enableLowStockAlert: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_tracked';
  unitMeasure: string;
  category: {
    id: string;
    name: string;
    nameAl?: string | null;
  } | null;
  categories?: Array<{
    id: string;
    name: string;
    nameAl?: string | null;
    categoryUrl?: string;
  }>;
  brand: {
    id: string;
    name: string;
  } | null;
  imagePath: string | null;
  imageThumbnailPath?: string | null;
  description?: string | null;
  descriptionAl?: string | null;
  shortDescription?: string | null;
  shortDescriptionAl?: string | null;
  pricing?: {
    price: number;
    priceAl?: number;
    priceEur?: number;
  };
  saleInfo?: {
    isOnSale: boolean;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    discountAmount?: number;
    discountPercent?: number;
    salePrice?: number;
    salePriceAl?: number;
    salePriceEur?: number;
    dateSaleStart?: string;
    dateSaleEnd?: string;
  } | null;
  productType?: string;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  gallery?: Array<{
    id: string;
    imagePath: string;
    imageThumbnailPath?: string;
    sortOrder: number;
  }>;
  stats?: {
    totalActivities: number;
    breakdown: {
      adjustments: number;
      scans: number;
      transfers: number;
      counts: number;
    };
    firstActivityAt?: string;
    lastActivityAt?: string;
    recentActivities?: Array<{
      id: string;
      type: string;
      source: string;
      quantityChange?: number;
      previousQuantity?: number;
      newQuantity?: number;
      notes?: string;
      createdAt: string;
      createdBy?: {
        id: string;
        name: string;
      };
      toWarehouse?: {
        name: string;
      };
    }>;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  totalProducts: number;
  totalStock: number;
  isActive: boolean;
}

export interface ScanResult {
  result: 'found' | 'not_found';
  message: string;
  product?: Product;
  barcode?: string;
  canAddProduct?: boolean;
}

export interface Activity {
  id: string;
  activityType: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  source: string;
  product: {
    id: string;
    title: string;
    sku: string;
    imagePath: string | null;
  };
  staff: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface StockAdjustment {
  productId: string;
  adjustmentType: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
  warehouseId: string;
}

