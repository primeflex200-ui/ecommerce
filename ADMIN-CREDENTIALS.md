# CB Organic Store - Admin Credentials

## Admin Login

**Email:** ruthvik@blockfortrust.com  
**Password:** Saireddy880227

## How to Login

1. Go to the website homepage (index.html or shop.html)
2. Click on "Sign In" button in the navigation
3. Enter the admin email: `ruthvik@blockfortrust.com`
4. Enter the password: `Saireddy880227`
5. The system will detect you're an admin and show "Enter as Admin" button
6. Click "Enter as Admin" to access the admin dashboard

## Customer Login (Demo)

**Email:** customer@cb.com  
**Password:** customer123

## Admin Dashboard Features

Once logged in as admin, you can:
- View dashboard statistics
- Manage products (add, edit, delete)
- Manage vendors/suppliers (add, edit, delete)
- View and manage orders
- Manage product categories

## Important Notes

- Vendors are now managed as supplier records only (no vendor login)
- Only two user roles exist: Admin and Customer
- Admin has full access to all management features
- The system uses localStorage for demo purposes
- For production, implement proper backend authentication with bcrypt password hashing

## Security Reminder

⚠️ **For Production Use:**
- Change these credentials immediately
- Implement proper password hashing (bcrypt)
- Use environment variables for sensitive data
- Enable HTTPS
- Implement rate limiting on login attempts
- Add two-factor authentication (2FA)
