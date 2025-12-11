# Inventory Scanner PWA - Complete Features Documentation

## Overview

Inventory Scanner is a mobile-first Progressive Web App (PWA) designed for warehouse inventory management with barcode scanning, offline support, and comprehensive stock operations. The application supports multiple languages (English and Albanian) and provides a complete inventory management solution.

---

## Core Features

### 1. Authentication & User Management

#### Login Screen
- Email and password authentication
- Form validation
- Secure token management
- Automatic navigation after login

#### Profile Screen
- Personal information display and editing
- Security settings (change password)
- Preferences management:
  - Language selection (English/Albanian)
  - Timezone configuration
- Access information:
  - Recent logins history
  - User permissions overview
  - Assigned warehouses
- Company information
- App version display

#### Account Management
- **Recent Logins**: View login history with device and location information
- **My Permissions**: Detailed view of user permissions and capabilities
- **My Warehouses**: List of warehouses the user has access to

---

### 2. Dashboard

#### Overview Screen
- **Summary Cards**:
  - Total Products
  - Low Stock Alerts
  - Pending Transfers
  - Active Counts
  - Today's Adjustments
  - Out of Stock Items
  - Recent Scans
  - Stock Added/Removed (with period selector)

- **Quick Actions**:
  - Scan (barcode scanning)
  - Adjust (stock adjustments)
  - Count (stock counts)

- **Recent Activities**:
  - Latest inventory activities
  - Quick view of recent operations
  - "See all" link to full activities screen

- **Alerts/Attention Section**:
  - Important notifications and warnings

---

### 3. Products Management

#### Products List Screen
- **Search & Filter**:
  - Search by name, SKU, or barcode
  - Quick filters: All, Low Stock, Out of Stock, No Barcode
  - Advanced filters (sidebar):
    - Stock status (All, In Stock, Low Stock, Out of Stock)
    - Category filter
    - Barcode status (Has Barcode, Missing Barcode)
  - Sort options:
    - Stock: Low to High / High to Low
    - Name: A-Z / Z-A
    - Recently Updated

- **Product Display**:
  - Product image with placeholder
  - Product title and SKU
  - Stock quantity and status badge
  - Barcode status indicator
  - Warehouse information
  - Click to view product details

#### Product Details Screen
- **Image Gallery**:
  - Main product image
  - Gallery images with swipe navigation
  - Dot indicators for image position
  - Placeholder for missing images

- **Product Information**:
  - Title (bilingual: English/Albanian)
  - Category and brand (if available)
  - SKU, Barcode, Article Number
  - Copy to clipboard functionality

- **Stock Status Section**:
  - Current stock quantity
  - Low stock alert threshold
  - Unit of measure
  - Stock status badge (In Stock, Low Stock, Out of Stock, Not Tracked)
  - Low stock alerts toggle status
  - Adjust button (in separate row)

- **Identifiers**:
  - SKU with copy button
  - Barcode (with link option if not linked)
  - Article Number with copy button

- **Pricing**:
  - Default price
  - Price in Lek (Albanian currency)
  - Price in EUR

- **Sale Information** (Read-only):
  - Sale status badge
  - Discount type and percentage
  - Sale price
  - Savings amount
  - Valid date range

- **Activity Statistics**:
  - Total activities count
  - Breakdown by type (Adjustments, Scans, Transfers, Counts)
  - First and last activity dates

- **Recent Activity**:
  - List of recent activities with:
    - Activity type and icon
    - Quantity changes
    - Timestamps
    - Performed by information
    - Notes and references
  - "View All" button to see full history

- **Description**:
  - Expandable/collapsible description section
  - Bilingual descriptions (English and Albanian)
  - Product weight and dimensions

- **Quick Actions**:
  - Adjust Stock (opens modal)
  - Transfer (navigate to create transfer)
  - Full History (view all activities)
  - Link Barcode (if barcode not linked)

- **Header Actions**:
  - Edit button (icon only)
  - More menu (3 dots) with:
    - Copy SKU
    - Copy Barcode

#### Edit Product Screen
- **Image Management**:
  - Current product image display
  - Change image button

- **Basic Information**:
  - Title (required)
  - Title in Albanian
  - Short Description
  - Short Description in Albanian
  - Full Description
  - Full Description in Albanian

- **Classification**:
  - Category selection
  - Brand selection (optional, hidden if no brands available)

