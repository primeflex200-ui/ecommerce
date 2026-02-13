# CB Organic Store - Database Sync Architecture
# Connecting Admin, Vendor, and Customer to Shared PostgreSQL Database

## Overview
This document explains how to replace localStorage with PostgreSQL database so that Admin, Vendor, and Customer all share the same data in real-time.

---

## CORE PRINCIPLE: Single Source of Truth

```
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
│  (Single Source of Truth for All Roles)                 │
└─────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐         ┌────┴────┐
    │  Admin  │          │ Vendor  │         │Customer │
    │Dashboard│          │Dashboard│         │Frontend │
    └─────────┘          └─────────┘         └─────────┘
```

All three roles read and write to the same database tables.
No localStorage. No separate data stores. One database for everyone.

---

## DATABASE TABLES (Shared by All Roles)

### 1. users
- Stores: Admin, Vendor, Customer accounts
- Used by: All roles for authentication

### 2. vendors
- Stores: Vendor business information
- Used by: Admin (create/manage), Vendor (view own info)

### 3. products
- Stores: All products from all vendors
- Used by: Admin (view all), Vendor (manage own), Customer (browse all)

### 4. categories
- Stores: Product categories
- Used by: Admin (manage), Vendor (use when adding products), Customer (filter)

### 5. orders
- Stores: All customer orders
- Used by: Admin (view all), Vendor (view filtered), Customer (view own)

### 6. order_items
- Stores: Individual items in orders (split by vendor)
- Used by: Admin (view all), Vendor (view own items), Customer (view own)

### 7. cart
- Stores: Customer cart items
- Used by: Customer (manage cart)

### 8. addresses
- Stores: Customer delivery addresses
- Used by: Customer (manage), Admin (view in orders)

### 9. inventory_log
- Stores: Stock change history
- Used by: Admin (audit), Vendor (track changes)

---

## DATA SYNC SCENARIOS

### Scenario 1: Admin Creates Vendor

**Flow:**
```
1. Admin fills vendor form in admin-dashboard.html
2. Frontend: POST /api/admin/vendors
   Body: { vendorName, businessName, email, password, phone }

3. Backend:
   - Creates user record (role='vendor')
   - Creates vendor record (linked to user)
   - Returns success

4. Database State:
   users table: New vendor user added
   vendors table: New vendor record added

5. Result:
   - Vendor can login immediately with credentials
   - Vendor appears in Admin's vendor list
   - Vendor ID is available for product assignment
```

**Code Change Required:**
```javascript
// OLD (localStorage):
function createVendor(vendorData) {
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    vendors.push(vendorData);
    localStorage.setItem('vendors', JSON.stringify(vendors));
}

// NEW (API):
async function createVendor(vendorData) {
    const response = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(vendorData)
    });
    const result = await response.json();
    return result;
}
```

---

### Scenario 2: Admin Creates Category

**Flow:**
```
1. Admin clicks "Add Category" in admin-dashboard.html
2. Frontend: POST /api/admin/categories
   Body: { name: "New Category" }

3. Backend:
   - Inserts into categories table
   - Returns success

4. Database State:
   categories table: New category added

5. Result:
   - Category appears in Admin's category list
   - Vendors see new category in product form dropdown
   - Customers see new category in shop filters
```

**Sync Points:**
- Admin dashboard: GET /api/admin/categories
- Vendor product form: GET /api/categories
- Customer shop page: GET /api/categories

All three fetch from same database table.

---

### Scenario 3: Vendor Adds Product

**Flow:**
```
1. Vendor fills product form in vendor-products.html
2. Frontend: POST /api/vendor/products
   Body: { name, category, price, stock, ... }
   Files: product image

3. Backend:
   - Uploads image to cloud storage
   - Inserts product with vendor_id into products table
   - Returns success

4. Database State:
   products table: New product added with vendor_id

5. Result:
   - Product appears in Vendor's product list
   - Admin sees product in all products list
   - Customer sees product in shop page
```

**Code Change Required:**
```javascript
// OLD (localStorage):
function addProduct(productData) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(productData);
    localStorage.setItem('products', JSON.stringify(products));
}

// NEW (API):
async function addProduct(productData, imageFile) {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('category', productData.category);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('image', imageFile);
    
    const response = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData
    });
    return await response.json();
}
```

---

