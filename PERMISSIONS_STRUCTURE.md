# Comprehensive Permission Structure for Inventory App

## Architecture: Two-Layer Permission System

The inventory app uses a **two-layer permission system**:

1. **Client-Level Features** (`inventoryAccess.features`) - What the company/client has enabled
2. **Staff-Level Permissions** (`profile.permissions`) - What the individual user can do

**Both layers must be enabled for an action to be allowed:**
- Client feature must be `true` (e.g., `features.products.enabled`)
- Staff permission must be `true` (e.g., `permissions.canAddProducts`)

### Example:
```typescript
// User can add products ONLY if:
features.products.add === true  // Client has feature enabled
AND
permissions.canAddProducts === true  // Staff has permission
```

---

## Current vs Proposed Structure

### Current Structure (Too Basic)
```json
{
  "features": {
    "stockAdjustments": true,
    "stockCounts": true,
    "stockTransfers": true,
    "addProducts": true,
    "editProducts": true,
    "barcodeScanning": true,
    "multiLanguage": true,
    "offlineMode": true
  }
}
```

### Proposed Structure (Comprehensive & Grouped)

```json
{
  "inventoryAccess": {
    "enabled": true,
    "mobileApp": true,
    "expiresAt": null,
    "features": {
      // ===== PRODUCT MANAGEMENT =====
      "products": {
        "enabled": true,
        "view": true,
        "viewDetails": true,
        "add": true,
        "edit": true,
        "delete": true,
        "bulkImport": false,
        "bulkExport": true,
        "linkBarcode": true,
        "unlinkBarcode": false,
        "manageImages": true,
        "managePricing": true,
        "manageCategories": false,
        "manageBrands": false
      },
      
      // ===== STOCK OPERATIONS =====
      "stock": {
        "enabled": true,
        "adjustments": {
          "enabled": true,
          "add": true,
          "remove": true,
          "set": true,
          "bulkAdjust": false,
          "viewHistory": true,
          "requireReason": true,
          "requireNotes": false
        },
        "counts": {
          "enabled": true,
          "create": true,
          "perform": true,
          "complete": true,
          "cancel": true,
          "viewHistory": true,
          "exportResults": true
        },
        "transfers": {
          "enabled": true,
          "create": true,
          "initiate": true,
          "markInTransit": true,
          "complete": true,
          "cancel": true,
          "viewHistory": true,
          "viewAllWarehouses": false
        },
        "reservations": {
          "enabled": false,
          "create": false,
          "release": false,
          "view": false
        }
      },
      
      // ===== SCANNING =====
      "scanning": {
        "enabled": true,
        "barcodeScan": true,
        "qrCodeScan": true,
        "manualEntry": true,
        "continuousScan": true,
        "soundEnabled": true,
        "vibrationEnabled": true,
        "flashEnabled": true
      },
      
      // ===== WAREHOUSES =====
      "warehouses": {
        "enabled": true,
        "view": true,
        "viewAll": false,
        "switch": true,
        "viewDetails": true,
        "manageLocations": false
      },
      
      // ===== REPORTS & ANALYTICS =====
      "reports": {
        "enabled": true,
        "viewDashboard": true,
        "viewActivities": true,
        "viewStockReports": true,
        "viewMovementReports": false,
        "viewCountReports": true,
        "viewTransferReports": true,
        "exportData": true,
        "viewAnalytics": false
      },
      
      // ===== OFFLINE & SYNC =====
      "offline": {
        "enabled": true,
        "syncEnabled": true,
        "autoSync": true,
        "manualSync": true,
        "conflictResolution": "server_wins" // "server_wins" | "client_wins" | "manual"
      },
      
      // ===== SETTINGS & CONFIGURATION =====
      "settings": {
        "enabled": true,
        "viewProfile": true,
        "editProfile": true,
        "changePassword": true,
        "managePreferences": true,
        "viewPermissions": true,
        "viewWarehouses": true,
        "viewRecentLogins": true
      },
      
      // ===== NOTIFICATIONS =====
      "notifications": {
        "enabled": true,
        "lowStockAlerts": true,
        "outOfStockAlerts": true,
        "transferNotifications": true,
        "countReminders": false,
        "activityDigest": false
      },
      
      // ===== MULTI-LANGUAGE =====
      "localization": {
        "enabled": true,
        "languages": ["en", "sq"],
        "defaultLanguage": "en",
        "allowLanguageSwitch": true
      },
      
      // ===== ADVANCED FEATURES =====
      "advanced": {
        "enabled": false,
        "apiAccess": false,
        "webhookIntegration": false,
        "customFields": false,
        "auditLog": true,
        "dataExport": true,
        "dataImport": false
      }
    }
  }
}
```

## Benefits of This Structure

### 1. **Granular Control**
- Each feature area has multiple sub-permissions
- Can enable/disable specific actions (e.g., can add products but not delete)
- Better security and access control

### 2. **Logical Grouping**
- Related permissions grouped together
- Easy to understand and maintain
- Clear hierarchy

