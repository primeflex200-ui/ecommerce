// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Product image mapping
const productImages = {
    1: 'images/ghee.png',
    2: 'images/milk.png',
    3: 'images/gomutra.png',
    4: 'images/cow-dung.png',
    5: 'images/panchagavya.png',
    6: 'images/curd.png',
    7: 'images/buttermilk.png',
    8: 'images/paneer.png',
    9: 'images/gomutra.png'
};

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1,
            image: productImages[id] || 'images/placeholder.png'
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    alert(`${name} added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        }
    }
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
                <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        if (cartTotalElement) cartTotalElement.textContent = '₹0';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        // Get image from item or use product mapping
        const itemImage = item.image || productImages[item.id] || 'images/ghee.png';
        return `
            <div class="cart-item">
                <img src="${itemImage}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">₹${item.price}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }).join('');
    
    if (cartTotalElement) {
        cartTotalElement.textContent = `₹${total}`;
    }
    
    // Update cart items with images if they don't have them
    let updated = false;
    cart.forEach(item => {
        if (!item.image && productImages[item.id]) {
            item.image = productImages[item.id];
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

function displayCheckoutSummary() {
    const summaryContainer = document.getElementById('checkout-summary');
    if (!summaryContainer) return;
    
    let total = 0;
    const itemsHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="summary-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    }).join('');
    
    summaryContainer.innerHTML = `
        ${itemsHTML}
        <div class="summary-total">
            <span>Total</span>
            <span>₹${total}</span>
        </div>
    `;
}

function placeOrder(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    if (!name || !phone || !address) {
        alert('Please fill in all fields');
        return;
    }
    
    alert(`Order placed successfully!\n\nThank you ${name}!\nWe will contact you at ${phone} for delivery confirmation.`);
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    if (document.getElementById('cart-items')) {
        displayCart();
    }
    
    if (document.getElementById('checkout-summary')) {
        displayCheckoutSummary();
    }
    
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', placeOrder);
    }
});


// Authentication Functions
function openAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function toggleHamburgerMenu(event) {
    if (event) event.preventDefault();
    const dropdown = document.getElementById('hamburger-dropdown');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    
    dropdown.classList.toggle('active');
    hamburgerBtn.classList.toggle('active');
}

function switchTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form-container');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'signin') {
        tabs[0].classList.add('active');
        document.getElementById('signin-form').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('signup-form').classList.add('active');
    }
}

function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const mobile = document.getElementById('signup-mobile').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const messageEl = document.getElementById('signup-message');
    
    // Validate
    if (!name || !email || !mobile || !password || !confirm) {
        messageEl.textContent = 'All fields are required';
        messageEl.className = 'auth-message error';
        return;
    }
    
    if (password !== confirm) {
        messageEl.textContent = 'Passwords do not match';
        messageEl.className = 'auth-message error';
        return;
    }
    
    if (password.length < 6) {
        messageEl.textContent = 'Password must be at least 6 characters';
        messageEl.className = 'auth-message error';
        return;
    }
    
    // Store user data
    const userData = {
        name: name,
        email: email,
        mobile: mobile,
        password: password
    };
    
    localStorage.setItem('cb_user', JSON.stringify(userData));
    
    // Show success message
    messageEl.textContent = 'Account created successfully!';
    messageEl.className = 'auth-message success';
    
    // Clear form
    event.target.reset();
    
    // Switch to sign in after 1.5 seconds
    setTimeout(() => {
        switchTab('signin');
        messageEl.className = 'auth-message';
    }, 1500);
}

function handleSignIn(event) {
    event.preventDefault();
    
    const emailOrMobile = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const messageEl = document.getElementById('signin-message');
    
    // Get stored user data
    const storedUser = localStorage.getItem('cb_user');
    
    if (!storedUser) {
        messageEl.textContent = 'No account found. Please sign up first.';
        messageEl.className = 'auth-message error';
        return;
    }
    
    const userData = JSON.parse(storedUser);
    
    // Check credentials
    const isEmailMatch = userData.email === emailOrMobile;
    const isMobileMatch = userData.mobile === emailOrMobile;
    const isPasswordMatch = userData.password === password;
    
    if ((isEmailMatch || isMobileMatch) && isPasswordMatch) {
        // Login success
        sessionStorage.setItem('cb_logged_in', JSON.stringify({
            name: userData.name,
            email: userData.email
        }));
        
        messageEl.textContent = 'Login successful!';
        messageEl.className = 'auth-message success';
        
        // Update UI
        setTimeout(() => {
            closeAuthModal();
            updateProfileButton();
            messageEl.className = 'auth-message';
            event.target.reset();
        }, 1000);
    } else {
        messageEl.textContent = 'Invalid credentials';
        messageEl.className = 'auth-message error';
    }
}

