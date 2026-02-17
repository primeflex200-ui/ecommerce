# Quick Start: Products Database Integration

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration (2 minutes)
1. Open your Supabase project: https://supabase.com/dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `SUPABASE-PRODUCTS-MIGRATION.sql`
5. Click **Run** (or press Ctrl+Enter)
6. You should see: "Success. No rows returned"

### Step 2: Test the Integration (1 minute)
1. Open `test-product-integration.html` in your browser
2. Click all test buttons to verify:
   - ✅ Supabase connection works
   - ✅ Can fetch products
   - ✅ Can add products
   - ✅ Schema is correct
3. If all tests pass, you're ready!

### Step 3: Add Your First Product (2 minutes)
1. Open your website
2. Login as admin:
   - Email: `ruthvik@blockfortrust.com`
   - Password: `880227`
3. Click **Admin Dashboard** from profile dropdown
4. Click **Add Product** in sidebar
5. Fill in product details:
   - Name: "Organic Milk"
   - Category: "Bakery & Dairy"
   - Subcategory: "Dairy"
   - Price: 60
   - Stock: 50
   - Unit: "liter"
   - Unit Quantity: 1
   - Description: "Fresh organic cow milk"
6. Upload an image (optional)
7. Click **Add Product**
8. Visit shop page - your product should appear!

## ✅ Verification

### Check Shop Page
- Visit `shop.html`
- Should see your product displayed
- If no products added yet, shows "No products available"

### Check Admin Products
- Go to Admin Dashboard → Products
- Should see list of all products
- Can edit, delete, or toggle stock status

## 🎯 What's Different Now?

### Before:
- Shop showed dummy/fake products
- Products stored in browser localStorage
- Not shared across devices
- Admin changes only local

### After:
- Shop shows ONLY real products from database
- Products stored in Supabase
- Shared across all devices
- Admin changes affect all users
- No dummy data!

## 📝 Common Tasks

### Add More Products
1. Admin Dashboard → Add Product
2. Fill form and submit
3. Product appears on shop page immediately

### Delete Product
1. Admin Dashboard → Products
2. Click **Delete** button
3. Confirm deletion
4. Product removed from shop page

### Update Stock
1. Admin Dashboard → Products
2. Click **Mark Out** to mark out of stock
3. Click **Mark In** to mark in stock
4. Shop page updates automatically

### View All Products
1. Go to shop page
2. All database products displayed
3. Filter by category using navigation

## 🐛 Troubleshooting

### "No products available" on shop page
- ✅ This is correct if you haven't added products yet
- Add products through admin dashboard

### Products not saving
- Check browser console for errors
- Verify Supabase connection
- Ensure migration was run

### Images not showing
- Images stored as base64 in database
- Use small images (< 1MB recommended)
- Default placeholder used if no image

### Can't login as admin
- Email: `ruthvik@blockfortrust.com`
- Password: `880227`
- Make sure you're on the homepage to login

## 📚 More Information

- Full guide: `PRODUCTS-DATABASE-SETUP.md`
- Migration script: `SUPABASE-PRODUCTS-MIGRATION.sql`
- Test page: `test-product-integration.html`
- Summary: `SHOP-DATABASE-INTEGRATION-COMPLETE.md`

## 🎉 You're All Set!

Your shop is now connected to a real database. Add products through the admin dashboard and they'll appear on the shop page for all users!

---
**Need Help?** Check the browser console for error messages or review the full documentation.
