# Mock Data Review - Screens Using Static Data

**Document Version:** 1.0  
**Created:** December 11, 2025  
**Status:** ⚠️ **REVIEW REQUIRED**

---

## Summary

This document identifies all screens that are still using mock/static data instead of API calls. These screens need to be updated to use the implemented API hooks.

---

## 🔴 Screens Using Mock Data (Need API Integration)

### 1. ActivitiesScreen.tsx
**File:** `src/features/activities/ActivitiesScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockActivities` - Array of activity objects
- `mockSummary` - Summary statistics object
- `mockWarehouses` - Warehouse list for filters
- `mockStaff` - Staff list for filters

**API Hooks Available:**
- ✅ `useActivities()` - List activities
- ✅ `useActivitySummary()` - Get summary stats
- ✅ `useActivity()` - Get activity details
- ✅ `useMyActivities()` - Get my activities
- ✅ `useWarehouses()` - Get warehouses (already implemented)

**Action Required:**
- [ ] Replace `mockActivities` with `useActivities()` hook
- [ ] Replace `mockSummary` with `useActivitySummary()` hook
- [ ] Replace `mockWarehouses` with `useWarehouses()` hook
- [ ] Remove `mockStaff` or fetch from API if endpoint exists
- [ ] Add loading states with Skeleton components
- [ ] Add error handling

---

### 2. TransfersScreen.tsx
**File:** `src/features/transfers/TransfersScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockTransfers` - Array of transfer objects
- `mockWarehouses` - Warehouse list for dropdowns
- `mockProducts` - Product list for search/selection

**API Hooks Available:**
- ✅ `useStockTransfers()` - List transfers
- ✅ `useCreateTransfer()` - Create transfer
- ✅ `useCompleteTransfer()` - Complete transfer
- ✅ `useCancelTransfer()` - Cancel transfer
- ✅ `useWarehouses()` - Get warehouses
- ✅ `useProducts()` - Get products

**Action Required:**
- [ ] Replace `mockTransfers` with `useStockTransfers()` hook
- [ ] Replace `mockWarehouses` with `useWarehouses()` hook
- [ ] Replace `mockProducts` with `useProducts()` hook
- [ ] Update `filteredTransfers` to use API data
- [ ] Implement create transfer functionality with API
- [ ] Implement complete transfer functionality with API
- [ ] Add loading states with Skeleton components

---

### 3. TransferDetailsScreen.tsx
**File:** `src/features/transfers/TransferDetailsScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockTransfers` - Record of transfer objects by ID

**API Hooks Available:**
- ✅ `useStockTransfer()` - Get transfer details

**Action Required:**
- [ ] Replace `mockTransfers[id]` with `useStockTransfer(id)` hook
- [ ] Add loading state with Skeleton components
- [ ] Add error handling for not found
- [ ] Update complete/cancel handlers to use API hooks

---

### 4. CountsScreen.tsx
**File:** `src/features/counts/CountsScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockCounts` - Array of stock count objects
- `mockWarehouses` - Warehouse list for filters

**API Hooks Available:**
- ✅ `useStockCounts()` - List stock counts
- ✅ `useCreateStockCount()` - Start stock count
- ✅ `useWarehouses()` - Get warehouses

**Action Required:**
- [ ] Replace `mockCounts` with `useStockCounts()` hook
- [ ] Replace `mockWarehouses` with `useWarehouses()` hook
- [ ] Update filtering logic to use API data
- [ ] Implement start count functionality with API
- [ ] Add loading states with Skeleton components

---

### 5. CountDetailsScreen.tsx
**File:** `src/features/counts/CountDetailsScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockCounts` - Record of count objects by ID
- `mockCountItems` - Array of count items

**API Hooks Available:**
- ✅ `useStockCount()` - Get stock count details

**Action Required:**
- [ ] Replace `mockCounts[id]` with `useStockCount(id)` hook
- [ ] Use items from API response (count details include items)
- [ ] Add loading state with Skeleton components
- [ ] Add error handling for not found
- [ ] Update continue counting navigation

---

