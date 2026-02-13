# Vendor Login Troubleshooting Guide

## Issue: Vendor not redirecting to dashboard after login

### Quick Fix Steps:

1. **Open the test page:**
   - Navigate to `test-vendor-login.html` in your browser
   - This will show you all the session data and storage contents

2. **Check the console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any error messages

3. **Verify vendor data:**
   - In the test page, click "Show All Vendors"
   - Make sure there's a vendor with matching email
   - Check that `userId` matches a user in the users array

4. **Test vendor login:**
   - In the test page, click "Test Vendor Login"
   - This will manually set up the vendor session
   - Then click "Go to Vendor Dashboard"

### Manual Steps to Fix:

#### Step 1: Clear localStorage
```javascript
// Open browser console and run:
localStorage.clear();
```

#### Step 2: Reload the page
- Refresh the browser
- This will reinitialize default data

#### Step 3: Try logging in again
- Go to `login.html`
- Use: vendor@cb.com / vendor123

### Debug Checklist:

✅ Check if `unified-auth.js` is loaded
✅ Check if `order-management.js` is loaded
✅ Check if `admin-script.js` is loaded
✅ Verify vendor exists in localStorage
✅ Verify user has role='vendor'
✅ Check browser console for errors

### Expected localStorage after vendor login:

```javascript
{
  "isLoggedIn": "true",
  "userRole": "vendor",
  "currentVendorId": "1",
  "currentVendorName": "Vendor One",
  "currentUser": "{...user object...}",
  "vendorLoggedIn": "true"
}
```

### Common Issues:

**Issue 1: Vendor record not found**
- Solution: Make sure vendor email matches user email
- Check: `vendors` array has entry with correct `userId` or `email`

**Issue 2: Redirect loop**
- Solution: Clear localStorage and try again
- Check: No conflicting auth checks

**Issue 3: Dashboard shows "No products"**
- Solution: Products need `vendor_id` field
- Check: Products in localStorage have `vendor_id: 1`

### Testing with Browser Console:

```javascript
// Check current session
console.log('Logged in:', localStorage.getItem('isLoggedIn'));
console.log('Role:', localStorage.getItem('userRole'));
console.log('Vendor ID:', localStorage.getItem('currentVendorId'));

// Check vendors
console.log('Vendors:', JSON.parse(localStorage.getItem('vendors')));

// Check users
console.log('Users:', JSON.parse(localStorage.getItem('users')));

// Manually set vendor session (for testing)
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('userRole', 'vendor');
localStorage.setItem('currentVendorId', '1');
localStorage.setItem('currentVendorName', 'Vendor One');
```

### Files to Check:

1. **login.html** - Login form
2. **unified-auth.js** - Authentication logic
3. **vendor-dashboard.html** - Vendor dashboard page
4. **admin-script.js** - Dashboard loading logic
5. **order-management.js** - Order functions

### Console Logging:

The system now includes detailed console logging:
- Login process logs
- Vendor session setup logs
- Dashboard loading logs
- Error messages

Check the browser console for these messages to see where the process fails.

---

## Still Having Issues?

1. Open `test-vendor-login.html`
2. Click "Show Session Data"
3. Take a screenshot
4. Check what's missing or incorrect
5. Use "Test Vendor Login" button to manually set session
6. Try accessing dashboard again

---

**Last Updated:** February 12, 2026
