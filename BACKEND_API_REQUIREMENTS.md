# Backend API Requirements for Product Screens

**Document Version:** 2.0  
**Created:** December 11, 2025  
**Last Updated:** December 11, 2025  
**Status:** ✅ **CONFIRMED - All Requirements Met**

---

## Summary

This document outlines the backend API requirements for the Product List and Product Details screens implementation. Please review and confirm if any changes are needed to match the frontend expectations.

---

## ✅ Already Implemented (No Changes Needed)

### 1. GET `/inventory-app/products`
- ✅ Supports search parameter
- ✅ Supports filtering by `stockStatus`, `categoryId`, `hasBarcode`
- ✅ Returns array of products with basic fields

### 2. GET `/inventory-app/products/:productId`
- ✅ Returns detailed product information
- ✅ Includes pricing, category, brand (optional)

### 3. PUT `/inventory-app/products/:productId`
- ✅ Updates product information
- ✅ Returns updated product

### 4. PUT `/inventory-app/products/:productId/link-barcode`
- ✅ Links barcode to product
- ✅ Returns 409 if barcode already used

### 5. POST `/inventory-app/stock/adjust`
- ✅ Creates stock adjustment
- ✅ Returns adjustment details

---

## 🔍 Review Required - Data Structure

### Product Response Structure

The frontend expects the following structure from `GET /inventory-app/products/:productId`:

```typescript
{
  id: string;
  title: string;
  titleAl: string | null;
  sku: string;
  barcode: string | null;
  hasBarcode: boolean;  // ⚠️ IMPORTANT: Frontend uses this flag
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
  brand: {
    id: string;
    name: string;
  } | null;  // ⚠️ Should be null if no brand, not omitted
  imagePath: string | null;
  imageThumbnailPath?: string | null;
  
  // Pricing structure
  pricing?: {
    price: number;        // Default price
    priceAl?: number;     // Price in LEK
    priceEur?: number;    // Price in EUR
  };
  
  // Sale information (read-only)
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
  
  // Gallery images
  gallery?: Array<{
    id: string;
    imagePath: string;
    imageThumbnailPath?: string;
    sortOrder: number;
  }>;
  
  // Activity statistics
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
  
  // Additional fields
  description?: string | null;
  descriptionAl?: string | null;
  shortDescription?: string | null;
  shortDescriptionAl?: string | null;
  productType?: string;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt?: string;
  updatedAt?: string;
}
```

### Key Points to Verify:

1. **`hasBarcode` field**: Frontend uses this boolean flag to determine if barcode is linked. Please ensure this is included in the response.

2. **`pricing` structure**: Frontend expects a nested `pricing` object with `price`, `priceAl`, and `priceEur`. If your API returns `price`, `priceAl`, `priceEur` at the root level, we can adjust the frontend.

3. **`saleInfo` structure**: Frontend expects sale information in a nested `saleInfo` object. If this is not available, the frontend will gracefully hide the sale section.

4. **`stats` structure**: Frontend expects activity statistics in a nested `stats` object. If this is not available, the frontend will show zeros.

5. **`gallery` array**: Frontend expects gallery images in a `gallery` array. If only `imagePath` is available, the frontend will use that as the main image.

6. **`brand` field**: Should be `null` (not omitted) if product has no brand. Frontend checks for `product.brand` to conditionally show brand information.

---

## 📋 Questions for Backend Team

1. **Pricing Structure**: 
   - Does your API return pricing as a nested object (`pricing.price`, `pricing.priceAl`, `pricing.priceEur`) or at root level (`price`, `priceAl`, `priceEur`)?
   - **Action**: If root level, we'll update frontend to match.

2. **Sale Information**:
   - Is sale/discount information available in the product response?
   - If yes, what is the structure?
   - **Action**: If not available, frontend will hide sale section.

3. **Activity Statistics**:
   - Are activity statistics (`stats`) included in the product response?
   - If yes, does it match the expected structure?
   - **Action**: If not available, frontend will show zeros.

4. **Gallery Images**:
   - Are multiple images supported via a `gallery` array?
   - Or is only a single `imagePath` available?
   - **Action**: Frontend supports both scenarios.

5. **Product List Response**:
   - Does `GET /inventory-app/products` return `{ data: Product[] }` or just `Product[]`?
   - **Action**: Frontend currently handles both but prefers `{ data: Product[] }`.

6. **Filtering**:
   - Does the products endpoint support filtering by `hasBarcode` (boolean)?
   - **Action**: If not, we'll handle filtering client-side.

---

## 🔧 Potential Frontend Adjustments Needed

Based on backend responses, we may need to:

1. **Adjust pricing field access** (if pricing is at root level instead of nested)
2. **Add data transformation** (if response structure differs)
3. **Handle missing optional fields** (saleInfo, stats, gallery)
4. **Update API hook** (if response wrapper differs)

---

## ✅ What's Already Working

- ✅ Product list with search and filters
- ✅ Product details display
- ✅ Stock adjustment modal
- ✅ Link barcode functionality
- ✅ Edit product screen
- ✅ Gallery component (if images available)
- ✅ Loading states and error handling
- ✅ Localization support

---

## 📝 Next Steps

1. **Backend Team**: Review this document and confirm:
   - Which fields match exactly
   - Which fields need adjustment
   - Which optional fields are available

2. **Frontend Team**: After backend confirmation:
   - Adjust field access if needed
   - Add data transformation if needed
   - Test with real API responses

---

## Contact

If you have questions or need clarification, please reach out to the frontend team.

---

**Document Version:** 1.0  
**Last Updated:** December 11, 2025
