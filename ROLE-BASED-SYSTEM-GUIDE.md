# CB Organic Store - Role-Based System Guide

## Overview
The ecommerce prototype now supports role-based login, admin-controlled vendor creation, and complete vendor workflow using localStorage for data storage.

---

## 🔐 LOGIN SYSTEM

### Unified Login Page
**File:** `login.html`

All users (admin, vendor, customer) use ONE login page.

### Login Behavior
After successful login, users are redirected based on their role:
- **Admin** → `admin-dashboard.html`
- **Vendor** → `vendor-dashboard.html`
- **Customer** → `index.html` (store homepage)

### Demo Credentials
```
Admin:
- Email: admin@cb.com
- Password: admin123

Vendor:
- Email: vendor@cb.com
- Password: vendor123

Customer:
- Email: customer@cb.com
- Password: customer123
```

---

## 👤 USER ROLES

### 1. Admin Role
**Access:** Full platform control

**Capabilities:**
- View all orders
- View all vendors
- View all products
- Create new vendors
- Monitor order status
- Manage categories
- Access admin dashboard

**Dashboard:** `admin-dashboard.html`

---

### 2. Vendor Role
**Access:** Limited to own data

**Capabilities:**
- View only their products
- Update inventory/stock
- View vendor-specific orders
- Update order item status
- View assigned orders only
- Cannot see other vendor data
- Cannot see admin data

**Dashboard:** `vendor-dashboard.html`

---

### 3. Customer Role
**Access:** Shopping and orders

**Capabilities:**
- Browse products
- View vendor information on products
- Add items to cart
- Place orders
- View order history
- See product availability

**Dashboard:** Store homepage (`index.html`)

---

## 📦 DATA STORAGE (localStorage)

### Storage Keys

#### users
Stores all user accounts with roles
```javascript
[
  {
    id: 'admin-001',
    email: 'admin@cb.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  },
  {
    id: 'vendor-001',
    email: 'vendor@cb.com',
    password: 'vendor123',
    role: 'vendor',
    firstName: 'Vendor',
    lastName: 'One',
    vendorId: 1
  }
]
```

#### vendors
Stores vendor business information
```javascript
[
  {
    id: 1,
    vendorName: 'Vendor One',
    businessName: 'CB Organic Farm',
    email: 'vendor@cb.com',
    userId: 'vendor-001',
    phone: '9876543210',
    status: 'active',
    createdAt: '2024-02-12T...'
  }
]
```

#### products
Stores product information with vendor_id
```javascript
[
  {
    id: 1,
    name: 'Premium A2 Ghee',
    vendor_id: 1,
    category: 'Bakery & Dairy',
    price: 899,
    stock: 50,
    unit: 'kg',
    image: 'images/ghee.png',
    inStock: true
  }
]
```

#### orders
Stores customer orders
```javascript
[
  {
    id: 'CB12345678',
    customerName: 'John Doe',
    customerEmail: 'customer@cb.com',
    subtotal: 1798,
    tax: 89.90,
    shipping: 50,
    total: 1937.90,
    status: 'Pending',
    date: '2/12/2024',
    createdAt: '2024-02-12T...'
  }
]
```

#### orderItems
Stores individual items split by vendor
```javascript
[
  {
    id: 'OI123abc',
    orderId: 'CB12345678',
    productId: 1,
    productName: 'Premium A2 Ghee',
    vendorId: 1,
    quantity: 2,
    unitPrice: 899,
    totalPrice: 1798,
    status: 'Pending',
    createdAt: '2024-02-12T...'
  }
]
```

#### inventory
Tracks stock levels
```javascript
[
  {
    productId: 1,
    quantity: 50,
    reservedQuantity: 0,
    availableQuantity: 50
  }
]
```

---

## 🛒 ORDER FLOW

### Step 1: Customer Places Order
1. Customer adds products from multiple vendors to cart
2. Customer proceeds to checkout
3. System creates ONE order record in `orders`

### Step 2: Order Splitting
System automatically splits order into `orderItems`:
- Each item is linked to its vendor via `vendorId`
- Each item has independent status tracking

### Step 3: Vendor View
- Vendor sees only items where `vendorId` matches their ID
- Vendor can update status for their items only

### Step 4: Admin View
- Admin sees complete order with all items
- Admin sees which vendor each item belongs to

### Example Order Flow
```
Customer Order: CB12345678
├── Item 1: Ghee (Vendor A) - Status: Pending
├── Item 2: Honey (Vendor B) - Status: Packed
└── Item 3: Paneer (Vendor A) - Status: Shipped

Vendor A sees: Items 1 & 3
Vendor B sees: Item 2
Admin sees: All items
```

---

## 🏪 ADMIN PANEL FEATURES

### Vendor Creation
**Location:** Admin Dashboard

**Process:**
1. Click "Add New Vendor" button
2. Fill in vendor details:
   - Vendor Name
   - Business Name
   - Email
   - Password
   - Phone
3. System creates:
   - User account with role='vendor'
   - Vendor record linked to user
