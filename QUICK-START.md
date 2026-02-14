# CB Organic Store - Quick Start Guide

## 🚀 Getting Started

### Step 1: Clear Cache (IMPORTANT!)
Before logging in with the new credentials, you need to clear the old cached data:

1. Open your browser and go to: `clear-cache.html`
2. Click "Clear Cache & Reset" button
3. Wait for the success message
4. You'll be redirected to the homepage

### Step 2: Login as Admin

1. Go to the homepage (`index.html` or `shop.html`)
2. Click the "Sign In" button in the navigation bar
3. Enter the following credentials:
   - **Email:** `ruthvik@blockfortrust.com`
   - **Password:** `Saireddy880227`
4. After entering both fields, the system will detect you're an admin
5. An "Enter as Admin" button will appear
6. Click "Enter as Admin" to access the admin dashboard

## 📋 Admin Credentials

```
Email: ruthvik@blockfortrust.com
Password: Saireddy880227
```

## 🎯 What Happens When You Login

1. **Type your email** → System checks if user exists
2. **Type your password** → System validates credentials
3. **Admin detected** → "Enter as Admin" button appears
4. **Click button** → Redirects to admin dashboard

## 🔧 Troubleshooting

### "Invalid email or password" error?
- **Solution:** Go to `clear-cache.html` first to reset credentials
- Make sure you're using the exact email: `ruthvik@blockfortrust.com`
- Password is case-sensitive: `Saireddy880227`

### "Enter as Admin" button not showing?
- **Solution:** Clear your browser cache
- Go to `clear-cache.html` and click the reset button
- Try logging in again

### Still having issues?
1. Open browser console (F12)
2. Go to Application → Local Storage
3. Clear all data manually
4. Refresh the page
5. Try logging in again

## 📱 Customer Login (For Testing)

```
Email: customer@cb.com
Password: customer123
```

## 🎨 Admin Dashboard Features

Once logged in as admin, you can:
- ✅ View dashboard statistics
- ✅ Manage products (add, edit, delete)
- ✅ Manage vendors/suppliers
- ✅ View and manage orders
- ✅ Manage product categories

## 🔐 Security Notes

- Vendors are now supplier records only (no vendor login)
- Only two user roles: Admin and Customer
- For production, implement proper backend authentication
- Use environment variables for credentials
- Enable HTTPS in production

## 📞 Need Help?

If you're still having trouble:
1. Clear browser cache completely
2. Use incognito/private browsing mode
3. Try a different browser
4. Check browser console for errors

---

**Ready to start?** → Go to `clear-cache.html` first! 🚀