### 6. CountingScreen.tsx
**File:** `src/features/counts/CountingScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockCount` - Current count object
- `mockProducts` - Array of products to count
- `mockCountedItems` - Array of already counted items

**API Hooks Available:**
- ✅ `useStockCount()` - Get current count details
- ✅ `useUpdateStockCount()` - Update count with items
- ✅ `useCompleteStockCount()` - Complete count

**Action Required:**
- [ ] Replace `mockCount` with `useStockCount(id)` hook
- [ ] Replace `mockProducts` with products from count details or warehouse products
- [ ] Replace `mockCountedItems` with items from count details
- [ ] Implement save & next functionality with `useUpdateStockCount()`
- [ ] Implement complete functionality with `useCompleteStockCount()`
- [ ] Add loading states

---

### 7. CountReportScreen.tsx
**File:** `src/features/counts/CountReportScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockCounts` - Record of count objects by ID
- `mockCountItems` - Array of count items

**API Hooks Available:**
- ✅ `useStockCount()` - Get stock count details (includes all items)

**Action Required:**
- [ ] Replace `mockCounts[id]` with `useStockCount(id)` hook
- [ ] Use items from API response
- [ ] Add loading state with Skeleton components
- [ ] Add error handling

---

### 8. AdjustmentsScreen.tsx
**File:** `src/features/adjustments/AdjustmentsScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockAdjustments` - Array of adjustment objects
- `mockProducts` - Product list for search
- `mockWarehouses` - Warehouse list for filters

**API Hooks Available:**
- ✅ `useMyAdjustments()` - Get my adjustments
- ✅ `useProducts()` - Get products
- ✅ `useWarehouses()` - Get warehouses
- ✅ `useStockAdjustment()` - Create adjustment (already implemented)

**Action Required:**
- [ ] Replace `mockAdjustments` with `useMyAdjustments()` hook
- [ ] Replace `mockProducts` with `useProducts()` hook
- [ ] Replace `mockWarehouses` with `useWarehouses()` hook
- [ ] Update filtering logic to use API data
- [ ] Add loading states with Skeleton components

---

### 9. AdjustmentDetailsScreen.tsx
**File:** `src/features/adjustments/AdjustmentDetailsScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockAdjustments` - Record of adjustment objects by ID

**API Hooks Available:**
- ✅ `useActivity()` - Get activity details (adjustments are activities)

**Action Required:**
- [ ] Replace `mockAdjustments[id]` with `useActivity(id)` hook
- [ ] Add loading state with Skeleton components
- [ ] Add error handling for not found

**Note:** Adjustments are tracked as activities, so use the activity endpoint.

---

