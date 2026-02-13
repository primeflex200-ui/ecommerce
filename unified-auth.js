// ===== UNIFIED AUTHENTICATION SYSTEM =====

// Initialize default users
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
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
            },
            { 
                id: 'customer-001', 
                email: 'customer@cb.com', 
                password: 'customer123', 
                role: 'customer',
                firstName: 'John',
                lastName: 'Doe'
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Initialize vendors
function initializeVendorsData() {
    if (!localStorage.getItem('vendors')) {
        const defaultVendors = [
            { 
                id: 1, 
                vendorName: 'Vendor One',
                businessName: 'CB Organic Farm', 
                email: 'vendor@cb.com',
                userId: 'vendor-001',
                phone: '9876543210', 
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('vendors', JSON.stringify(defaultVendors));
    }
}

// Call initialization
initializeUsers();
initializeVendorsData();

// Unified Login Handler
function handleUnifiedLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');
    
    console.log('=== Login Attempt ===');
    console.log('Email:', email);
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Total users in storage:', users.length);
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('User found:', user.email, 'Role:', user.role);
        
        // Store session data
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', user.role);
        
        messageEl.textContent = 'Login successful! Redirecting...';
        messageEl.className = 'login-message success';
        
        // Role-based redirect
        setTimeout(() => {
            if (user.role === 'admin') {
                console.log('Redirecting to admin dashboard');
                window.location.href = 'admin-dashboard.html';
            } else if (user.role === 'vendor') {
                console.log('Processing vendor login...');
                
                // Store vendor-specific data
                const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
                console.log('Total vendors in storage:', vendors.length);
                console.log('Looking for vendor with userId:', user.id, 'or email:', user.email);
                
                const vendor = vendors.find(v => v.userId === user.id || v.email === user.email);
                
                if (vendor) {
                    console.log('Vendor found:', vendor);
                    localStorage.setItem('currentVendorId', vendor.id);
                    localStorage.setItem('currentVendorName', vendor.vendorName);
                    localStorage.setItem('vendorLoggedIn', 'true');
                    console.log('Vendor session set - ID:', vendor.id, 'Name:', vendor.vendorName);
                    console.log('Redirecting to vendor dashboard...');
                    window.location.href = 'vendor-dashboard.html';
                } else {
                    console.error('Vendor record not found for user:', user.id, user.email);
                    console.log('Available vendors:', vendors);
                    messageEl.textContent = 'Vendor account not found. Please contact admin.';
                    messageEl.className = 'login-message error';
                }
            } else if (user.role === 'customer') {
                console.log('Redirecting to store homepage');
                window.location.href = 'index.html';
            } else {
                console.log('Unknown role, redirecting to homepage');
                window.location.href = 'index.html';
            }
        }, 1000);
    } else {
        console.log('Login failed - invalid credentials');
        messageEl.textContent = 'Invalid email or password';
        messageEl.className = 'login-message error';
    }
}

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && !currentPage.includes('login.html') && !currentPage.includes('index.html')) {
        window.location.href = 'login.html';
    }
}

// Check role-based access
function checkRoleAccess(allowedRoles) {
    const userRole = localStorage.getItem('userRole');
    
    if (!allowedRoles.includes(userRole)) {
        alert('Access denied. You do not have permission to view this page.');
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentVendorId');
    localStorage.removeItem('currentVendorName');
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Check vendor authentication
function checkVendorAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('vendor-dashboard') || currentPage.includes('vendor-products') || currentPage.includes('vendor-orders')) {
        if (!isLoggedIn || userRole !== 'vendor') {
            console.log('Vendor auth failed, redirecting to login');
            window.location.href = 'login.html';
            return false;
        }
        
        // Ensure vendor session data is set
        const currentVendorId = localStorage.getItem('currentVendorId');
        if (!currentVendorId) {
            console.log('Vendor ID not found, attempting to set from user data');
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.role === 'vendor') {
                const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
                const vendor = vendors.find(v => v.userId === currentUser.id || v.email === currentUser.email);
                if (vendor) {
                    localStorage.setItem('currentVendorId', vendor.id);
                    localStorage.setItem('currentVendorName', vendor.vendorName);
                    console.log('Vendor session restored:', vendor.id);
                } else {
                    console.error('Vendor record not found');
                    alert('Vendor account not properly configured. Please contact admin.');
                    logout();
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Display vendor name in sidebar
function displayVendorName() {
    const vendorNameEl = document.getElementById('vendor-name-display');
    if (vendorNameEl) {
        const vendorName = localStorage.getItem('currentVendorName') || 'Vendor';
        vendorNameEl.textContent = vendorName;
    }
}