### Scenario 4: Vendor Updates Stock

**Flow:**
```
1. Vendor updates stock in vendor-dashboard.html
2. Frontend: PUT /api/vendor/products/:id/stock
   Body: { stock: 75 }

3. Backend:
   - Updates products.stock in database
   - Logs change in inventory_log table
   - Returns success

4. Database State:
   products table: stock updated
   inventory_log table: change recorded

5. Result:
   - Vendor sees updated stock
   - Admin sees updated stock in products list
   - Customer sees "In Stock" or "Out of Stock" based on new value
```

**Sync Points:**
- Vendor dashboard: GET /api/vendor/products
- Admin dashboard: GET /api/admin/products
- Customer shop: GET /api/products (filters by inStock)

---

### Scenario 5: Customer Places Order

**Flow:**
```
1. Customer clicks "Place Order" in checkout.html
2. Frontend: POST /api/orders
   Body: { shippingAddress, paymentMethod }

3. Backend:
   - Creates order record in orders table
   - Creates order_items records (one per product, with vendor_id)
   - Reduces stock in products table
   - Clears cart table for customer
   - Returns order ID

4. Database State:
   orders table: New order added
   order_items table: Multiple items added (split by vendor)
   products table: Stock reduced
   cart table: Customer's cart cleared

5. Result:
   - Order appears in Customer's order history
   - Order appears in Admin's all orders list
   - Order items appear in each Vendor's dashboard (filtered by vendor_id)
   - Product stock updated everywhere
```

**Multi-Vendor Order Split Example:**
```
Order CB12345678 (Customer: John Doe)
├─ Order Item 1: Ghee (Vendor A) - Status: Pending
├─ Order Item 2: Paneer (Vendor A) - Status: Pending
├─ Order Item 3: Gomutra (Vendor B) - Status: Pending
└─ Order Item 4: Buttermilk (Vendor C) - Status: Pending

Admin sees: All 4 items
Vendor A sees: Items 1 & 2 only
Vendor B sees: Item 3 only
Vendor C sees: Item 4 only
```

---

### Scenario 6: Vendor Updates Order Item Status

**Flow:**
```
1. Vendor updates status in vendor-orders.html
2. Frontend: PUT /api/vendor/orders/:orderId/items/:itemId/status
   Body: { status: "Shipped", deliveryDate: "2024-02-20" }

3. Backend:
   - Checks if item belongs to vendor (vendor_id match)
   - Updates order_items.status in database
   - Returns success

4. Database State:
   order_items table: status updated for specific item

5. Result:
   - Vendor sees updated status
   - Admin sees updated status in order details
   - Customer sees updated status in order tracking
   - Overall order status updates if all items shipped
```

---

### Scenario 7: Admin Updates Order Status

**Flow:**
```
1. Admin updates order status in admin-orders.html
2. Frontend: PUT /api/admin/orders/:id/status
   Body: { status: "Delivered" }

3. Backend:
   - Updates orders.status in database
   - Optionally updates all order_items.status
   - Returns success

4. Database State:
   orders table: status updated

5. Result:
   - Admin sees updated status
   - Customer sees updated status
   - Vendors see updated status for their items
```

---

## REPLACING LOCALSTORAGE WITH API CALLS

### Admin Dashboard (admin-dashboard.html)

#### Current localStorage Usage:
```javascript
// Get all products
const products = JSON.parse(localStorage.getItem('products')) || [];

// Get all orders
const orders = JSON.parse(localStorage.getItem('orders')) || [];

// Get all vendors
const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
```

#### New API Usage:
```javascript
// Get all products
async function loadProducts() {
    const response = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data.products;
}

// Get all orders
async function loadOrders() {
    const response = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data.orders;
}

// Get all vendors
async function loadVendors() {
    const response = await fetch('/api/admin/vendors', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data.vendors;
}
```

#### Dashboard Stats:
```javascript
// OLD:
function getDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    return {
        totalOrders: orders.length,
        totalProducts: products.length
    };
}

// NEW:
async function getDashboardStats() {
    const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data; // { totalOrders, totalRevenue, totalProducts, totalVendors }
}
```

---

### Vendor Dashboard (vendor-dashboard.html)

