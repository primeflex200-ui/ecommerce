# Multi-Vendor System Guide

## Overview
The admin prototype now supports multiple vendors with complete access control and order management.

## Features Implemented

### 1. Vendor Management (Admin)
**Location:** `admin-vendors.html`

- View all vendors in a table
- Add new vendors with:
  - Name
  - Email
  - Password
  - Phone
- Edit existing vendors
- Delete vendors
- View product count per vendor

**Access:** Admin only

### 2. Product-Vendor Association
**Location:** `admin-add-product.html`

- Vendor dropdown added to product form
- Each product is assigned to a vendor via `vendor_id`
- Vendor name displayed under product name in products table

**Access:** Admin can assign any vendor to products

### 3. Vendor Login System
**Location:** `vendor-login.html`

- Separate login page for vendors
- Credentials stored in localStorage
- Session management with vendor ID and name

**Demo Credentials:**
- Email: vendor@cb.com
- Password: vendor123

### 4. Vendor Dashboard
**Location:** `vendor-dashboard.html`

Shows vendor-specific metrics:
- Total products (vendor's only)
- Total orders (containing vendor's products)
- Pending deliveries
- Recent orders list

### 5. Vendor Products Management
**Location:** `vendor-products.html`

Vendors can:
- View only their products
- Add new products (auto-assigned to them)
- Edit their products
- Delete their products
- Toggle stock status

### 6. Vendor Orders Management
**Location:** `vendor-orders.html`

Vendors can:
- View orders containing their products
- Update delivery date (date picker)
- Update delivery status:
  - Pending
  - Processing
  - Shipped
  - Delivered

### 7. Updated Admin Orders Page
**Location:** `admin-orders.html`

Changes:
- ❌ Removed: Customer Name column
- ✅ Added: Vendor column
- ✅ Added: Delivery Date column (date picker)
- ✅ Added: Delivery Status dropdown

Admin can manage all orders and delivery information.

## Access Control

### Admin Access
- Full access to all features
- Can manage vendors
- Can assign vendors to products
- Can edit all products
- Can view and manage all orders

### Vendor Access
- Can only view/edit their own products
- Can only view orders containing their products
- Can update delivery dates and status for their orders
- Cannot access other vendors' data

## Data Structure (localStorage)

### vendors
```json
[
  {
    "id": 1,
    "name": "CB Organic Farm",
    "email": "vendor@cb.com",
    "password": "vendor123",
    "phone": "9876543210",
    "status": "active"
  }
]
```

### products (with vendor_id)
```json
[
  {
    "id": 1,
    "name": "Premium A2 Ghee",
    "vendor_id": 1,
    "category": "Bakery & Dairy",
    "price": 899,
    "stock": 50,
    "inStock": true,
    "image": "images/ghee.png",
    "description": "Pure A2 cow ghee"
  }
]
```

### orders (with delivery info)
```json
[
  {
    "id": "CB123456",
    "customerName": "Rahul Sharma",
    "items": [
      {
        "name": "Premium A2 Ghee",
        "quantity": 2,
        "price": 899
      }
    ],
    "total": 1798,
    "date": "2/12/2026",
    "deliveryDate": "2026-02-15",
    "deliveryStatus": "Processing"
  }
]
```

## Navigation

### Admin Panel
- Dashboard → Products → Add Product → **Vendors** → Orders

### Vendor Portal
- Dashboard → My Products → My Orders

## Login Pages
- Admin: `admin.html`
- Vendor: `vendor-login.html`

## Testing the System

1. **Login as Admin:**
   - Go to `admin.html`
   - Email: admin@cb.com
   - Password: admin123

2. **Add a Vendor:**
   - Navigate to Vendors page
   - Click "Add New Vendor"
   - Fill in details and save

3. **Add Product with Vendor:**
   - Go to Add Product page
   - Select vendor from dropdown
   - Fill product details and save

4. **Login as Vendor:**
   - Go to `vendor-login.html`
   - Use vendor credentials
   - View dashboard and manage products/orders

5. **Test Order Management:**
   - View orders in admin panel
   - Update delivery dates and status
   - Login as vendor and verify access to relevant orders only

## Notes
- All data is stored in localStorage
- Vendor authentication is session-based
- Products without vendor_id will show "N/A" in admin panel
- Existing products need to be reassigned to vendors
- Layout and design remain unchanged as requested