### 3. **Scalability**
- Easy to add new permissions
- Can add new feature groups without breaking existing structure
- Supports future features

### 4. **Frontend Usage**
```typescript
// Easy to check permissions
if (features.products.add) { /* show add button */ }
if (features.stock.adjustments.add) { /* show add adjustment */ }
if (features.scanning.continuousScan) { /* enable continuous mode */ }

// Easy to disable entire sections
if (features.products.enabled) { /* show products section */ }
if (features.reports.enabled) { /* show reports section */ }
```

## Backend Response Structure

### Login Response Should Include:

```json
{
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "profile": {
    "id": "staff123",
    "name": "John Doe",
    "email": "staff@example.com",
    "phone": "+355691234567",
    "role": "warehouse_manager",
    "clientId": "client123",
    "clientName": "Panda Comet",
    
    // ===== STAFF-LEVEL PERMISSIONS =====
    // These come from staff.inventoryPermissions
    "permissions": {
      "canScan": true,
      "canAdjustStock": true,
      "canAddProducts": false,
      "canEditProducts": false,
      "canViewAllWarehouses": false,
      "canPerformStockCount": true,
      "canInitiateTransfer": true,
      "canCompleteTransfer": false,
      "warehouseIds": ["wh1", "wh2"]  // Scoping to specific warehouses
    },
    
    "preferences": {
      "language": "en",
      "timezone": "Europe/Tirane",
      "notificationsEnabled": true
    }
  },
  
  "client": {
    "id": "client123",
    "name": "Panda Comet",
    "code": "PCOMET",
    "publicIdentifier": "pandacomet"
  },
  
  // ===== CLIENT-LEVEL FEATURES =====
  // These come from client.inventoryAccess.features
  "inventoryAccess": {
    "enabled": true,
    "mobileApp": true,
    "expiresAt": null,
    "features": { 
      /* Comprehensive feature flags as detailed below */
      "products": { ... },
      "stock": { ... },
      "scanning": { ... },
      // etc.
    }
  },
  
  "message": "Login successful"
}
```

### Permission Check Logic (Frontend):
```typescript
function canAddProduct(): boolean {
  const features = inventoryAccess.features;
  const permissions = profile.permissions;
  
  return features.products.enabled 
    && features.products.add 
    && permissions.canAddProducts;
}
```

## Backend Implementation Notes

### Current Staff Permissions (Keep These)
These are already implemented and should remain:
- `canScan`
- `canAdjustStock`
- `canAddProducts`
- `canEditProducts`
- `canViewAllWarehouses`
- `canPerformStockCount`
- `canInitiateTransfer`
- `canCompleteTransfer`
- `warehouseIds` (array of warehouse IDs)

### Client Features to Implement
The `inventoryAccess.features` object should be expanded from the current flat structure to the grouped structure shown above.

### Database Schema Suggestions

**Client Table:**
```json
{
  "inventoryAccess": {
    "enabled": Boolean,
    "mobileApp": Boolean,
    "expiresAt": Date | null,
    "features": {
      "products": { ... },
      "stock": { ... },
      // etc.
    }
  }
}
```

**Staff Table:**
```json
{
  "inventoryPermissions": {
    "canScan": Boolean,
    "canAdjustStock": Boolean,
    "canAddProducts": Boolean,
    "canEditProducts": Boolean,
    "canViewAllWarehouses": Boolean,
    "canPerformStockCount": Boolean,
    "canInitiateTransfer": Boolean,
    "canCompleteTransfer": Boolean,
    "warehouseIds": [String]
  }
}
```

## Migration Strategy

1. **Phase 1**: Add new grouped structure alongside old flat structure (backward compatible)
2. **Phase 2**: Update frontend to use new structure with two-layer checks
3. **Phase 3**: Remove old flat structure after full migration

## Frontend TypeScript Types

```typescript
export interface ProductFeatures {
  enabled: boolean;
  view: boolean;
  viewDetails: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  bulkImport: boolean;
  bulkExport: boolean;
  linkBarcode: boolean;
  unlinkBarcode: boolean;
  manageImages: boolean;
  managePricing: boolean;
  manageCategories: boolean;
  manageBrands: boolean;
}

export interface StockAdjustmentFeatures {
  enabled: boolean;
  add: boolean;
  remove: boolean;
  set: boolean;
  bulkAdjust: boolean;
  viewHistory: boolean;
  requireReason: boolean;
  requireNotes: boolean;
}

export interface Features {
  products: ProductFeatures;
  stock: {
    adjustments: StockAdjustmentFeatures;
    counts: CountFeatures;
    transfers: TransferFeatures;
    reservations: ReservationFeatures;
  };
  scanning: ScanningFeatures;
  warehouses: WarehouseFeatures;
  reports: ReportFeatures;
  offline: OfflineFeatures;
  settings: SettingsFeatures;
  notifications: NotificationFeatures;
  localization: LocalizationFeatures;
  advanced: AdvancedFeatures;
}
```