4. Vendor can now login and access dashboard

### Vendor Management
- View all vendors in table
- See vendor status
- See product count per vendor
- See creation date

### Order Management
- View all orders from all customers
- See order items grouped by vendor
- Monitor order status
- Track delivery status

---

## 🏭 VENDOR PANEL FEATURES

### Vendor Dashboard Sections

#### Section 1: Vendor Info
- Displays Vendor Name
- Displays Vendor ID

#### Section 2: Inventory Table
Columns:
- Product
- Price
- Quantity
- Unit
- Stock Status
- Actions (Edit button)

Features:
- View only vendor's products
- Update stock quantity
- See availability status

#### Section 3: Orders Received
Columns:
- Order ID
- Product
- Quantity
- Status (dropdown)

Features:
- View only orders containing vendor's products
- Update order item status:
  - Pending
  - Confirmed
  - Packed
  - Shipped
  - Delivered

### Stock Management
1. Click "Edit" button on product
2. Enter new stock quantity
3. System updates:
   - Product stock
   - Availability status
   - Inventory records

---

## 🛍️ CUSTOMER PRODUCT VIEW

### Product Cards Display
Each product card shows:
- Product image
- **Vendor Name**
- **Business Name**
- Product name
- Price
- **Availability Status** (In Stock / Out of Stock)
- View Details button

### Example Product Card
```
[Product Image]
Vendor: Vendor One
Business: CB Organic Farm
Premium A2 Ghee
₹899
[In Stock]
[View Details]
```

---

## 📁 FILE STRUCTURE

### New Files Created
```
login.html                  - Unified login page
unified-auth.js            - Authentication system
order-management.js        - Order splitting & management
product-display.js         - Product display with vendor info
ROLE-BASED-SYSTEM-GUIDE.md - This documentation
```

### Updated Files
```
admin-dashboard.html       - Added vendor creation section
admin-script.js           - Added vendor creation logic
vendor-dashboard.html     - Updated with order management
index.html                - Added script includes
shop.html                 - Added script includes
admin.html                - Redirects to unified login
vendor-login.html         - Redirects to unified login
```

---

## 🔒 ACCESS CONTROL

### Authentication Check
All protected pages check:
1. Is user logged in?
2. Does user have correct role?

### Role Verification
```javascript
// Admin pages
checkAuth();
checkRoleAccess(['admin']);

// Vendor pages
checkAuth();
checkRoleAccess(['vendor']);
```

### Data Filtering
- Vendors see only their data via `vendor_id` filtering
- Customers see only their orders via email filtering
- Admin sees all data

---

## 🚀 TESTING THE SYSTEM

### Test Admin Functions
1. Login as admin (admin@cb.com / admin123)
2. View dashboard statistics
3. Click "Add New Vendor"
4. Create a new vendor
5. View vendor in table
6. Check all orders

### Test Vendor Functions
1. Login as vendor (vendor@cb.com / vendor123)
2. View vendor dashboard
3. Check inventory table (only vendor products)
4. Update stock quantity
5. View orders (only vendor orders)
6. Update order status

### Test Customer Functions
1. Login as customer (customer@cb.com / customer123)
2. Browse products
3. See vendor information on products
4. See availability status
5. Add to cart
6. Place order

### Test Order Flow
1. As customer: Add products from multiple vendors
2. Place order
3. As vendor: Check dashboard for new order
4. Update order status
5. As admin: View complete order with all items

---

## 💡 KEY FEATURES

✅ Single unified login for all roles
✅ Role-based dashboard redirection
✅ Admin-controlled vendor creation
✅ Vendor isolation (can't see other vendors)
✅ Order splitting by vendor
✅ Independent item status tracking
✅ Product cards show vendor info
✅ Stock availability display
✅ Complete localStorage data structure
✅ No UI layout changes (logic only)

---

## 🔧 TECHNICAL NOTES

### Session Management
- User session stored in localStorage
- Current user object cached
- Role stored separately for quick access
- Vendor ID cached for vendors

### Data Relationships
```
users.id → vendors.userId
vendors.id → products.vendor_id
products.id → orderItems.productId
orders.id → orderItems.orderId
vendors.id → orderItems.vendorId
```

### Status Flow
```
Order Item Status:
Pending → Confirmed → Packed → Shipped → Delivered

Order Status (auto-updated):
Based on all item statuses
```

---

## 📝 NOTES

1. This is a prototype using localStorage
2. No backend server required
3. Data persists in browser
4. Clear localStorage to reset data
5. All passwords stored in plain text (prototype only)
6. No actual payment processing
7. No email notifications

---

## 🎯 NEXT STEPS

For production implementation:
1. Replace localStorage with PostgreSQL database
2. Implement proper authentication (JWT)
3. Add password hashing
4. Add email notifications
5. Implement payment gateway
6. Add image upload to cloud storage
7. Add proper validation
8. Add error handling
9. Add loading states
10. Add responsive design improvements

---

**Version:** 1.0
**Last Updated:** February 12, 2026
**Status:** Prototype Complete
