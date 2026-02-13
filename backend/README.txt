CB ORGANIC STORE - BACKEND SETUP INSTRUCTIONS

1. INSTALL DEPENDENCIES
   cd backend
   npm install

2. SETUP POSTGRESQL DATABASE
   - Install PostgreSQL
   - Create database: CREATE DATABASE cb_organic;
   - Run database.sql to create tables

3. CONFIGURE ENVIRONMENT
   - Edit .env file
   - Set your database credentials
   - Change JWT_SECRET to a secure random string

4. START SERVER
   npm start
   
   Or for development with auto-reload:
   npm run dev

5. TEST API
   Server runs on http://localhost:5000
   Test: GET http://localhost:5000/

API ENDPOINTS:

AUTH:
POST /api/auth/register - Register new customer
POST /api/auth/login - Login (all roles)

PRODUCTS (Public):
GET /api/products - Get all products
GET /api/products/:id - Get product by ID

ORDERS (Customer):
POST /api/orders - Create order
GET /api/orders - Get customer orders
GET /api/orders/:id - Get order details

CART (Customer):
GET /api/cart - Get cart
POST /api/cart - Add to cart
PUT /api/cart/:itemId - Update cart item
DELETE /api/cart/:itemId - Remove from cart

ADMIN:
GET /api/admin/dashboard - Dashboard stats
POST /api/admin/vendors - Create vendor
GET /api/admin/vendors - Get all vendors
GET /api/admin/orders - Get all orders
PUT /api/admin/orders/:id/status - Update order status
GET /api/admin/products - Get all products

VENDOR:
GET /api/vendor/dashboard - Vendor dashboard
GET /api/vendor/products - Get vendor products
POST /api/vendor/products - Create product
PUT /api/vendor/products/:id - Update product
PUT /api/vendor/products/:id/stock - Update stock
DELETE /api/vendor/products/:id - Delete product
GET /api/vendor/orders - Get vendor orders
PUT /api/vendor/orders/:orderId/items/:itemId/status - Update order item status

CATEGORIES:
GET /api/categories - Get all categories
POST /api/categories - Create category (admin/vendor)
DELETE /api/categories/:id - Delete category (admin/vendor)

DEFAULT CREDENTIALS (Create via API):
Admin: admin@cb.com / admin123
Vendor: vendor@cb.com / vendor123
Customer: customer@cb.com / customer123
