# Backend API Requirements - Missing Endpoints & Changes

**Document Version:** 1.0  
**Created:** December 11, 2025  
**Status:** ⚠️ **REVIEW REQUIRED**

---

## Summary

This document lists all missing APIs and required changes for the Inventory Mobile App based on the API Integration Guide. The frontend has been implemented with API hooks, but some endpoints may need to be created or adjusted.

---

## ✅ Already Implemented (No Changes Needed)

### Authentication
- ✅ `POST /inventory-app/auth/login` - Login
- ✅ `POST /inventory-app/auth/refresh` - Refresh token
- ✅ `GET /inventory-app/auth/login-history` - Login history

### Products
- ✅ `GET /inventory-app/products` - List products
- ✅ `GET /inventory-app/products/:productId` - Product details
- ✅ `PUT /inventory-app/products/:productId` - Update product
- ✅ `PUT /inventory-app/products/:productId/link-barcode` - Link barcode

### Scanning
- ✅ `POST /inventory-app/scan` - Scan barcode
- ✅ `POST /inventory-app/scan/add-product` - Add product after scan

### Stock Operations
- ✅ `POST /inventory-app/stock/adjust` - Create stock adjustment

### Dashboard
- ✅ `GET /inventory-app/dashboard` - Dashboard data

---

## 🔍 Missing APIs - Need Backend Implementation

### 1. Authentication

