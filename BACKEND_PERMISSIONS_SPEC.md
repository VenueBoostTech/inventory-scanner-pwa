# Backend Permissions Specification

## Overview

This document specifies the **two-layer permission system** for the Inventory Mobile App:

1. **Client-Level Features** - What features the company has enabled
2. **Staff-Level Permissions** - What actions each staff member can perform

Both must be enabled for an action to be allowed.

---

## Current Implementation Status

### ✅ Already Implemented (Staff Permissions)
These are returned in the login/profile response under `profile.permissions`:

```json
{
  "canScan": true,
  "canAdjustStock": true,
  "canAddProducts": false,
  "canEditProducts": false,
  "canViewAllWarehouses": false,
  "canPerformStockCount": true,
  "canInitiateTransfer": true,
  "canCompleteTransfer": false,
  "warehouseIds": ["wh1", "wh2"]
}
```

**Source:** `staff.inventoryPermissions` in database

### ⚠️ Needs Enhancement (Client Features)
Currently returns flat structure:
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

**Source:** `client.inventoryAccess.features` in database

---

## Proposed Client Features Structure

Replace the flat structure with this **grouped, granular structure**:

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
        "conflictResolution": "server_wins"
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

---

## Permission Check Logic

### Frontend Implementation:
```typescript
// Example: Check if user can add a product
function canAddProduct(): boolean {
  const clientFeatures = inventoryAccess.features;
  const staffPermissions = profile.permissions;
  
  return clientFeatures.products.enabled 
    && clientFeatures.products.add 
    && staffPermissions.canAddProducts;
}

// Example: Check if user can adjust stock
function canAdjustStock(): boolean {
  const clientFeatures = inventoryAccess.features;
  const staffPermissions = profile.permissions;
  
  return clientFeatures.stock.adjustments.enabled 
    && clientFeatures.stock.adjustments.add 
    && staffPermissions.canAdjustStock;
}
```

### Backend Validation:
When processing API requests, validate both layers:
```typescript
// Pseudo-code
if (!client.inventoryAccess.features.products.add) {
  throw new Error('Feature not enabled for client');
}

if (!staff.inventoryPermissions.canAddProducts) {
  throw new Error('Permission denied for staff');
}

// Proceed with action
```

---

## Migration Path

### Phase 1: Add New Structure (Backward Compatible)
- Add new grouped structure to `client.inventoryAccess.features`
- Keep old flat structure for compatibility
- Frontend can use either during transition

### Phase 2: Update Frontend
- Frontend starts using new grouped structure
- Implement two-layer permission checks
- Update all permission checks throughout app

### Phase 3: Remove Old Structure
- After frontend fully migrated
- Remove old flat structure from database
- Clean up any migration code

---

## Benefits

1. **Granular Control**: 50+ specific permissions vs current 10
2. **Logical Grouping**: Related permissions grouped together
3. **Scalability**: Easy to add new permissions without restructuring
4. **Better UX**: Can show/hide specific UI elements based on permissions
5. **Security**: Two-layer system provides defense in depth

---

## Questions for Backend Team

1. Should we keep the old flat structure during migration for backward compatibility?
2. What's the preferred way to store this in the database? (JSON field, separate table, etc.)
3. Should there be default values for new features when adding them?
4. How should we handle feature deprecation/removal?
5. Should there be an admin UI to manage these features, or is it database-only?

---

## Example API Response

### Current Response:
```json
{
  "success": true,
  "client": {
    "id": "692442e09c1f9ef92196e8ba",
    "name": "Panda Comet",
    "code": "PCOMET",
    "publicIdentifier": "pandacomet"
  },
  "inventoryAccess": {
    "enabled": true,
    "mobileApp": true,
    "expiresAt": null,
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
}
```

### Proposed Response (Login):
```json
{
  "tokens": { ... },
  "profile": {
    "id": "staff123",
    "name": "John Doe",
    "email": "staff@example.com",
    "permissions": {
      "canScan": true,
      "canAdjustStock": true,
      "canAddProducts": false,
      "canEditProducts": false,
      "canViewAllWarehouses": false,
      "canPerformStockCount": true,
      "canInitiateTransfer": true,
      "canCompleteTransfer": false,
      "warehouseIds": ["wh1", "wh2"]
    }
  },
  "client": { ... },
  "inventoryAccess": {
    "enabled": true,
    "mobileApp": true,
    "expiresAt": null,
    "features": {
      "products": { ... },
      "stock": { ... },
      "scanning": { ... },
      // etc. (full structure as shown above)
    }
  }
}
```

---

**Last Updated:** December 11, 2025  
**Status:** Proposal for Backend Implementation