function updateProfileButton() {
    const loggedInUser = sessionStorage.getItem('cb_logged_in');
    const profileBtn = document.getElementById('profile-btn');
    
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        const firstName = user.name.split(' ')[0];
        profileBtn.innerHTML = `
            <span class="nav-label">${firstName}</span>
        `;
        profileBtn.onclick = toggleProfileDropdown;
    } else {
        profileBtn.innerHTML = `
            <span class="nav-label">Login</span>
        `;
        profileBtn.onclick = openAuthModal;
    }
}

function toggleProfileDropdown(event) {
    event.preventDefault();
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('active');
}

function showOrders() {
    window.location.href = 'orders.html';
}

function showProfile() {
    alert('Profile page - Coming soon!');
    document.getElementById('profile-dropdown').classList.remove('active');
}

function logout() {
    sessionStorage.removeItem('cb_logged_in');
    updateProfileButton();
    document.getElementById('profile-dropdown').classList.remove('active');
    alert('Logged out successfully');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    const dropdown = document.getElementById('profile-dropdown');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    
    if (event.target === modal) {
        closeAuthModal();
    }
    
    // Close profile dropdown when clicking outside
    if (dropdown && !event.target.closest('#profile-btn') && !event.target.closest('.profile-dropdown')) {
        dropdown.classList.remove('active');
    }
    
    // Close hamburger dropdown when clicking outside (only if it exists)
    if (hamburgerDropdown && hamburgerBtn && !event.target.closest('#hamburger-btn') && !event.target.closest('.hamburger-dropdown')) {
        hamburgerDropdown.classList.remove('active');
        hamburgerBtn.classList.remove('active');
    }
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', function() {
    updateProfileButton();
});


