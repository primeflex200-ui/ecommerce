// ====================================================
// DATA MANAGER - CB ORGANIC STORE
// ====================================================
// Manages localStorage data and empty states
// ====================================================

// ====================================================
// INITIALIZATION
// ====================================================
function initializeDataStore() {
    // Initialize empty data structures if not exists
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify([]));
    }
    if (!localStorage.getItem('vendors')) {
        localStorage.setItem('vendors', JSON.stringify([]));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('donations')) {
        localStorage.setItem('donations', JSON.stringify([]));
    }
}

// Initialize on load
initializeDataStore();

// ====================================================
// PRODUCT MANAGEMENT
// ====================================================

function getAllProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

function getProductById(id) {
    const products = getAllProducts();
    return products.find(p => p.id === id);
}

function getProductsByCategory(category) {
    const products = getAllProducts();
    return products.filter(p => p.category === category && p.isActive !== false);
}

function getProductsByVendor(vendorId) {
    const products = getAllProducts();
    return products.filter(p => p.vendorId === vendorId);
}

function addProduct(product) {
    const products = getAllProducts();
    const newProduct = {
        id: 'PROD' + Date.now(),
        ...product,
        isActive: true,
        createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    return newProduct;
}

function updateProduct(id, updates) {
    const products = getAllProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('products', JSON.stringify(products));
        return products[index];
    }
    return null;
}

function deleteProduct(id) {
    const products = getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(filtered));
    return true;
}

// ====================================================
// CATEGORY MANAGEMENT
// ====================================================

function getAllCategories() {
    return JSON.parse(localStorage.getItem('categories')) || [];
}

function getCategoryByName(name) {
    const categories = getAllCategories();
    return categories.find(c => c.name === name);
}

function addCategory(category) {
    const categories = getAllCategories();
    const newCategory = {
        id: 'CAT' + Date.now(),
        ...category,
        createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));
    return newCategory;
}

function deleteCategory(id) {
    const categories = getAllCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem('categories', JSON.stringify(filtered));
    return true;
}

// ====================================================
// ORDER MANAGEMENT
// ====================================================

function getAllOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

function getOrderById(id) {
    const orders = getAllOrders();
    return orders.find(o => o.id === id);
}

function getOrdersByCustomer(customerId) {
    const orders = getAllOrders();
    return orders.filter(o => o.customerId === customerId);
}

function getOrdersByVendor(vendorId) {
    const orders = getAllOrders();
    return orders.filter(o => {
        return o.items && o.items.some(item => item.vendorId === vendorId);
    });
}

function addOrder(order) {
    const orders = getAllOrders();
    const newOrder = {
        id: 'CB' + Date.now(),
        orderNumber: 'ORD' + Date.now(),
        ...order,
        createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Update product stock
    if (order.items) {
        order.items.forEach(item => {
            updateProductStock(item.productId, -item.quantity);
        });
    }
    
    return newOrder;
}

function updateOrder(id, updates) {
    const orders = getAllOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('orders', JSON.stringify(orders));
        return orders[index];
    }
    return null;
}

function updateOrderStatus(id, status) {
    return updateOrder(id, { status });
}

// ====================================================
// CART MANAGEMENT
// ====================================================

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
}

function updateCartItem(productId, quantity) {
    const cart = getCart();
    const index = cart.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = quantity;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    return cart;
}

function removeFromCart(productId) {
    const cart = getCart();
    const filtered = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(filtered));
    return filtered;
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    return [];
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ====================================================
// VENDOR MANAGEMENT
// ====================================================

function getAllVendors() {
    return JSON.parse(localStorage.getItem('vendors')) || [];
}

function getVendorById(id) {
    const vendors = getAllVendors();
    return vendors.find(v => v.id === id);
}

function addVendor(vendor) {
    const vendors = getAllVendors();
    const newVendor = {
        id: 'VEN' + Date.now(),
        ...vendor,
        isApproved: false,
        createdAt: new Date().toISOString()
    };
    vendors.push(newVendor);
    localStorage.setItem('vendors', JSON.stringify(vendors));
    return newVendor;
}

function updateVendor(id, updates) {
    const vendors = getAllVendors();
    const index = vendors.findIndex(v => v.id === id);
    if (index !== -1) {
        vendors[index] = { ...vendors[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('vendors', JSON.stringify(vendors));
        return vendors[index];
    }
    return null;
}

// ====================================================
// USER MANAGEMENT
// ====================================================

function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function getUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email === email);
}

function addUser(user) {
    const users = getAllUsers();
    const newUser = {
        id: 'USER' + Date.now(),
        ...user,
        role: user.role || 'customer',
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
}

// ====================================================
// DONATION MANAGEMENT
// ====================================================

function getAllDonations() {
    return JSON.parse(localStorage.getItem('donations')) || [];
}

function addDonation(donation) {
    const donations = getAllDonations();
    const newDonation = {
        id: 'DON' + Date.now(),
        ...donation,
        status: 'completed',
        createdAt: new Date().toISOString()
    };
    donations.push(newDonation);
    localStorage.setItem('donations', JSON.stringify(donations));
    return newDonation;
}

// ====================================================
// STOCK MANAGEMENT
// ====================================================

function updateProductStock(productId, change) {
    const product = getProductById(productId);
    if (product) {
        const newStock = (product.stock || 0) + change;
        updateProduct(productId, { stock: Math.max(0, newStock) });
        
        // Log inventory change
        logInventoryChange(productId, change, product.stock, newStock);
    }
}

function logInventoryChange(productId, change, oldStock, newStock) {
    const logs = JSON.parse(localStorage.getItem('inventoryLogs')) || [];
    logs.push({
        id: 'LOG' + Date.now(),
        productId,
        change,
        oldStock,
        newStock,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('inventoryLogs', JSON.stringify(logs));
}

// ====================================================
// EMPTY STATE HELPERS
// ====================================================

function hasProducts() {
    return getAllProducts().length > 0;
}

function hasOrders() {
    return getAllOrders().length > 0;
}

function hasCategories() {
    return getAllCategories().length > 0;
}

function isCartEmpty() {
    return getCart().length === 0;
}

// ====================================================
// RENDER EMPTY STATES
// ====================================================

function renderEmptyState(container, message, icon = '📦') {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-message">${message}</div>
            </div>
        `;
    }
}

// ====================================================
// DATA SYNC (Future: Connect to Supabase)
// ====================================================

// Placeholder for future Supabase sync
async function syncWithSupabase() {
    // TODO: Implement Supabase sync
    console.log('Supabase sync not implemented yet');
}

// ====================================================
// EXPORT FOR GLOBAL USE
// ====================================================

window.DataManager = {
    // Products
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getProductsByVendor,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Categories
    getAllCategories,
    getCategoryByName,
    addCategory,
    deleteCategory,
    
    // Orders
    getAllOrders,
    getOrderById,
    getOrdersByCustomer,
    getOrdersByVendor,
    addOrder,
    updateOrder,
    updateOrderStatus,
    
    // Cart
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    
    // Vendors
    getAllVendors,
    getVendorById,
    addVendor,
    updateVendor,
    
    // Users
    getAllUsers,
    getUserByEmail,
    addUser,
    
    // Donations
    getAllDonations,
    addDonation,
    
    // Stock
    updateProductStock,
    
    // Empty States
    hasProducts,
    hasOrders,
    hasCategories,
    isCartEmpty,
    renderEmptyState,
    
    // Sync
    syncWithSupabase
};
