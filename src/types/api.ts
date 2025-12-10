export interface Product {
  id: string;
  title: string;
  titleAl: string;
  sku: string;
  barcode: string;
  articleNo: string;
  price: number;
  stockQuantity: number;
  lowQuantity: number;
  enableStock: boolean;
  unitMeasure: string;
  category: {
    id: string;
    name: string;
  } | null;
  brand: {
    id: string;
    name: string;
  } | null;
  imagePath: string | null;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
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