#### Current localStorage Usage:
```javascript
// Get vendor's products
const products = JSON.parse(localStorage.getItem('products')) || [];
const vendorProducts = products.filter(p => p.vendor_id === vendorId);

// Get vendor's orders
const orderItems = JSON.parse(localStorage.getItem('orderItems')) || [];
const vendorOrders = orderItems.filter(item => item.vendorId === vendorId);
```

#### New API Usage:
```javascript
// Get vendor's products (backend filters by vendor_id)
async function loadVendorProducts() {
    const response = await fetch('/api/vendor/products', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data.products; // Already filtered by vendor_id
}

// Get vendor's orders (backend filters by vendor_id)
async function loadVendorOrders() {
    const response = await fetch('/api/vendor/orders', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data.orders; // Already filtered by vendor_id
}

// Update product stock
async function updateStock(productId, newStock) {
    const response = await fetch(`/api/vendor/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ stock: newStock })
    });
    return await response.json();
}
```

---

### Customer Frontend (shop.html, cart.html, checkout.html)

#### Current localStorage Usage:
```javascript
// Get all products
const products = JSON.parse(localStorage.getItem('products')) || [];

// Get cart
const cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add to cart
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
}
```

#### New API Usage:
```javascript
// Get all products
async function loadProducts() {
    const response = await fetch('/api/products');
    const data = await response.json();
    return data.products;
}

// Get cart (for logged-in users)
async function loadCart() {
    const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data.cart;
}

// Add to cart
async function addToCart(productId, quantity) {
    const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ productId, quantity })
    });
    return await response.json();
}

// Place order
async function placeOrder(orderData) {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(orderData)
    });
    return await response.json();
}