- **Pricing**:
  - Default Price (required)
  - Price in Lek
  - Price in EUR

- **Stock Settings**:
  - Unit of Measure
  - Low Stock Alert Threshold
  - Note about adjusting stock quantity

- **Form Validation**:
  - Required field validation
  - Minimum character requirements
  - Price validation (must be ≥ 0)

#### Link Barcode Screen
- **Product Information Display**:
  - Product image
  - Product title and SKU
  - Current barcode status

- **Barcode Scanning**:
  - Camera scanner integration
  - Flash/torch toggle
  - Real-time barcode detection
  - Manual barcode entry option

- **Validation**:
  - Barcode cannot be same as SKU
  - Barcode availability check
  - Conflict detection (if barcode already linked)

- **Success/Error Handling**:
  - Success modal with confirmation
  - Error modal if barcode already in use
  - Option to view conflicting product

#### Adjust Stock Modal
- **Product Information**:
  - Product name and SKU
  - Current stock quantity

- **Adjustment Type Selection**:
  - ➕ Add (Increase stock)
  - ➖ Remove (Decrease stock)
  - ⚡ Set (Set exact quantity)

- **Quantity Input**:
  - Number input with validation
  - Live preview of stock change (Before → After)

- **Reason Selection**:
  - Dropdown with common reasons:
    - Received shipment
    - Return from customer
    - Found during count
    - Damaged items
    - Expired items
    - Theft/Loss
    - Inventory correction
    - Sample/Giveaway
    - Other

- **Additional Fields**:
  - Notes (optional)
  - Warehouse selection (optional)

- **Validation**:
  - Quantity must be greater than 0
  - Cannot decrease below 0
  - Reason is required

---

### 4. Barcode Scanning

#### Scan Screen
- **Scanning Interface**:
  - Camera preview with live scanning
  - Manual barcode entry option
  - Start/Stop scanning controls
  - Flash/torch toggle

- **Product Lookup**:
  - Automatic product identification
  - Real-time stock information
  - Quick actions after scan

- **Recent Scans**:
  - Table view of recent scans
  - Product information
  - Barcode details
  - Status (Found, Not Found, Created, Error)
  - Timestamp

- **Manual Entry**:
  - Form for manual barcode input
  - Submit functionality

- **Help & Information**:
  - Scanning guide
  - Troubleshooting tips
  - How scanning works
  - Common issues and solutions

---

### 5. Operations

#### Operations Overview Screen
- **Summary Cards**:
  - Pending Transfers
  - Active Counts
  - Today's Adjustments

- **Operation Categories**:
  - Activities (audit log)
  - Transfers (stock transfers)
  - Adjustments (stock adjustments)
  - Counts (stock counts)
  - Warehouses (warehouse management)

#### Activities Screen (Audit Log)
- **Summary Cards** (with period selector):
  - Total Activities
  - Adjustments count
  - Transfers count
  - Counts count
  - Orders count
  - Scans count
  - Stock Added
  - Stock Removed

- **Filtering** (Left Sidebar):
  - Activity Type (All, Adjustment, Transfer, Count, Scan, Order)
  - Source (All, Mobile Scanning, Web App, API)
  - Warehouse filter
  - Staff filter
  - Date range selector

- **Search**:
  - Search across various fields

- **Table View**:
  - Columns: Time, Type (with icon), Product, Change, Stock (Before→After), Source (with icon), Staff (initials)
  - Click row to view details

- **Activity Detail Modal**:
  - Full activity information
  - Product details with "View" button
  - Stock change details
  - Performed by information
  - Timestamps and metadata

- **Export Functionality**:
  - Export button (icon-only) in header

- **Pagination**:
  - Page navigation controls

#### Stock Transfers

##### Transfers List Screen
- **Status Tabs**:
  - All, Pending, In Transit, Completed

- **Transfer Cards**:
  - Transfer code and status badge
  - From → To warehouse
  - Item count and total quantity
  - Creation/start/completion dates
  - Action buttons based on status:
    - Pending: View Details, Complete, Cancel
    - In Transit: View Details, Complete
    - Completed/Cancelled: View Details only

- **Create Transfer**:
  - Multi-step modal:
    1. Basic Info (From/To Warehouse)
    2. Add Products (search, scan, quantity)
    3. Confirmation screen
  - Notes field
  - Validation (cannot transfer to same warehouse)

