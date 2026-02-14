// ===== UNIFIED AUTHENTICATION SYSTEM =====

// Initialize default users
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            { 
                id: 'admin-001', 
                email: 'ruthvik@blockfortrust.com', 
                password: 'Saireddy880227', 
                role: 'admin',
                firstName: 'Ruthvik',
                lastName: 'Admin'
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

// Call initialization
initializeUsers();

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
    const userRole = localStorage.getItem('userRole');
    const currentPage = window.location.pathname;
    
    // If on login page and already logged in as admin, redirect to dashboard
    if (currentPage.includes('login.html') && isLoggedIn === 'true' && userRole === 'admin') {
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    // If on admin page and not logged in, redirect to login
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
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}
