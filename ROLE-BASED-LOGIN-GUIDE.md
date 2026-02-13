# Role-Based Login System - User Guide

## How It Works

The login system now automatically detects user roles and shows appropriate login buttons.

---

## Login Process

### Step 1: Open Sign In Modal
- Click "Login" button in the navigation bar
- The Sign In modal will appear

### Step 2: Enter Credentials
- Type your email in the "Email or Mobile" field
- Type your password in the "Password" field

### Step 3: Role Detection
As you type, the system automatically checks your credentials:

**If Admin Credentials Detected:**
- "Enter as Admin" button appears
- Click it to access Admin Dashboard

**If Vendor Credentials Detected:**
- "Enter as Vendor" button appears
- Click it to access Vendor Dashboard

**If Customer Credentials:**
- Regular "Sign In" button remains
- Click it to login as customer

---

## Demo Credentials

### Admin Login
```
Email: admin@cb.com
Password: admin123
```
**Result:** "Enter as Admin" button appears

### Vendor Login
```
Email: vendor@cb.com
Password: vendor123
```
**Result:** "Enter as Vendor" button appears

### Customer Login
```
Email: customer@cb.com
Password: customer123
```
**Result:** Regular "Sign In" button (stays on store)

---

## Visual Flow

```
1. User opens Sign In modal
   ↓
2. User types email + password
   ↓
3. System checks credentials in real-time
   ↓
4a. Admin detected → Show "Enter as Admin" button
4b. Vendor detected → Show "Enter as Vendor" button
4c. Customer → Show regular "Sign In" button
   ↓
5. User clicks appropriate button
   ↓
6. Redirect to correct dashboard
```

---

## Features

✅ **Real-time Detection**
- Buttons appear as you type
- No need to submit first

✅ **Role-Specific Buttons**
- Clear indication of user role
- Prevents confusion

✅ **Removed Footer Admin Link**
- Cleaner interface
- All login through one modal

✅ **Works on All Pages**
- index.html (homepage)
- shop.html (products page)
- Any page with the auth modal

---

## Technical Details

### Files Modified
1. `index.html` - Updated Sign In form, removed footer admin link
2. `shop.html` - Updated Sign In form, removed footer admin link
3. `script.js` - Added role detection functions

### Functions Added
- `checkUserRole()` - Detects role as user types
- `showRoleButtons(role)` - Shows appropriate button
- `hideRoleButtons()` - Hides role buttons
- `enterAsAdmin()` - Admin login handler
- `enterAsVendor()` - Vendor login handler

### How Detection Works
```javascript
// On every keystroke in email/password fields
1. Get email and password values
2. Check against users in localStorage
3. If match found, check user.role
4. Show appropriate button based on role
```

---

## Troubleshooting

### Issue: Buttons not appearing
**Solution:**
- Make sure you've typed both email AND password completely
- Check that credentials match exactly (case-sensitive)
- Open browser console (F12) to check for errors

### Issue: Wrong button appears
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Try again

### Issue: Button appears but redirect fails
**Solution:**
- Check browser console for errors
- Verify vendor record exists (for vendor login)
- Use `test-vendor-login.html` to debug

---

## For Developers

### Adding New Roles
To add a new role (e.g., "manager"):

1. Add user to localStorage with role='manager'
2. Update `showRoleButtons()` function
3. Add new button in HTML
4. Create `enterAsManager()` function
5. Add redirect logic

### Customizing Button Text
Edit the button text in `index.html` and `shop.html`:
```html
<button ... onclick="enterAsAdmin()">
    Enter as Admin  <!-- Change this text -->
</button>
```

---

## Security Notes

⚠️ **This is a prototype system**
- Passwords stored in plain text
- No encryption
- Client-side validation only
- Not suitable for production

**For production:**
- Use backend authentication
- Hash passwords
- Use JWT tokens
- Add rate limiting
- Add CAPTCHA

---

**Version:** 2.0
**Last Updated:** February 12, 2026
**Status:** Role-Based Login Active