##### Transfer Details Screen
- **Transfer Information**:
  - Transfer code and status
  - Warehouse flow (From → To)
  - Status, creation date, created by
  - Started/completed dates and users

- **Items List**:
  - Products with quantities
  - Product details (name, SKU)

- **Notes**:
  - Transfer notes display

- **Actions**:
  - Mark In Transit (pending only)
  - Complete Transfer
  - Cancel Transfer (pending only)

##### Complete Transfer Modal
- **Items Confirmation**:
  - Checklist of items received
  - Quantity verification

- **Confirmation Options**:
  - All items received correctly
  - Discrepancies exist

- **Notes Field**:
  - Optional completion notes

#### Stock Adjustments

##### Adjustments List Screen
- **Search & Filter**:
  - Search bar
  - Filters (sidebar):
    - Adjustment Type (All, Increase, Decrease, Set)
    - Warehouse filter
  - Sort options

- **Adjustments Table**:
  - ID, Product, Type, Quantity, Stock (Before→After), Reason, Date
  - Actions column with view details

- **Create Adjustment Modal**:
  - Product search/selection
  - Selected product info (SKU, current stock, low threshold)
  - Adjustment type buttons (Increase, Decrease, Set)
  - Quantity input
  - Warehouse selection
  - Live stock preview
  - Reason dropdown
  - Notes (textarea)
  - Reference input
  - Save/Cancel buttons

- **Information Section**:
  - Note about adjustments being immutable

##### Adjustment Details Screen
- **Product Information**:
  - Product details with SKU, barcode, category
  - "View" button to product details

- **Adjustment Details**:
  - Type, quantity, stock before/after
  - Reason, notes, reference
  - Warehouse information

- **Metadata**:
  - Created by, created at
  - Source, device information

#### Stock Counts

##### Counts List Screen
- **Search & Filter**:
  - Search bar
  - Filters (sidebar):
    - Status (All, In Progress, Completed, Cancelled)
    - Warehouse filter
  - Sort options

- **Counts Table**:
  - Count code, warehouse, status, items, started date, actions
  - Status badges with icons

- **Start Count Modal**:
  - Warehouse selection
  - Count scope (Full Inventory, By Category, By Location, Specific Products)
  - Notes field

- **Actions**:
  - Continue (for in-progress counts)
  - View Details
  - View Report (for completed counts)

##### Counting Screen (Active Count)
- **Count Information**:
  - Warehouse, started date, started by
  - Progress bar

- **Product Search/Scan**:
  - Search or scan barcode input

- **Current Item Card**:
  - Product details (title, SKU, location)
  - System quantity
  - Counted quantity input
  - Live difference calculation
  - Notes input
  - Skip and Save & Next buttons

- **Counted Items Table**:
  - List of already counted items
  - Discrepancy indicators

- **Pending Items Section**:
  - Items remaining to count

- **Header Actions**:
  - Pause button
  - Complete Count button

##### Complete Count Modal
- **Summary Statistics**:
  - Total Items
  - Counted Items
  - Matched Items
  - Variance Count
  - Surplus/Shortage
  - Net Difference

- **Discrepancies Table**:
  - Products with discrepancies
  - System vs Counted quantities
  - Difference amounts

- **Options**:
  - Apply adjustments to update system quantities (checkbox)

##### Count Details Screen
- **Count Information**:
  - Count code, status, warehouse
  - Started/completed dates
  - Items counted and total

- **Items List**:
  - Products with system and counted quantities
  - Discrepancy indicators

- **Actions**:
  - Continue Counting (if in progress)
  - View Report (if completed)

##### Count Report Screen
- **Summary Statistics**:
  - Total items, counted, matched, variance
  - Surplus and shortage amounts
  - Net difference

- **Detailed Breakdown**:
  - Items with discrepancies
  - System vs counted comparison

#### Warehouses Screen
- **Warehouse List**:
  - Warehouse cards with:
    - Warehouse name and code
    - Location information
    - Status indicators

- **Simple List View**:
  - Basic warehouse information display

---

### 6. Notifications

#### Notifications Screen
- **Notification Groups**:
  - Today
  - Yesterday
  - Earlier

