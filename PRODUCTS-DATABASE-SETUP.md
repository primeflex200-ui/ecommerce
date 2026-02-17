# Products Database Setup Guide

## Overview
The shop page now displays products from the Supabase database instead of dummy data. Products are only shown when added through the admin dashboard.

## What Changed

### 1. Product Display (shop.html)
- Products are now fetched from Supabase `products` table
- No more dummy/hardcoded products
- Shows "No products available" message when database is empty
- Real-time data from database

### 2. Admin Product Management
- Products are saved to Supabase database when added
- Product list loads from database
- Delete and stock toggle operations update database
- All changes persist in Supabase

### 3. Database Schema Updates
The `products` table now includes:
- `id` (UUID) - Auto-generated
- `name` (TEXT) - Product name
- `category` (TEXT) - Main category
- `subcategory` (TEXT) - Subcategory
- `price` (NUMERIC) - Product price
- `stock` (INT) - Stock quantity
- `unit` (TEXT) - Unit type (kg, ml, piece, etc.)
- `unit_quantity` (NUMERIC) - Quantity per unit
- `display_unit` (TEXT) - Display format (e.g., "500ml")
- `vendor_id` (UUID) - Reference to vendors table
- `image_url` (TEXT) - Product image
- `description` (TEXT) - Product description
- `in_stock` (BOOLEAN) - Stock availability flag
- `created_at` (TIMESTAMP) - Creation timestamp

## Setup Instructions

### Step 1: Run Database Migration
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the migration file: `SUPABASE-PRODUCTS-MIGRATION.sql`
4. This will add all required columns to your products table

### Step 2: Clear Old Data (Optional)
If you have old localStorage data, you can clear it:
```javascript
// Open browser console and run:
localStorage.removeItem('products');
```

### Step 3: Test the Flow
1. Login as admin (ruthvik@blockfortrust.com / 880227)
2. Go to Admin Dashboard
3. Click "Add Product"
4. Fill in product details and submit
5. Product should save to Supabase
6. Visit shop page - product should display
7. If no products added, shop shows "No products available" message

## How It Works

### Adding Products
1. Admin fills product form in `admin-add-product.html`
2. Form submits to `handleAddProduct()` function
3. Product data is inserted into Supabase `products` table
4. Success message shown, redirects to products list

### Displaying Products
1. Shop page loads `product-display.js`
2. `loadProductsWithVendors()` function fetches from Supabase
3. Products are rendered with vendor information
4. Empty state shown if no products exist

### Managing Products
1. Admin products page loads from Supabase
2. Delete button removes from database
3. Stock toggle updates `in_stock` field
4. All changes persist in Supabase

## Troubleshooting

### Products Not Showing
1. Check Supabase connection in browser console
2. Verify products exist in database (SQL Editor: `SELECT * FROM products;`)
3. Check for JavaScript errors in console
4. Ensure Supabase credentials are correct in `supabase-auth.js`

### Cannot Add Products
1. Verify admin is logged in
2. Check database migration was run successfully
3. Look for errors in browser console
4. Verify all required fields are filled

### Images Not Displaying
1. Images are stored as base64 in `image_url` column
2. For production, consider using Supabase Storage
3. Default placeholder: `images/placeholder.png`

## Database Queries

### View All Products
```sql
SELECT * FROM products ORDER BY created_at DESC;
```

### Count Products by Category
```sql
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category;
```

### Find Out of Stock Products
```sql
SELECT name, stock 
FROM products 
WHERE in_stock = false OR stock = 0;
```

### Delete All Products (Use with caution!)
```sql
DELETE FROM products;
```

## Next Steps

1. Add more products through admin dashboard
2. Test product display on shop page
3. Verify cart functionality with database products
4. Consider implementing product search/filter
5. Add product image upload to Supabase Storage

## Files Modified

- `product-display.js` - Fetches from Supabase
- `admin-script.js` - Saves to Supabase
- `backend/database.sql` - Updated schema
- `SUPABASE-PRODUCTS-MIGRATION.sql` - Migration script

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure migration was run successfully
4. Test with a simple product first