// Get customer orders
async function loadMyOrders() {
    const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data.orders;
}
```

---

## AUTHENTICATION FLOW WITH DATABASE

### Login Process

#### OLD (localStorage):
```javascript
function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        // Redirect based on role
    }
}
```

#### NEW (API with JWT):
```javascript
async function handleLogin(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Store JWT token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (data.user.role === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}
```

### Token Management

```javascript
// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Get current user info
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
```

### Protected API Calls

```javascript
// Helper function for authenticated requests
async function apiCall(url, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    // Handle unauthorized
    if (response.status === 401) {
        logout();
        return;
    }
    
    return await response.json();
}

// Usage:
const products = await apiCall('/api/vendor/products');
```

---

## DATA FLOW DIAGRAMS

### Product Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Products Table                        │
│  id | vendor_id | name | price | stock | in_stock      │
└─────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐         ┌────┴────┐
    │  Admin  │          │ Vendor  │         │Customer │
    │  Views  │          │ Manages │         │ Browses │
    │   All   │          │   Own   │         │   All   │
    └─────────┘          └─────────┘         └─────────┘

Admin:   GET /api/admin/products → All products
Vendor:  GET /api/vendor/products → WHERE vendor_id = current_vendor
         POST /api/vendor/products → INSERT with vendor_id
         PUT /api/vendor/products/:id → UPDATE WHERE vendor_id = current_vendor
Customer: GET /api/products → WHERE in_stock = true
```

### Order Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                     Orders Table                         │
│  id | customer_id | total | status | created_at         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Order_Items Table                       │
│  id | order_id | product_id | vendor_id | status        │
└─────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐         ┌────┴────┐
    │  Admin  │          │ Vendor  │         │Customer │
    │  Views  │          │ Manages │         │  Views  │
    │   All   │          │   Own   │         │   Own   │
    └─────────┘          └─────────┘         └─────────┘

Admin:    GET /api/admin/orders → All orders + all items
Vendor:   GET /api/vendor/orders → Items WHERE vendor_id = current_vendor
          PUT /api/vendor/orders/:orderId/items/:itemId/status
Customer: GET /api/orders → WHERE customer_id = current_user
          POST /api/orders → Creates order + items
```

### Stock Update Flow

```
Customer Places Order
        ↓
POST /api/orders
        ↓
Backend Logic:
1. Create order record
2. Create order_items
3. UPDATE products SET stock = stock - quantity
4. INSERT INTO inventory_log
        ↓
Database Updated
        ↓
┌─────────────────────────────────────────┐
│ Admin Dashboard: Sees reduced stock     │
│ Vendor Dashboard: Sees reduced stock    │
│ Customer Shop: Sees updated availability│
└─────────────────────────────────────────┘
```

---

## BACKEND API IMPLEMENTATION EXAMPLES

### Example 1: Get Vendor Products (Filtered by Vendor)

```javascript
// Backend: /api/vendor/products
router.get('/vendor/products', authenticateToken, async (req, res) => {
    try {
        // Get vendor_id from JWT token
        const vendorId = req.user.vendorId;
        
        // Query database - only products for this vendor
        const products = await db.query(
            'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
            [vendorId]
        );
        
        res.json({ success: true, products: products.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Example 2: Create Order (Multi-Vendor Split)

```javascript
// Backend: /api/orders
router.post('/orders', authenticateToken, async (req, res) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        const { shippingAddress, paymentMethod } = req.body;
        const customerId = req.user.userId;
        
        // 1. Get cart items
        const cartItems = await client.query(
            'SELECT c.*, p.vendor_id, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.customer_id = $1',
            [customerId]
        );
        
        // 2. Calculate totals
        const subtotal = cartItems.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05;
        const shipping = 50;
        const total = subtotal + tax + shipping;
        
        // 3. Create order
        const orderId = 'CB' + Date.now().toString().slice(-8);
        await client.query(
            'INSERT INTO orders (id, customer_id, shipping_address, subtotal, tax, shipping, total, status, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [orderId, customerId, shippingAddress, subtotal, tax, shipping, total, 'Pending', paymentMethod]
        );
        
        // 4. Create order items (with vendor_id)
        for (const item of cartItems.rows) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price, total_price, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [orderId, item.product_id, item.vendor_id, item.quantity, item.price, item.price * item.quantity, 'Pending']
            );
            
            // 5. Reduce stock
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }
        
        // 6. Clear cart
        await client.query('DELETE FROM cart WHERE customer_id = $1', [customerId]);
        
        await client.query('COMMIT');
        
        res.json({ success: true, orderId, total });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});
```

### Example 3: Get Admin Dashboard Stats

```javascript
// Backend: /api/admin/dashboard
router.get('/admin/dashboard', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        // Get total orders
        const ordersResult = await db.query('SELECT COUNT(*) as count FROM orders');
        const totalOrders = ordersResult.rows[0].count;
        
        // Get total revenue
        const revenueResult = await db.query('SELECT SUM(total) as revenue FROM orders WHERE status != $1', ['Cancelled']);
        const totalRevenue = revenueResult.rows[0].revenue || 0;
        
        // Get total products
        const productsResult = await db.query('SELECT COUNT(*) as count FROM products WHERE status = $1', ['active']);
        const totalProducts = productsResult.rows[0].count;
        
        // Get total vendors
        const vendorsResult = await db.query('SELECT COUNT(*) as count FROM vendors WHERE status = $1', ['active']);
        const totalVendors = vendorsResult.rows[0].count;
        
        // Get recent orders
        const recentOrders = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10');
        
        res.json({
            success: true,
            totalOrders,
            totalRevenue,
            totalProducts,
            totalVendors,
            recentOrders: recentOrders.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Example 4: Update Order Item Status (Vendor)

```javascript
// Backend: /api/vendor/orders/:orderId/items/:itemId/status
router.put('/vendor/orders/:orderId/items/:itemId/status', authenticateToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status, deliveryDate } = req.body;
        const vendorId = req.user.vendorId;
        
        // Check if item belongs to this vendor
        const item = await db.query(
            'SELECT * FROM order_items WHERE id = $1 AND order_id = $2 AND vendor_id = $3',
            [itemId, orderId, vendorId]
        );
        
        if (item.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Update status
        await db.query(
            'UPDATE order_items SET status = $1, delivery_date = $2, updated_at = NOW() WHERE id = $3',
            [status, deliveryDate, itemId]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## FRONTEND CODE CHANGES SUMMARY

### Files to Update:

#### 1. admin-script.js
- Replace all `localStorage.getItem('products')` with `await apiCall('/api/admin/products')`
- Replace all `localStorage.getItem('orders')` with `await apiCall('/api/admin/orders')`
- Replace all `localStorage.getItem('vendors')` with `await apiCall('/api/admin/vendors')`
- Replace all `localStorage.setItem()` with appropriate POST/PUT API calls

#### 2. vendor-dashboard.html + scripts
- Replace `localStorage.getItem('products')` with `await apiCall('/api/vendor/products')`
- Replace `localStorage.getItem('orderItems')` with `await apiCall('/api/vendor/orders')`
- Replace stock updates with `PUT /api/vendor/products/:id/stock`

#### 3. product-display.js
- Replace `localStorage.getItem('products')` with `await fetch('/api/products')`
- Replace `localStorage.getItem('vendors')` with `await fetch('/api/vendors')` (if needed)

#### 4. order-management.js
- Replace entire order creation logic with `POST /api/orders`
- Replace cart operations with API calls

#### 5. script.js (customer frontend)
- Replace cart operations with API calls
- Replace product fetching with API calls

#### 6. unified-auth.js
- Replace login logic with `POST /api/auth/login`
- Store JWT token instead of user object
- Add token to all API requests

---

## MIGRATION CHECKLIST

### Phase 1: Backend Setup
- [ ] Set up PostgreSQL database
- [ ] Create all tables with proper schema
- [ ] Set up Node.js/Express backend
- [ ] Implement JWT authentication
- [ ] Create all API endpoints

### Phase 2: Authentication
- [ ] Update login.html to use POST /api/auth/login
- [ ] Store JWT token in localStorage
- [ ] Add token to all API requests
- [ ] Implement token refresh logic

### Phase 3: Admin Dashboard
- [ ] Update admin-dashboard.html to fetch from APIs
- [ ] Update vendor management to use APIs
- [ ] Update product viewing to use APIs
- [ ] Update order management to use APIs

### Phase 4: Vendor Dashboard
- [ ] Update vendor-dashboard.html to fetch from APIs
- [ ] Update product management to use APIs
- [ ] Update stock management to use APIs
- [ ] Update order viewing to use APIs

### Phase 5: Customer Frontend
- [ ] Update shop.html to fetch products from API
- [ ] Update cart.html to use cart APIs
- [ ] Update checkout.html to use order API
- [ ] Update orders.html to fetch from API

### Phase 6: Testing
- [ ] Test admin creates vendor → vendor can login
- [ ] Test vendor adds product → appears in admin & customer
- [ ] Test customer orders → appears in admin & vendor
- [ ] Test stock updates → reflects everywhere
- [ ] Test order status updates → reflects everywhere

---

## REAL-TIME SYNC BEHAVIOR

### How Data Stays Synchronized

#### Scenario: Admin Creates Category

```
Time: 10:00 AM
Action: Admin creates "Organic Oils" category

Database:
INSERT INTO categories (name) VALUES ('Organic Oils')

Result:
- Admin dashboard: Immediately sees new category
- Vendor (already on page): Needs to refresh or re-fetch categories
- Customer (browsing shop): Needs to refresh to see new filter

Solution: Implement auto-refresh or WebSocket for real-time updates
```

#### Scenario: Vendor Updates Stock

```
Time: 10:05 AM
Action: Vendor updates Ghee stock from 50 to 25

Database:
UPDATE products SET stock = 25 WHERE id = 1

Result:
- Vendor dashboard: Shows 25 immediately
- Admin dashboard: Shows 25 on next page load
- Customer shop: Shows updated stock on next page load
- Customer viewing product: Needs refresh to see update

Solution: Refresh data periodically or on page focus
```

#### Scenario: Customer Places Order

```
Time: 10:10 AM
Action: Customer orders 2 Ghee + 1 Paneer

Database:
INSERT INTO orders (...)
INSERT INTO order_items (order_id, product_id=1, vendor_id=1, ...)
INSERT INTO order_items (order_id, product_id=8, vendor_id=1, ...)
UPDATE products SET stock = stock - 2 WHERE id = 1
UPDATE products SET stock = stock - 1 WHERE id = 8

Result:
- Customer: Sees order confirmation
- Admin: Sees new order on dashboard refresh
- Vendor A: Sees 2 new order items on dashboard refresh
- Stock: Reduced for both products everywhere

Solution: Admin/Vendor dashboards poll for new orders every 30 seconds
```

### Implementing Auto-Refresh

```javascript
// Admin Dashboard - Poll for new orders
let orderRefreshInterval;

function startOrderPolling() {
    orderRefreshInterval = setInterval(async () => {
        const orders = await apiCall('/api/admin/orders?status=Pending');
        updateOrdersTable(orders);
    }, 30000); // Every 30 seconds
}

// Stop polling when leaving page
window.addEventListener('beforeunload', () => {
    clearInterval(orderRefreshInterval);
});

// Start polling on page load
document.addEventListener('DOMContentLoaded', () => {
    startOrderPolling();
});
```

### Implementing Page Refresh on Focus

```javascript
// Refresh data when user returns to tab
document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
        // User returned to tab, refresh data
        await loadProducts();
        await loadOrders();
    }
});
```

---

## HANDLING GUEST USERS (Non-Logged-In)

### Cart for Guest Users

```javascript
// Guest users: Use localStorage for cart
// Logged-in users: Use database

async function addToCart(productId, quantity) {
    if (isAuthenticated()) {
        // Logged-in: Save to database
        return await apiCall('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    } else {
        // Guest: Save to localStorage
        const cart = JSON.parse(localStorage.getItem('guestCart')) || [];
        cart.push({ productId, quantity });
        localStorage.setItem('guestCart', JSON.stringify(cart));
        return { success: true };
    }
}

// On login: Merge guest cart with database cart
async function onLogin() {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
    
    if (guestCart.length > 0) {
        // Send guest cart to backend to merge
        await apiCall('/api/cart/merge', {
            method: 'POST',
            body: JSON.stringify({ items: guestCart })
        });
        
        // Clear guest cart
        localStorage.removeItem('guestCart');
    }
}
```

---

## ERROR HANDLING

### Network Errors

```javascript
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - redirect to login
                logout();
                return;
            }
            
            if (response.status === 403) {
                // Forbidden
                throw new Error('You do not have permission to perform this action');
            }
            
            if (response.status === 404) {
                throw new Error('Resource not found');
            }
            
            throw new Error('Server error');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        
        // Show user-friendly error
        if (error.message === 'Failed to fetch') {
            alert('Network error. Please check your connection.');
        } else {
            alert(error.message);
        }
        
        throw error;
    }
}
```

### Optimistic Updates

```javascript
// Update UI immediately, rollback if API fails
async function updateStock(productId, newStock) {
    const oldStock = getCurrentStock(productId);
    
    // Update UI immediately
    updateStockInUI(productId, newStock);
    
    try {
        // Send to backend
        await apiCall(`/api/vendor/products/${productId}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ stock: newStock })
        });
    } catch (error) {
        // Rollback on error
        updateStockInUI(productId, oldStock);
        alert('Failed to update stock. Please try again.');
    }
}
```

---

## PERFORMANCE OPTIMIZATION

### Caching Strategy

```javascript
// Cache products for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let productsCache = null;
let productsCacheTime = 0;

async function getProducts(forceRefresh = false) {
    const now = Date.now();
    
    // Return cached data if still valid
    if (!forceRefresh && productsCache && (now - productsCacheTime < CACHE_DURATION)) {
        return productsCache;
    }
    
    // Fetch fresh data
    const products = await apiCall('/api/products');
    productsCache = products;
    productsCacheTime = now;
    
    return products;
}
```

### Pagination

```javascript
// Load products in pages
async function loadProducts(page = 1, limit = 20) {
    const response = await apiCall(`/api/products?page=${page}&limit=${limit}`);
    return response; // { products: [...], total, page, pages }
}
```

### Lazy Loading

```javascript
// Load images lazily
<img src="placeholder.jpg" data-src="actual-image.jpg" loading="lazy">
```

---

## SUMMARY

### Key Changes:

1. **Remove localStorage** for all business data (products, orders, vendors)
2. **Keep localStorage** only for JWT token and UI preferences
3. **All roles fetch from same database** via APIs
4. **Backend filters data** based on role and user ID
5. **Real-time sync** via polling or WebSocket
6. **Guest cart** in localStorage, merge on login
7. **Optimistic updates** for better UX
8. **Error handling** for network issues
9. **Caching** for performance

### Data Flow:

```
Frontend (Admin/Vendor/Customer)
        ↓
    API Call with JWT
        ↓
Backend validates token & role
        ↓
Query PostgreSQL Database
        ↓
Filter data based on role
        ↓
Return JSON response
        ↓
Frontend updates UI
```

### No UI Changes Required:

- All HTML files stay the same
- Only JavaScript logic changes
- Replace localStorage calls with API calls
- Add loading states
- Add error handling

The system will work as a unified platform where all roles share the same data source (PostgreSQL) instead of isolated localStorage instances.