- **Notification Types**:
  - 🔴 Low Stock Alert
  - ⚠️ Out of Stock
  - 🔄 Transfer (status updates)
  - 📋 Count (reminders and updates)
  - 📦 Adjustment (reminders)
  - ✅ Approval (approval notifications)

- **Notification Display**:
  - Icon based on type
  - Title and message
  - Time ago display
  - Unread indicator (blue ring)

- **Actions**:
  - Mark individual notification as read (on tap)
  - Mark All Read button
  - Settings button

- **Navigation**:
  - Tap notification to navigate to relevant screen
  - Based on notification type

#### Notification Settings Screen
- **Push Notification Toggles**:
  - Low Stock Alerts
  - Out of Stock Alerts
  - Transfer Updates
  - Count Reminders

- **Toggle Descriptions**:
  - Each toggle has title and description
  - Save functionality with toast confirmation

---

### 7. User Interface Features

#### Navigation
- **Bottom Navigation Bar**:
  - Operations
  - Items (Products)
  - Scan
  - More (Account)
  - Notifications (with badge count)

- **Screen Headers**:
  - Back button
  - Title
  - Action buttons (context-dependent)

- **Scroll Restoration**:
  - Automatic scroll to top on route change

#### Localization
- **Supported Languages**:
  - English (en) - Default
  - Albanian (sq)

- **Language Switching**:
  - Available in Profile screen
  - Persists across sessions
  - All UI strings localized

#### Responsive Design
- **Mobile-First**:
  - Optimized for mobile devices
  - Responsive layouts for tablets
  - Touch-friendly interactions

- **Breakpoints**:
  - Mobile: Default
  - Tablet/Desktop: `sm:` breakpoint and above

#### UI Components
- **Design System**:
  - Consistent color scheme
  - Status badges with icons
  - Card-based layouts
  - Modal dialogs
  - Sheet sidebars for filters
  - Toast notifications

---

## Technical Features

### Offline Support
- **IndexedDB Storage** (Dexie):
  - Local data caching
  - Offline data access
  - Sync when online

### State Management
- **React Query**:
  - Server state caching
  - Automatic refetching
  - Optimistic updates

- **Zustand**:
  - Client state management
  - Authentication state
  - User preferences

### PWA Capabilities
- **Installable**:
  - Can be installed on mobile devices
  - App-like experience

- **Offline Mode**:
  - Works without internet connection
  - Data synchronization when online

### Barcode Scanning
- **Camera Integration**:
  - Real-time barcode detection
  - Multiple barcode format support
  - Flash/torch support

- **Supported Formats**:
  - EAN-13, EAN-8
  - UPC-A
  - Code-128, Code-39

### Data Validation
- **Form Validation**:
  - Required fields
  - Type validation
  - Business rule validation

- **Stock Validation**:
  - Cannot decrease below 0
  - Quantity must be positive
  - Warehouse access validation

---

## Screen Count Summary

| Category | Screens | Modals/Components |
|----------|---------|------------------|
| Authentication | 5 | - |
| Dashboard | 1 | - |
| Products | 4 | 2 |
| Scanning | 1 | - |
| Operations | 8 | 4 |
| Notifications | 2 | - |
| **Total** | **21 Screens** | **6 Modals/Components** |

---

## Navigation Flow

```
Login
  ↓
Dashboard
  ├─→ Products List → Product Details → Edit Product
  │                  └─→ Link Barcode
  │                  └─→ Adjust Stock (Modal)
  │
  ├─→ Scan Screen
  │
  ├─→ Operations Overview
  │   ├─→ Activities (with filters)
  │   ├─→ Transfers List → Transfer Details
  │   │                  └─→ Complete Transfer (Modal)
  │   ├─→ Adjustments List → Adjustment Details
  │   │                    └─→ Create Adjustment (Modal)
  │   ├─→ Counts List → Count Details
  │   │              └─→ Counting Screen
  │   │              └─→ Count Report
  │   │              └─→ Start Count (Modal)
  │   │              └─→ Complete Count (Modal)
  │   └─→ Warehouses
  │
  ├─→ Notifications → Notification Settings
  │
  └─→ Account (Profile)
      ├─→ Recent Logins
      ├─→ My Permissions
      └─→ My Warehouses
```

---

## Key Capabilities

### Stock Management
- ✅ Real-time stock tracking
- ✅ Multi-warehouse support
- ✅ Stock adjustments (increase, decrease, set)
- ✅ Low stock alerts
- ✅ Stock status indicators