// Display Orders
function displayOrders() {
    const ordersListContainer = document.getElementById('orders-list');
    
    if (!ordersListContainer) return;
    
    // Get cart items as temporary orders
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        ordersListContainer.innerHTML = `
            <div class="empty-orders">
                <h2>No Orders Yet</h2>
                <p>You haven't placed any orders. Start shopping to see your orders here!</p>
                <a href="shop.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    // Create a temporary order from cart items
    const orderDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    let orderTotal = 0;
    const orderItemsHTML = cart.map(item => {
        const itemImage = item.image || productImages[item.id] || 'images/ghee.png';
        const itemTotal = item.price * item.quantity;
        orderTotal += itemTotal;
        
        return `
            <div class="order-item">
                <img src="${itemImage}" alt="${item.name}">
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p class="order-item-quantity">Quantity: ${item.quantity}</p>
                </div>
                <div class="order-item-price">₹${itemTotal}</div>
            </div>
        `;
    }).join('');
    
    ordersListContainer.innerHTML = `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #CB${Date.now().toString().slice(-6)}</div>
                    <div class="order-date">${orderDate}</div>
                </div>
                <div class="order-status pending">Pending</div>
            </div>
            <div class="order-items">
                ${orderItemsHTML}
            </div>
            <div class="order-total">
                <span class="order-total-label">Total:</span>
                <span class="order-total-amount">₹${orderTotal}</span>
            </div>
        </div>
    `;
}

// Initialize orders page
if (window.location.pathname.includes('orders.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        displayOrders();
    });
}


// Shop Products Database
function getShopProducts() {
    // Try to get products from localStorage first (admin managed)
    const adminProducts = localStorage.getItem('products');
    
    if (adminProducts) {
        return JSON.parse(adminProducts);
    }
    
    // Fallback to default products if no admin products exist
    const defaultProducts = [
        { id: 1, name: "Premium A2 Ghee", category: "Bakery & Dairy", subcategory: "Ghee", price: 899, image: "images/ghee.png", description: "Pure A2 cow ghee made using traditional bilona method", inStock: true },
        { id: 2, name: "Fresh Cow Milk", category: "Bakery & Dairy", subcategory: "Milk", price: 65, image: "images/milk.png", description: "Fresh organic cow milk delivered daily", inStock: true },
        { id: 3, name: "Gomutra Ark", category: "Conscious Living", subcategory: "Herbal Products", price: 299, image: "images/gomutra.png", description: "Traditional wellness product from cow urine", inStock: true },
        { id: 4, name: "Organic Dung Cakes", category: "Home Food", subcategory: "Traditional Foods", price: 199, image: "images/cow-dung.png", description: "Eco-friendly organic dung cakes for traditional use", inStock: true },
        { id: 5, name: "Panchagavya Mix", category: "Special Categories", subcategory: "Combo Packs", price: 499, image: "images/panchagavya.png", description: "Complete wellness solution with five cow products", inStock: true },
        { id: 6, name: "Fresh Curd", category: "Bakery & Dairy", subcategory: "Milk", price: 75, image: "images/curd.png", description: "Fresh homemade curd from organic milk", inStock: true },
        { id: 7, name: "Fresh Buttermilk", category: "Snacks & More", subcategory: "Traditional Snacks", price: 45, image: "images/buttermilk.png", description: "Refreshing traditional buttermilk", inStock: true },
        { id: 8, name: "Fresh Paneer", category: "Bakery & Dairy", subcategory: "Paneer", price: 350, image: "images/paneer.png", description: "Fresh cottage cheese made from organic milk", inStock: true },
        { id: 9, name: "Pure Gomutra", category: "Conscious Living", subcategory: "Herbal Products", price: 150, image: "images/gomutra.png", description: "Pure cow urine for traditional wellness", inStock: true }
    ];
    
    return defaultProducts;
}

const shopProducts = getShopProducts();

// Current filter state
let currentFilter = { category: null, subcategory: null };

// Filter products by subcategory
function filterProductsBySubcategory(category, subcategory) {
    currentFilter = { category, subcategory };
    
    const filteredProducts = shopProducts.filter(product => {
        return product.category === category && product.subcategory === subcategory;
    });
    
    renderShopProducts(filteredProducts);
    
    // Update page header to show filter
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader) {
        pageHeader.textContent = subcategory;
    }
    
    const pageSubtext = document.querySelector('.page-header p');
    if (pageSubtext) {
        pageSubtext.textContent = `Showing ${filteredProducts.length} products in ${subcategory}`;
    }
}

// Show all products
function showAllProducts() {
    currentFilter = { category: null, subcategory: null };
    renderShopProducts(shopProducts);
    
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader) {
        pageHeader.textContent = 'Our Products';
    }
    
    const pageSubtext = document.querySelector('.page-header p');
    if (pageSubtext) {
        pageSubtext.textContent = 'Explore our range of pure organic cow products';
    }
}

// Render products to the shop page
function renderShopProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    
    if (!productGrid) return;
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                <h2 style="color: #666; margin-bottom: 1rem;">No products found</h2>
                <p style="color: #999; margin-bottom: 2rem;">Try selecting a different category</p>
                <button onclick="showAllProducts()" class="btn btn-primary">Show All Products</button>
            </div>
        `;
        return;
    }
    
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">₹${product.price}</p>
            <a href="product.html?id=${product.id}" class="btn btn-secondary" style="display: block; text-align: center; margin: 1rem;">View Details</a>
        </div>
    `).join('');
}

// Initialize shop page
if (window.location.pathname.includes('shop.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Show all products by default
        renderShopProducts(shopProducts);
        
        // Add click event listeners to subcategory items
        const subcategoryItems = document.querySelectorAll('.subcategory-item');
        subcategoryItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.dataset.category;
                const subcategory = this.dataset.subcategory;
                filterProductsBySubcategory(category, subcategory);
            });
        });
        
        // Add click event to main category links to show all in that category
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showAllProducts();
            });
        });
    });
}


// Admin Login Modal Functions
function openAdminLogin(event) {
    if (event) event.preventDefault();
    document.getElementById('admin-modal').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
}

function handleAdminLoginModal(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-modal-email').value;
    const password = document.getElementById('admin-modal-password').value;
    const messageEl = document.getElementById('admin-modal-message');
    
    if (email === 'admin@cb.com' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        messageEl.textContent = 'Login successful! Redirecting to admin dashboard...';
        messageEl.className = 'auth-message success';
        
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        messageEl.textContent = 'Invalid admin credentials';
        messageEl.className = 'auth-message error';
    }
}

// Close admin modal when clicking outside
window.addEventListener('click', function(event) {
    const adminModal = document.getElementById('admin-modal');
    if (event.target === adminModal) {
        closeAdminModal();
    }
});