### 10. ScanScreen.tsx
**File:** `src/features/scanning/ScanScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `recentScans` - Array of recent scan objects (hardcoded)

**API Hooks Available:**
- ✅ `useScanHistory()` - Get scan history

**Action Required:**
- [ ] Replace `recentScans` with `useScanHistory({ limit: 5 })` hook
- [ ] Add loading state
- [ ] Map API response format to display format

---

### 11. LinkBarcodeScreen.tsx
**File:** `src/features/products/LinkBarcodeScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockProducts` - Record of product objects by ID

**API Hooks Available:**
- ✅ `useProduct()` - Get product details

**Action Required:**
- [ ] Replace `mockProducts[id]` with `useProduct(id)` hook
- [ ] Add loading state with Skeleton components
- [ ] Add error handling

---

### 12. AdjustStockModal.tsx
**File:** `src/features/products/AdjustStockModal.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockWarehouses` - Warehouse list for dropdown
- `mockReasons` - Array of reason strings

**API Hooks Available:**
- ✅ `useWarehouses()` - Get warehouses
- ✅ `useStockAdjustment()` - Create adjustment (already implemented)

**Action Required:**
- [ ] Replace `mockWarehouses` with `useWarehouses()` hook
- [ ] Keep `mockReasons` as static list (no API endpoint for this)
- [ ] Already uses `useStockAdjustment()` for saving ✅

---

### 13. MyWarehousesScreen.tsx
**File:** `src/features/auth/MyWarehousesScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockWarehouses` - Array of warehouse objects

**API Hooks Available:**
- ✅ `useWarehouses()` - Get warehouses

**Action Required:**
- [ ] Replace `mockWarehouses` with `useWarehouses()` hook
- [ ] Filter by user's `warehouseIds` from permissions
- [ ] Add loading state

---

### 14. NotificationsScreen.tsx
**File:** `src/features/notifications/NotificationsScreen.tsx`  
**Status:** ⚠️ **USES MOCK DATA**

**Mock Data Used:**
- `mockNotifications` - Array of notification objects

**API Hooks Available:**
- ❌ **NO API ENDPOINT** - Notifications API not specified in integration guide

**Action Required:**
- [ ] Check if notifications API exists
- [ ] If exists, create hook and integrate
- [ ] If not, mark as future feature

---

## ✅ Screens Already Using API (No Changes Needed)

### 1. DashboardScreen.tsx
**File:** `src/features/dashboard/DashboardScreen.tsx`  
**Status:** ✅ **USES API**

**API Hook:** `useDashboard()` ✅

---

### 2. ProductsScreen.tsx
**File:** `src/features/products/ProductsScreen.tsx`  
**Status:** ✅ **USES API**

**API Hook:** `useProducts()` ✅  
**Note:** Has unused `_mockProducts` (marked with @ts-expect-error)

---

### 3. ProductDetailsScreen.tsx
**File:** `src/features/products/ProductDetailsScreen.tsx`  
**Status:** ✅ **USES API**

**API Hook:** `useProduct()` ✅

---

### 4. EditProductScreen.tsx
**File:** `src/features/products/EditProductScreen.tsx`  
**Status:** ✅ **USES API**

**API Hooks:** 
- `useProduct()` ✅
- `useCategories()` ✅
- `useBrands()` ✅
- `useUpdateProduct()` ✅

---

### 5. WarehousesScreen.tsx
**File:** `src/features/warehouses/WarehousesScreen.tsx`  
**Status:** ✅ **USES API**

**API Hook:** `useWarehouses()` ✅

---

### 6. ProfileScreen.tsx
**File:** `src/features/auth/ProfileScreen.tsx`  
**Status:** ✅ **USES API**

**API Hooks:**
- `useUpdateProfile()` ✅
- `useChangePassword()` ✅
- `useLogout()` ✅

---

### 7. OperationsScreen.tsx
**File:** `src/features/activities/OperationsScreen.tsx`  
**Status:** ✅ **USES API**

**API Hook:** `useOperationsOverview()` ✅

---

### 8. ScanResultScreen.tsx
**File:** `src/features/scanning/ScanResultScreen.tsx`  
**Status:** ✅ **USES API DATA**

**Note:** Receives data from route state (from ScanScreen API call) ✅

---

### 9. SearchProductsScreen.tsx
**File:** `src/features/scanning/SearchProductsScreen.tsx`  
**Status:** ✅ **USES API**

**API Hook:** `useScanSearch()` ✅

---

### 10. CreateProductFromScanScreen.tsx
**File:** `src/features/scanning/CreateProductFromScanScreen.tsx`  
**Status:** ✅ **USES API**

**API Hooks:**
- `useCreateProductFromScan()` ✅
- `useCategories()` ✅

---

### 11. RecentLoginsScreen.tsx
**File:** `src/features/auth/RecentLoginsScreen.tsx`  
**Status:** ✅ **USES API**

**API Hook:** Already implemented ✅

---

## 📊 Summary Statistics

| Category | Total Screens | Using API | Using Mock Data | Not Implemented |
|----------|---------------|-----------|-----------------|-----------------|
| **Products** | 4 | 3 | 1 (LinkBarcode) | 0 |
| **Scanning** | 6 | 5 | 1 (ScanScreen recentScans) | 0 |
| **Stock Operations** | 8 | 0 | 8 | 0 |
| **Activities** | 2 | 1 | 1 | 0 |
| **Warehouses** | 2 | 1 | 1 | 0 |
| **Auth** | 2 | 1 | 1 | 0 |
| **Dashboard** | 1 | 1 | 0 | 0 |
| **Notifications** | 1 | 0 | 1 | 0 |
| **Modals** | 1 | 0 (partial) | 1 (partial) | 0 |
| **TOTAL** | **27** | **13** | **14** | **0** |

---

## 🎯 Priority Order for Implementation

### High Priority (Critical Functionality)
1. **TransfersScreen** - Core stock transfer functionality
2. **CountsScreen** - Core stock count functionality
3. **ActivitiesScreen** - Main activity log
4. **AdjustmentsScreen** - Stock adjustments list

### Medium Priority (Details & Modals)
5. **TransferDetailsScreen** - Transfer details view
6. **CountDetailsScreen** - Count details view
7. **AdjustmentDetailsScreen** - Adjustment details view
8. **CountingScreen** - Active count interface
9. **CountReportScreen** - Count report view
10. **ScanScreen** - Recent scans display

### Low Priority (Supporting Screens)
11. **LinkBarcodeScreen** - Link barcode functionality
12. **AdjustStockModal** - Warehouse dropdown
13. **MyWarehousesScreen** - Warehouse list
14. **NotificationsScreen** - Notifications (if API exists)

---

## 📝 Implementation Notes

### Common Patterns to Apply

1. **Replace Mock Data:**
   ```typescript
   // Before
   const mockData = [...];
   const items = mockData;
   
   // After
   const { data: items = [], isLoading } = useHook();
   ```

2. **Add Loading States:**
   ```typescript
   {isLoading ? (
     <Skeleton className="h-20 w-full" />
   ) : (
     items.map(...)
   )}
   ```

3. **Add Error Handling:**
   ```typescript
   if (error) {
     return <ErrorState />;
   }
   ```

4. **Update Filtering:**
   ```typescript
   // Before: Client-side filtering
   const filtered = mockData.filter(...);
   
   // After: Server-side filtering via API params
   const { data } = useHook({ status, warehouseId, ... });
   ```

---

## 🔧 Specific Implementation Details

### ActivitiesScreen
- Use `useActivities()` with filters (type, source, warehouse, staff, dateRange)
- Use `useActivitySummary()` for summary cards
- Use `useWarehouses()` for warehouse filter dropdown
- Staff filter: May need to extract from activities or create staff endpoint

### TransfersScreen
- Use `useStockTransfers()` with status filter
- Use `useWarehouses()` for warehouse dropdowns
- Use `useProducts()` for product search
- Implement create/complete/cancel with API hooks

### CountsScreen
- Use `useStockCounts()` with status and warehouse filters
- Use `useWarehouses()` for warehouse filter
- Implement start count with `useCreateStockCount()`

### CountingScreen
- Use `useStockCount(id)` to get current count details
- Use `useUpdateStockCount()` for save & next
- Use `useCompleteStockCount()` for completion
- Products to count: May need warehouse products endpoint or use count scope

### AdjustmentsScreen
- Use `useMyAdjustments()` for adjustments list
- Use `useProducts()` for product search
- Use `useWarehouses()` for warehouse filter

### ScanScreen
- Use `useScanHistory({ limit: 5 })` for recent scans
- Map API response format to display format

---

## ✅ Next Steps

1. **Implement High Priority Screens First:**
   - TransfersScreen
   - CountsScreen
   - ActivitiesScreen
   - AdjustmentsScreen

2. **Then Implement Details Screens:**
   - TransferDetailsScreen
   - CountDetailsScreen
   - AdjustmentDetailsScreen
   - CountingScreen
   - CountReportScreen

3. **Finally Implement Supporting Screens:**
   - ScanScreen (recent scans)
   - LinkBarcodeScreen
   - AdjustStockModal (warehouse dropdown)
   - MyWarehousesScreen

4. **Check Notifications:**
   - Verify if notifications API exists
   - If yes, implement
   - If no, mark as future feature

---

**Document Version:** 1.0  
**Created:** December 11, 2025  
**Status:** Ready for Implementation
