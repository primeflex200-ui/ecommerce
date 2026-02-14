# 🎯 Admin Login Setup - Complete Guide

## ✅ Updated Admin Credentials

```
Email: ruthvik@blockfortrust.com
Password: Saireddy880227
```

## 🚀 Quick Setup (3 Steps)

### Step 1: Clear Old Cache
Open in browser: **`clear-cache.html`**
- Click "Clear Cache & Reset" button
- Wait for success message
- You'll be redirected automatically

### Step 2: Test Credentials (Optional but Recommended)
Open in browser: **`test-admin-login.html`**
- This will automatically test if credentials are working
- Shows green ✅ if successful
- Shows red ❌ if there's an issue (then click "Clear Cache & Reset")

### Step 3: Login
1. Go to **`index.html`** or **`shop.html`**
2. Click **"Sign In"** button
3. Enter email: `ruthvik@blockfortrust.com`
4. Enter password: `Saireddy880227`
5. **"Enter as Admin"** button will appear
6. Click it to access admin dashboard

## 📁 Files Updated

All these files now have the new credentials:

1. ✅ `unified-auth.js` - Main authentication
2. ✅ `admin-script.js` - Admin login validation
3. ✅ `login.html` - Login page display
4. ✅ `admin.html` - Admin login page
5. ✅ `supabase-schema.sql` - Database schema
6. ✅ `clear-cache.html` - Cache clearing tool
7. ✅ `test-admin-login.html` - Testing tool (NEW)
8. ✅ `ADMIN-CREDENTIALS.md` - Credentials reference
9. ✅ `QUICK-START.md` - Quick start guide

## 🎬 How It Works

When you enter the admin email and password:

```
1. Type email → System checks localStorage for user
2. Type password → System validates credentials  
3. Detects role = 'admin' → Shows "Enter as Admin" button
4. Click button → Redirects to admin-dashboard.html
```

## 🔧 Troubleshooting

### Problem: "Invalid email or password"
**Solution:**
1. Open `clear-cache.html`
2. Click "Clear Cache & Reset"
3. Try logging in again

### Problem: "Enter as Admin" button not showing
**Solution:**
1. Make sure you typed the EXACT email: `ruthvik@blockfortrust.com`
2. Password is case-sensitive: `Saireddy880227`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try in incognito/private mode

### Problem: Still not working
**Solution:**
1. Open `test-admin-login.html` in browser
2. It will show you what's wrong
3. Click "Clear Cache & Reset" button
4. Test again

## 🧪 Testing Tools

### Tool 1: test-admin-login.html
- **Purpose:** Test if credentials are working
- **Features:**
  - Auto-tests credentials on page load
  - Shows success/error status
  - Can clear cache and reset
  - Shows all users in system
  - Visual feedback with colors

### Tool 2: clear-cache.html
- **Purpose:** Clear old data and reset credentials
- **Features:**
  - Clears all localStorage
  - Resets to new admin credentials
  - Visual confirmation
  - Auto-redirects to homepage

## 📱 What You'll See

### On Login Page (index.html or shop.html):
```
┌─────────────────────────────┐
│      Welcome Back           │
│                             │
│  Email or Mobile            │
│  ruthvik@blockfortrust.com  │
│                             │
│  Password                   │
│  ••••••••••••••             │
│                             │
│  ┌─────────────────────┐   │
│  │  Enter as Admin     │   │ ← This button appears!
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │     Sign In         │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

## 🎯 Expected Behavior

1. **Before typing:** Only "Sign In" button visible
2. **After typing email:** System checks if user exists
3. **After typing password:** System validates credentials
4. **If admin detected:** "Enter as Admin" button appears above "Sign In"
5. **Click "Enter as Admin":** Redirects to admin dashboard
6. **Click "Sign In":** Regular customer login (for non-admin users)

## 🔐 Security Notes

- Password is case-sensitive
- Email must be exact match
- No spaces before or after credentials
- System uses localStorage (demo only)
- For production: use backend authentication with bcrypt

## 📞 Need Help?

1. **First:** Open `test-admin-login.html` to diagnose
2. **Second:** Open `clear-cache.html` to reset
3. **Third:** Try in incognito mode
4. **Fourth:** Check browser console (F12) for errors

## ✨ Success Indicators

You'll know it's working when:
- ✅ Test page shows green success message
- ✅ "Enter as Admin" button appears on login
- ✅ Clicking button redirects to admin dashboard
- ✅ Admin dashboard loads with all features

---

**Ready to test?** → Open `test-admin-login.html` first! 🚀