### Inventory Operations
- ✅ Stock transfers between warehouses
- ✅ Stock counts with discrepancy tracking
- ✅ Activity audit log
- ✅ Product search and filtering

### Product Management
- ✅ Product catalog with images
- ✅ Barcode linking
- ✅ Bilingual product information
- ✅ Pricing management
- ✅ Category and brand organization

### Scanning & Identification
- ✅ Barcode scanning
- ✅ Product lookup
- ✅ Manual barcode entry
- ✅ Multiple barcode format support

### User Experience
- ✅ Multi-language support (EN/SQ)
- ✅ Offline functionality
- ✅ Responsive design
- ✅ Intuitive navigation
- ✅ Toast notifications
- ✅ Loading states

### Reporting & Analytics
- ✅ Activity history
- ✅ Stock statistics
- ✅ Count reports
- ✅ Export functionality

---

## Status Indicators

### Stock Status
- 🟢 **In Stock**: Stock quantity > low threshold
- 🟡 **Low Stock**: 0 < stock ≤ low threshold
- 🔴 **Out of Stock**: Stock = 0
- ⚪ **Not Tracked**: Stock tracking disabled

### Transfer Status
- 🟡 **Pending**: Created, not started
- 🔵 **In Transit**: Transfer in progress
- ✅ **Completed**: Transfer completed
- ❌ **Cancelled**: Transfer cancelled

### Count Status
- 🔵 **In Progress**: Count actively being performed
- ✅ **Completed**: Count finished
- ❌ **Cancelled**: Count cancelled

---

## Permissions & Access Control

### User Permissions
- Can Scan
- Can Adjust Stock
- Can Perform Stock Count
- Can Initiate Transfer
- Can Complete Transfer
- Can Add Products
- Can Edit Products
- Can View All Warehouses
- Warehouse-specific access

### Feature Flags
- Stock Adjustments
- Stock Counts
- Stock Transfers
- Add Products
- Edit Products
- Barcode Scanning
- Multi-language

---

## Data Models

### Product
- ID, Title (bilingual), SKU, Barcode
- Stock quantity, Low threshold
- Pricing (Default, Lek, EUR)
- Category, Brand (optional)
- Images (main + gallery)
- Descriptions (bilingual)
- Weight, Dimensions
- Sale information (read-only)

### Transfer
- ID, Code, Status
- From/To Warehouses
- Items (products + quantities)
- Notes, Reference
- Created/Started/Completed dates
- Created/Completed by

### Adjustment
- ID, Code, Type (increase/decrease/set)
- Product, Quantity
- Stock before/after
- Reason, Notes, Reference
- Warehouse
- Created by, Created at

### Count
- ID, Code, Status
- Warehouse
- Scope (Full/Partial/Specific)
- Items counted
- Discrepancies
- Started/Completed dates

### Activity
- ID, Type, Source
- Product, Quantity change
- Stock before/after
- Performed by, Timestamp
- Notes, Metadata

---

## API Integration Points

### Products
- `GET /products` - List products
- `GET /products/:id` - Product details
- `PUT /products/:id` - Update product
- `PUT /products/:id/link-barcode` - Link barcode

### Stock Operations
- `POST /stock/adjust` - Create adjustment
- `GET /stock/transfers` - List transfers
- `POST /stock/transfers` - Create transfer
- `POST /stock/transfers/:id/complete` - Complete transfer
- `POST /stock/transfers/:id/cancel` - Cancel transfer

### Counts
- `GET /stock/counts` - List counts
- `POST /stock/counts` - Create count
- `POST /stock/counts/:id/complete` - Complete count

### Activities
- `GET /activities` - List activities (with filters)
- `GET /activities?productId=:id` - Filter by product

### Scanning
- `POST /products/scan` - Scan barcode lookup

### Notifications
- `GET /notifications` - List notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all read
- `GET /notifications/unread-count` - Get unread count

---

## Future Enhancements (Potential)

- Multi-warehouse stock views
- Advanced reporting and analytics
- Product variants management
- Batch operations
- Import/Export functionality
- Advanced search with filters
- Product images upload
- Barcode generation
- Print labels
- Integration with external systems

---

**Document Version:** 1.0  
**Last Updated:** December 9, 2025  
**Application Version:** Development