#### 1.1 Get Profile
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/auth/profile`

**Expected Response:**
```json
{
  "id": "staff_123",
  "userId": "user_456",
  "name": "John Doe",
  "email": "staff@company.com",
  "phone": "+355691234567",
  "role": "staff",
  "clientId": "client_789",
  "clientName": "Acme Corp",
  "permissions": {
    "canScan": true,
    "canAdjustStock": true,
    "canPerformStockCount": true,
    "canInitiateTransfer": true,
    "canCompleteTransfer": true,
    "canAddProducts": false,
    "canEditProducts": false,
    "canViewAllWarehouses": false,
    "warehouseIds": ["wh_001", "wh_002"]
  },
  "features": {
    "stockAdjustments": true,
    "stockCounts": true,
    "stockTransfers": true,
    "addProducts": false,
    "editProducts": false,
    "barcodeScanning": true,
    "multiLanguage": true
  },
  "preferences": {
    "language": "en",
    "timezone": "Europe/Tirana"
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Ensure response matches structure above

---

#### 1.2 Update Profile
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `PUT /inventory-app/auth/profile`

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+355691234567",
  "preferences": {
    "language": "sq",
    "timezone": "Europe/Tirana"
  }
}
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "staff_123",
    "name": "John Smith",
    "email": "staff@company.com",
    "phone": "+355691234567",
    "preferences": {
      "language": "sq",
      "timezone": "Europe/Tirana"
    }
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Ensure it updates name, phone, and preferences

---

#### 1.3 Change Password
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/auth/change-password`

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Expected Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Ensure validation (current password must be correct)

---

#### 1.4 Logout
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/auth/logout`

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Should invalidate tokens on backend

---

### 2. Warehouses

#### 2.1 List Warehouses
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/warehouses`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `search` (optional)

**Expected Response:**
```json
{
  "data": [
    {
      "id": "wh_001",
      "name": "Main Warehouse",
      "code": "WH-001",
      "address": "123 Industrial Zone, Tirana",
      "addressDetails": {
        "addressLine1": "123 Industrial Zone",
        "city": "Tirana",
        "country": "Albania"
      },
      "stats": {
        "totalProducts": 1250,
        "totalStock": 45000,
        "inStockProducts": 1150,
        "lowStockProducts": 45,
        "outOfStockProducts": 12,
        "missingBarcode": 85
      },
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Ensure `stats` object is included in response
- [ ] Filter by user's `warehouseIds` permissions

---

#### 2.2 Get Warehouse Details
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/warehouses/:warehouseId`

**Expected Response:**
```json
{
  "id": "wh_001",
  "name": "Main Warehouse",
  "code": "WH-001",
  "address": "123 Industrial Zone, Tirana",
  "addressDetails": {
    "addressLine1": "123 Industrial Zone",
    "addressLine2": "",
    "city": "Tirana",
    "state": "",
    "postalCode": "1001",
    "country": "Albania"
  },
  "totalProducts": 1250,
  "totalStock": 45000,
  "statsUpdatedAt": "2025-12-09T10:30:00Z",
  "isActive": true,
  "metadata": {}
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint

---

#### 2.3 Get Warehouse Statistics
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/warehouses/:warehouseId/stats`

**Expected Response:**
```json
{
  "warehouseId": "wh_001",
  "totalProducts": 1250,
  "inStockProducts": 1100,
  "lowStockProducts": 120,
  "outOfStockProducts": 30,
  "totalStockValue": 125000.50
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint

---

### 3. Products

#### 3.1 Get Product by SKU/Barcode
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/products/sku/:sku`

**Description:** Find product by SKU, barcode, or article number.

**Expected Response:** Same as `GET /inventory-app/products/:productId`

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Should search by SKU, barcode, or articleNo

---

#### 3.2 Create Product
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/products`

**Request Body:**
```json
{
  "title": "New Product",
  "titleAl": "Produkt i Ri",
  "productSku": "NEW-001",
  "shortDescription": "A great product",
  "description": "Full product description here...",
  "categoryId": "cat_001",
  "brandId": "brand_001",
  "price": 25.99,
  "priceAl": 3000,
  "priceEur": 25.99,
  "unitMeasure": "piece",
  "initialQuantity": 100,
  "lowQuantity": 10,
  "warehouseId": "wh_001",
  "imagePath": "https://cdn.example.com/products/new.jpg",
  "deviceInfo": {
    "platform": "ios",
    "deviceModel": "iPhone 14",
    "appVersion": "1.0.0"
  }
}
```

**Expected Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": "prod_new",
    "title": "New Product",
    "titleAl": "Produkt i Ri",
    "sku": "NEW-001",
    "barcode": "NEW-001",
    "price": 25.99,
    "stockQuantity": 100,
    "enableStock": true
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Check permissions (`canAddProducts` + `addProducts` feature)
- [ ] Note: Request uses `productSku` but response uses `sku`

---

#### 3.3 Get Categories
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/products/meta/categories`

**Expected Response:**
```json
{
  "data": [
    { "id": "cat_001", "name": "Beverages", "nameAl": "Pije" },
    { "id": "cat_002", "name": "Snacks", "nameAl": "Snack" },
    { "id": "cat_003", "name": "Electronics", "nameAl": "Elektronikë" }
  ]
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in Edit Product and Create Product screens

---

#### 3.4 Get Brands
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/products/meta/brands`

**Expected Response:**
```json
{
  "data": [
    { "id": "brand_001", "name": "CoffeeCo" },
    { "id": "brand_002", "name": "TechBrand" },
    { "id": "brand_003", "name": "HealthyLife" }
  ]
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in Edit Product and Create Product screens
- [ ] If no brands exist, return empty array `[]`

---

### 4. Barcode Scanning

#### 4.1 Get Scan History
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/scan/history`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `warehouseId` (optional)
- `dateFrom` (optional)
- `dateTo` (optional)

**Expected Response:**
```json
{
  "data": [
    {
      "id": "scan_001",
      "barcode": "8901234567890",
      "action": "lookup",
      "result": "found",
      "quantity": 0,
      "product": {
        "id": "prod_001",
        "title": "Premium Coffee Beans",
        "sku": "COF-001",
        "imagePath": "https://cdn.example.com/products/coffee.jpg"
      },
      "warehouse": {
        "id": "wh_001",
        "name": "Main Warehouse",
        "code": "WH-001"
      },
      "scannedAt": "2025-12-09T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in Scan Screen for recent scans display

---

#### 4.2 Get Scan Statistics
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/scan/stats`

**Expected Response:**
```json
{
  "today": 25,
  "thisWeek": 150,
  "total": 1250,
  "byResult": {
    "found": 1100,
    "notFound": 120,
    "created": 30
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Optional - can be used for dashboard/analytics

---

### 5. Stock Operations

#### 5.1 Start Stock Count
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/stock/counts`

**Request Body:**
```json
{
  "warehouseId": "wh_001",
  "notes": "Monthly inventory count",
  "deviceInfo": {
    "platform": "ios",
    "deviceModel": "iPhone 14",
    "appVersion": "1.0.0"
  }
}
```

**Expected Response:**
```json
{
  "message": "Stock count started",
  "stockCount": {
    "id": "sc_001",
    "referenceNumber": "SC-M5K2X9",
    "warehouseId": "wh_001",
    "status": "in_progress",
    "startedAt": "2025-12-09T09:00:00Z"
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Generate unique `referenceNumber`

---

#### 5.2 Update Stock Count
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `PUT /inventory-app/stock/counts/:countId`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod_001",
      "countedQuantity": 148,
      "notes": "2 units damaged"
    },
    {
      "productId": "prod_002",
      "countedQuantity": 15,
      "notes": ""
    }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Stock count updated",
  "stockCount": {
    "id": "sc_001",
    "totalItemsCounted": 2,
    "totalVariance": -2,
    "itemsWithVariance": 1
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used during active counting session

---

#### 5.3 Complete Stock Count
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/stock/counts/:countId/complete`

**Request Body:**
```json
{
  "autoAdjust": true,
  "notes": "Completed monthly count. 2 units marked as damaged."
}
```

**Expected Response:**
```json
{
  "message": "Stock count completed",
  "stockCount": {
    "id": "sc_001",
    "referenceNumber": "SC-M5K2X9",
    "status": "completed",
    "totalItemsCounted": 45,
    "totalVariance": -5,
    "autoAdjusted": true,
    "completedAt": "2025-12-09T12:30:00Z"
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] If `autoAdjust: true`, create stock adjustments for variances

---

#### 5.4 List Stock Counts
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/stock/counts`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `warehouseId` (optional)
- `status` (optional) - `in_progress`, `completed`, `cancelled`

**Expected Response:**
```json
{
  "data": [
    {
      "id": "sc_001",
      "referenceNumber": "SC-M5K2X9",
      "warehouse": {
        "id": "wh_001",
        "name": "Main Warehouse",
        "code": "WH-001"
      },
      "performedBy": {
        "id": "staff_123",
        "name": "John Doe"
      },
      "status": "completed",
      "totalItemsCounted": 45,
      "totalVariance": -5,
      "startedAt": "2025-12-09T09:00:00Z",
      "completedAt": "2025-12-09T12:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in CountsScreen

---

#### 5.5 Get Stock Count Details
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/stock/counts/:countId`

**Expected Response:**
```json
{
  "id": "sc_001",
  "referenceNumber": "SC-M5K2X9",
  "warehouse": {
    "id": "wh_001",
    "name": "Main Warehouse",
    "code": "WH-001"
  },
  "performedBy": {
    "id": "staff_123",
    "name": "John Doe"
  },
  "status": "completed",
  "items": [
    {
      "productId": "prod_001",
      "productSku": "COF-001",
      "productName": "Premium Coffee Beans",
      "expectedQuantity": 150,
      "countedQuantity": 148,
      "variance": -2,
      "notes": "2 units damaged",
      "countedAt": "2025-12-09T10:15:00Z"
    }
  ],
  "totalItemsCounted": 45,
  "totalVariance": -5,
  "itemsWithVariance": 3,
  "notes": "Monthly inventory count",
  "autoAdjusted": true,
  "startedAt": "2025-12-09T09:00:00Z",
  "completedAt": "2025-12-09T12:30:00Z"
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in CountDetailsScreen

---

#### 5.6 Initiate Stock Transfer
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/stock/transfers`

**Request Body:**
```json
{
  "sourceWarehouseId": "wh_001",
  "destinationWarehouseId": "wh_002",
  "items": [
    {
      "productId": "prod_001",
      "quantity": 25,
      "notes": "For new store opening"
    },
    {
      "productId": "prod_002",
      "quantity": 10
    }
  ],
  "notes": "Transfer for Durres store opening",
  "deviceInfo": {
    "platform": "ios",
    "deviceModel": "iPhone 14",
    "appVersion": "1.0.0"
  }
}
```

**Expected Response:**
```json
{
  "message": "Transfer initiated",
  "transfer": {
    "id": "tr_001",
    "referenceNumber": "TR-X7Y2Z4",
    "status": "pending",
    "totalItems": 2,
    "totalQuantity": 35,
    "initiatedAt": "2025-12-09T14:00:00Z"
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Generate unique `referenceNumber`
- [ ] Validate source and destination are different
- [ ] Check stock availability

---

#### 5.7 Complete Stock Transfer
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/stock/transfers/:transferId/complete`

**Request Body:**
```json
{
  "receivedItems": [
    { "productId": "prod_001", "receivedQuantity": 25 },
    { "productId": "prod_002", "receivedQuantity": 9 }
  ],
  "notes": "1 unit of prod_002 damaged during transport"
}
```

**Expected Response:**
```json
{
  "message": "Transfer completed",
  "transfer": {
    "id": "tr_001",
    "referenceNumber": "TR-X7Y2Z4",
    "status": "completed",
    "completedAt": "2025-12-09T16:30:00Z"
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Update stock at destination warehouse
- [ ] Handle discrepancies (receivedQuantity < quantity)

---

#### 5.8 List Stock Transfers
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/stock/transfers`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `warehouseId` (optional) - Filter by source or destination
- `status` (optional) - `pending`, `in_transit`, `completed`, `cancelled`

**Expected Response:**
```json
{
  "data": [
    {
      "id": "tr_001",
      "referenceNumber": "TR-X7Y2Z4",
      "sourceWarehouse": {
        "id": "wh_001",
        "name": "Main Warehouse",
        "code": "WH-001"
      },
      "destinationWarehouse": {
        "id": "wh_002",
        "name": "Secondary Warehouse",
        "code": "WH-002"
      },
      "initiatedBy": {
        "id": "staff_123",
        "name": "John Doe"
      },
      "status": "completed",
      "totalItems": 2,
      "totalQuantity": 35,
      "initiatedAt": "2025-12-09T14:00:00Z",
      "completedAt": "2025-12-09T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in TransfersScreen

---

#### 5.9 Get Stock Transfer Details
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/stock/transfers/:transferId`

**Expected Response:**
```json
{
  "id": "tr_001",
  "referenceNumber": "TR-X7Y2Z4",
  "sourceWarehouse": {
    "id": "wh_001",
    "name": "Main Warehouse",
    "code": "WH-001"
  },
  "destinationWarehouse": {
    "id": "wh_002",
    "name": "Secondary Warehouse",
    "code": "WH-002"
  },
  "initiatedBy": {
    "id": "staff_123",
    "name": "John Doe"
  },
  "status": "completed",
  "items": [
    {
      "productId": "prod_001",
      "productName": "Coffee Beans",
      "sku": "COF-001",
      "quantity": 25,
      "receivedQuantity": 25
    }
  ],
  "totalItems": 2,
  "totalQuantity": 35,
  "notes": "Transfer for Durres store opening",
  "initiatedAt": "2025-12-09T14:00:00Z",
  "startedAt": "2025-12-09T15:00:00Z",
  "completedAt": "2025-12-09T16:30:00Z"
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in TransferDetailsScreen

---

#### 5.10 Cancel Stock Transfer
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `POST /inventory-app/stock/transfers/:transferId/cancel`

**Expected Response:**
```json
{
  "message": "Transfer cancelled",
  "transfer": {
    "id": "tr_001",
    "status": "cancelled"
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Only allow cancellation if status is `pending`

---

### 6. Activities & Operations

#### 6.1 Operations Overview (Dashboard)
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/activities/operations/overview`

**Expected Response:**
```json
{
  "summary": {
    "transfers": {
      "pending": 3,
      "inTransit": 2,
      "today": 5,
      "total": 150
    },
    "stockCounts": {
      "active": 1,
      "today": 2,
      "total": 45
    },
    "adjustments": {
      "today": 8,
      "thisWeek": 25,
      "total": 320
    },
    "activities": {
      "today": 15,
      "thisWeek": 85,
      "total": 1250
    }
  },
  "recent": {
    "transfers": [
      {
        "id": "trf_001",
        "status": "pending",
        "itemCount": 5,
        "fromWarehouse": "wh_001",
        "toWarehouse": "wh_002",
        "createdAt": "2025-12-09T10:00:00Z"
      }
    ],
    "stockCounts": [
      {
        "id": "cnt_001",
        "status": "in_progress",
        "warehouseId": "wh_001",
        "itemsCounted": 45,
        "totalItems": 150,
        "createdAt": "2025-12-09T09:00:00Z"
      }
    ],
    "adjustments": [
      {
        "id": "adj_001",
        "product": {
          "id": "prod_001",
          "title": "Coffee Beans",
          "sku": "COF-001"
        },
        "type": "decrease",
        "quantity": 5,
        "createdAt": "2025-12-09T08:30:00Z"
      }
    ]
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in OperationsScreen for summary cards
- [ ] **Note:** Currently using `/dashboard` endpoint - may need to consolidate or create this specific endpoint

---

#### 6.2 List Activities
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/activities`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `productId` (optional) - Filter by product
- `activityType` (optional) - Filter by type
- `dateFrom` (optional)
- `dateTo` (optional)

**Expected Response:**
```json
{
  "data": [
    {
      "id": "act_001",
      "activityType": "adjustment",
      "quantity": 50,
      "stockBefore": 150,
      "stockAfter": 200,
      "source": "mobile_scanning",
      "product": {
        "id": "prod_001",
        "title": "Premium Coffee Beans",
        "sku": "COF-001",
        "imagePath": "https://cdn.example.com/products/coffee.jpg"
      },
      "reference": {
        "type": "StockAdjustment",
        "id": "adj_001"
      },
      "staff": {
        "id": "staff_123",
        "name": "John Doe"
      },
      "createdAt": "2025-12-09T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "totalPages": 13
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in ActivitiesScreen

---

#### 6.3 Get My Activities
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/activities/mine`

**Query Parameters:** Same as List Activities

**Expected Response:** Same format as List Activities, but filtered to current staff member

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Filter activities by current staff member

---

#### 6.4 Get Activity Details
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/activities/:activityId`

**Expected Response:**
```json
{
  "id": "act_001",
  "activityType": "adjustment",
  "quantity": 50,
  "stockBefore": 150,
  "stockAfter": 200,
  "source": "mobile_scanning",
  "product": {
    "id": "prod_001",
    "title": "Premium Coffee Beans",
    "sku": "COF-001",
    "imagePath": "https://cdn.example.com/products/coffee.jpg"
  },
  "reference": {
    "type": "StockAdjustment",
    "id": "adj_001"
  },
  "staff": {
    "id": "staff_123",
    "name": "John Doe"
  },
  "notes": "New shipment received - Shipment #12345",
  "variantId": null,
  "createdAt": "2025-12-09T14:30:00Z"
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Used in ActivitiesScreen detail modal

---

#### 6.5 Get Activity Summary
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/activities/summary/stats`

**Expected Response:**
```json
{
  "today": 25,
  "thisWeek": 150,
  "mobileActivities": 1200,
  "byType": {
    "adjustment": 500,
    "order_created": 350,
    "order_cancelled": 50,
    "initial_stock": 250,
    "sync": 50
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Optional - can be used for analytics

---

#### 6.6 Get My Adjustments
**Status:** ⚠️ **MISSING or NEEDS VERIFICATION**

**Endpoint:** `GET /inventory-app/activities/adjustments/mine`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Expected Response:**
```json
{
  "data": [
    {
      "id": "adj_001",
      "product": {
        "id": "prod_001",
        "title": "Premium Coffee Beans",
        "sku": "COF-001"
      },
      "adjustmentType": "increase",
      "quantity": 50,
      "stockBefore": 150,
      "stockAfter": 200,
      "reason": "New shipment received",
      "notes": "Shipment #12345",
      "createdAt": "2025-12-09T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Action Required:**
- [ ] Verify if endpoint exists
- [ ] If missing, implement endpoint
- [ ] Filter adjustments by current staff member

---

## 📋 API Changes Required

### 1. Create Product Endpoint

**Issue:** Request uses `productSku` but response uses `sku`

**Current Request:**
```json
{
  "productSku": "NEW-001"
}
```

**Current Response:**
```json
{
  "product": {
    "sku": "NEW-001"
  }
}
```

**Action Required:**
- [ ] Confirm if request should use `productSku` or `sku`
- [ ] Ensure consistency between request and response

---

### 2. Create Product from Scan

**Issue:** Request field name mismatch

**Current Frontend Request:**
```json
{
  "priceAl": 1800,
  "priceEur": 15.99
}
```

**API Spec Request:**
```json
{
  "price": 15.99,
  "priceAl": 1800,
  "priceEur": 15.99
}
```

**Action Required:**
- [ ] Verify if `POST /inventory-app/scan/add-product` accepts `priceAl` and `priceEur`
- [ ] Or if it only accepts `price` and calculates others

---

### 3. Operations Overview vs Dashboard

**Issue:** Two similar endpoints

**Current:**
- `GET /inventory-app/dashboard` - Used in DashboardScreen
- `GET /inventory-app/activities/operations/overview` - Specified in API guide

**Action Required:**
- [ ] Verify if both endpoints exist
- [ ] If only one exists, confirm which one to use
- [ ] Or consolidate into single endpoint

---

## 🔧 Field Name Inconsistencies

### 1. Product Creation

| Frontend Expects | API Spec Shows | Action |
|------------------|----------------|--------|
| `priceAl`, `priceEur` | `price`, `priceAl`, `priceEur` | Verify which fields are required |

### 2. Stock Count Items

| Frontend Expects | API Spec Shows | Action |
|------------------|----------------|--------|
| `countedQuantity` | `countedQuantity` | ✅ Match |

### 3. Transfer Items

| Frontend Expects | API Spec Shows | Action |
|------------------|----------------|--------|
| `receivedQuantity` | `receivedQuantity` | ✅ Match |

---

## 📊 Summary Table

| Category | Missing Endpoints | Status |
|----------|------------------|--------|
| **Authentication** | Get Profile, Update Profile, Change Password, Logout | ⚠️ Need Verification |
| **Warehouses** | List, Details, Stats | ⚠️ Need Verification |
| **Products** | Get by SKU, Create, Categories, Brands | ⚠️ Need Verification |
| **Scanning** | History, Statistics | ⚠️ Need Verification |
| **Stock Counts** | Start, Update, Complete, List, Details | ⚠️ Need Verification |
| **Stock Transfers** | Initiate, Complete, List, Details, Cancel | ⚠️ Need Verification |
| **Activities** | List, Mine, Details, Summary, My Adjustments | ⚠️ Need Verification |
| **Operations** | Overview | ⚠️ Need Verification |

**Total Missing/Unverified:** ~25 endpoints

---

## 🎯 Priority Order

### High Priority (Critical for App Functionality)
1. ✅ Get Profile
2. ✅ Update Profile
3. ✅ Change Password
4. ✅ List Warehouses
5. ✅ Get Categories
6. ✅ Get Brands
7. ✅ List Stock Counts
8. ✅ Start Stock Count
9. ✅ Update Stock Count
10. ✅ Complete Stock Count
11. ✅ List Stock Transfers
12. ✅ Initiate Stock Transfer
13. ✅ Complete Stock Transfer
14. ✅ List Activities
15. ✅ Operations Overview

### Medium Priority (Nice to Have)
16. ✅ Get Warehouse Details
17. ✅ Get Warehouse Stats
18. ✅ Get Product by SKU
19. ✅ Create Product
20. ✅ Get Scan History
21. ✅ Get Stock Count Details
22. ✅ Get Transfer Details
23. ✅ Cancel Transfer
24. ✅ Get Activity Details
25. ✅ Get My Activities

### Low Priority (Optional Features)
26. ✅ Get Scan Statistics
27. ✅ Get Activity Summary
28. ✅ Get My Adjustments

---

## 📝 Next Steps

1. **Backend Team:** Review this document and:
   - Mark endpoints that already exist ✅
   - Mark endpoints that need to be created ⚠️
   - Confirm field names and structures
   - Provide timeline for missing endpoints

2. **Frontend Team:** After backend confirmation:
   - Update API hooks if field names differ
   - Test all endpoints with real API
   - Handle edge cases and errors

---

## 📞 Questions for Backend

1. **Operations Overview:** Does `/activities/operations/overview` exist, or should we use `/dashboard`?
2. **Product Creation:** Should `POST /products` accept `productSku` or `sku`?
3. **Scan Add Product:** Should `POST /scan/add-product` accept `priceAl` and `priceEur` separately?
4. **Warehouse Stats:** Should `GET /warehouses` include `stats` in each warehouse object, or is it separate?
5. **Transfer Status:** Is there a way to mark transfer as "in_transit" or only "pending" → "completed"?

---

**Document Version:** 1.0  
**Created:** December 11, 2025  
**Frontend Team**
