

(function() {
    const RESET_FLAG = 'products_reset_v2';
    if (!localStorage.getItem(RESET_FLAG)) {
        console.log('Resetting products - removing milk and curd...');
        localStorage.removeItem('products');
        const correctProducts = [
            { id: 1, name: "Premium A2 Ghee", category: "Bakery & Dairy", subcategory: "Ghee", price: 899, stock: 50, image: "images/ghee.png", description: "Pure A2 cow ghee", inStock: true },
            { id: 3, name: "Gomutra Ark", category: "Conscious Living", subcategory: "Herbal Products", price: 299, stock: 30, image: "images/gomutra.png", description: "Traditional wellness", inStock: true },
            { id: 4, name: "Organic Dung Cakes", category: "Home Food", subcategory: "Traditional Foods", price: 199, stock: 0, image: "images/cow-dung.png", description: "Eco-friendly", inStock: false },
            { id: 5, name: "Panchagavya Mix", category: "Special Categories", subcategory: "Combo Packs", price: 499, stock: 25, image: "images/panchagavya.png", description: "Complete wellness", inStock: true },
            { id: 7, name: "Fresh Buttermilk", category: "Snacks & More", subcategory: "Traditional Snacks", price: 45, stock: 60, image: "images/buttermilk.png", description: "Refreshing", inStock: true },
            { id: 8, name: "Fresh Paneer", category: "Bakery & Dairy", subcategory: "Paneer", price: 350, stock: 40, image: "images/paneer.png", description: "Fresh paneer", inStock: true },
            { id: 9, name: "Pure Gomutra", category: "Conscious Living", subcategory: "Herbal Products", price: 150, stock: 20, image: "images/gomutra.png", description: "Pure wellness", inStock: true }
        ];
        localStorage.setItem('products', JSON.stringify(correctProducts));
        localStorage.setItem(RESET_FLAG, 'true');
        console.log('Products reset complete. Milk and Curd removed.');
    }
})();


let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productImages = {
    1: 'images/ghee.png',
    3: 'images/gomutra.png',
    4: 'images/cow-dung.png',
    5: 'images/panchagavya.png',
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
    if (typeof handleSignOut === 'function') {
        handleSignOut();
    } else {
        console.error('handleSignOut not found - check supabase-auth.js is loaded');
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    const dropdown = document.getElementById('profile-dropdown');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (event.target === modal) {
        closeAuthModal();
    }
    if (dropdown && !event.target.closest('#profile-btn') && !event.target.closest('.profile-dropdown')) {
        dropdown.classList.remove('active');
    }
    if (hamburgerDropdown && hamburgerBtn && !event.target.closest('#hamburger-btn') && !event.target.closest('.hamburger-dropdown')) {
        hamburgerDropdown.classList.remove('active');
        hamburgerBtn.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateProfileButton();
});

async function displayOrders() {
    const ordersListContainer = document.getElementById('orders-list');
    if (!ordersListContainer) return;
    ordersListContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <p>Loading your orders...</p>
        </div>
    `;
    try {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            ordersListContainer.innerHTML = `
                <div class="empty-orders">
                    <h2>Please Login</h2>
                    <p>You need to login to view your orders.</p>
                    <a href="index.html" class="btn btn-primary">Go to Home</a>
                </div>
            `;
            return;
        }
        const { data: orders, error } = await window.supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('customer_email', user.email)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching orders:', error);
            ordersListContainer.innerHTML = `
                <div class="empty-orders">
                    <h2>Error Loading Orders</h2>
                    <p>Unable to load your orders. Please try again later.</p>
                </div>
            `;
            return;
        }
        if (!orders || orders.length === 0) {
            ordersListContainer.innerHTML = `
                <div class="empty-orders">
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders. Start shopping to see your orders here!</p>
                    <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }
        ordersListContainer.innerHTML = orders.map(order => {
            const orderDate = new Date(order.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const orderItems = order.order_items || [];
            const orderItemsHTML = orderItems.map(item => {
                const itemTotal = item.price * item.quantity;
                return `
                    <div class="order-item">
                        <img src="images/ghee.png" alt="${item.product_name}">
                        <div class="order-item-details">
                            <h4>${item.product_name}</h4>
                            <p class="order-item-quantity">Quantity: ${item.quantity}</p>
                        </div>
                        <div class="order-item-price">₹${itemTotal.toFixed(2)}</div>
                    </div>
                `;
            }).join('');
            const statusClass = order.status.toLowerCase();
            return `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Order ${order.id}</div>
                            <div class="order-date">${orderDate}</div>
                        </div>
                        <div class="order-status ${statusClass}">${order.status}</div>
                    </div>
                    <div class="order-items">
                        ${orderItemsHTML}
                    </div>
                    <div class="order-total">
                        <span class="order-total-label">Total:</span>
                        <span class="order-total-amount">₹${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error displaying orders:', error);
        ordersListContainer.innerHTML = `
            <div class="empty-orders">
                <h2>Error Loading Orders</h2>
                <p>Unable to load your orders. Please try again later.</p>
            </div>
        `;
    }
}

if (window.location.pathname.includes('orders.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        displayOrders();
    });
}

function getShopProducts() {
    const adminProducts = localStorage.getItem('products');
    if (adminProducts) {
        return JSON.parse(adminProducts);
    }
    const defaultProducts = [
        { id: 1, name: "Premium A2 Ghee", category: "Bakery & Dairy", subcategory: "Ghee", price: 899, image: "images/ghee.png", description: "Pure A2 cow ghee made using traditional bilona method", inStock: true },
        { id: 3, name: "Gomutra Ark", category: "Conscious Living", subcategory: "Herbal Products", price: 299, image: "images/gomutra.png", description: "Traditional wellness product from cow urine", inStock: true },
        { id: 4, name: "Organic Dung Cakes", category: "Home Food", subcategory: "Traditional Foods", price: 199, image: "images/cow-dung.png", description: "Eco-friendly organic dung cakes for traditional use", inStock: true },
        { id: 5, name: "Panchagavya Mix", category: "Special Categories", subcategory: "Combo Packs", price: 499, image: "images/panchagavya.png", description: "Complete wellness solution with five cow products", inStock: true },
        { id: 7, name: "Fresh Buttermilk", category: "Snacks & More", subcategory: "Traditional Snacks", price: 45, image: "images/buttermilk.png", description: "Refreshing traditional buttermilk", inStock: true },
        { id: 8, name: "Fresh Paneer", category: "Bakery & Dairy", subcategory: "Paneer", price: 350, image: "images/paneer.png", description: "Fresh cottage cheese made from organic milk", inStock: true },
        { id: 9, name: "Pure Gomutra", category: "Conscious Living", subcategory: "Herbal Products", price: 150, image: "images/gomutra.png", description: "Pure cow urine for traditional wellness", inStock: true }
    ];
    return defaultProducts;
}
const shopProducts = getShopProducts();

let currentFilter = { category: null, subcategory: null };

function filterProductsBySubcategory(category, subcategory) {
    currentFilter = { category, subcategory };
    const filteredProducts = shopProducts.filter(product => {
        return product.category === category && product.subcategory === subcategory;
    });
    renderShopProducts(filteredProducts);
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader) {
        pageHeader.textContent = subcategory;
    }
    const pageSubtext = document.querySelector('.page-header p');
    if (pageSubtext) {
        pageSubtext.textContent = `Showing ${filteredProducts.length} products in ${subcategory}`;
    }
}

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
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    productGrid.innerHTML = products.map(product => {
        let vendorInfo = { vendorName: 'CB Organic', businessName: 'CB Organic Farm' };
        if (product.vendor_id) {
            const vendor = vendors.find(v => v.id === product.vendor_id);
            if (vendor) {
                vendorInfo = {
                    vendorName: vendor.vendorName,
                    businessName: vendor.businessName
                };
            }
        }
        const stockStatus = product.inStock && product.stock > 0 ? 'In Stock' : 'Out of Stock';
        const stockClass = product.inStock && product.stock > 0 ? 'in-stock' : 'out-of-stock';
        const isAvailable = product.inStock && product.stock > 0;
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="vendor-info" style="font-size: 0.85rem; color: #666; margin: 0.5rem 0; padding: 0.5rem; background: #f9f9f9; border-radius: 5px;">
                    <div style="margin-bottom: 0.3rem;"><strong>Vendor:</strong> ${vendorInfo.vendorName}</div>
                    <div><strong>Business:</strong> ${vendorInfo.businessName}</div>
                </div>
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>
                <div class="stock-status" style="margin: 0.5rem 0;">
                    <span class="status-badge ${stockClass}" style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">
                        ${stockStatus}
                    </span>
                </div>
                ${isAvailable ? 
                    `<div class="quantity-selector" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 1rem 0;">
                        <button onclick="decreaseQuantity(${product.id})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">-</button>
                        <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" style="width: 60px; height: 35px; text-align: center; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;" readonly>
                        <button onclick="increaseQuantity(${product.id}, ${product.stock})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">+</button>
                    </div>
                    <button onclick="addToCartWithQuantity(${product.id})" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 0.5rem 0;">Add to Cart</button>` :
                    `<button class="btn btn-secondary" style="display: block; width: 100%; text-align: center; margin: 1rem 0; opacity: 0.5; cursor: not-allowed;" disabled>Out of Stock</button>`
                }
            </div>
        `;
    }).join('');
}

function increaseQuantity(productId, maxStock) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    if (qtyInput) {
        let currentQty = parseInt(qtyInput.value);
        if (currentQty < maxStock) {
            qtyInput.value = currentQty + 1;
        }
    }
}
function decreaseQuantity(productId) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    if (qtyInput) {
        let currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    }
}
function addToCartWithQuantity(productId) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found!');
        return;
    }
    if (!product.inStock || product.stock <= 0) {
        alert('This product is out of stock!');
        return;
    }
    if (quantity > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
        return;
    }
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            vendor_id: product.vendor_id
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    alert(`${quantity} x ${product.name} added to cart!`);
    if (qtyInput) {
        qtyInput.value = 1;
    }
}

if (window.location.pathname.includes('shop.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        renderShopProducts(shopProducts);
        const subcategoryItems = document.querySelectorAll('.subcategory-item');
        subcategoryItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.dataset.category;
                const subcategory = this.dataset.subcategory;
                filterProductsBySubcategory(category, subcategory);
            });
        });
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showAllProducts();
            });
        });
    });
}

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

window.addEventListener('click', function(event) {
    const adminModal = document.getElementById('admin-modal');
    if (event.target === adminModal) {
        closeAdminModal();
    }
});

function handleSearch() {
    const searchInput = document.querySelector('.main-search-bar');
    const searchBtn = document.querySelector('.search-btn');
    if (!searchInput || !searchBtn) return;
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}
function performSearch() {
    const searchInput = document.querySelector('.main-search-bar');
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    const products = getShopProducts();
    const matchedProducts = products.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.category.toLowerCase().includes(searchTerm) ||
               product.subcategory.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm);
    });
    if (matchedProducts.length === 0) {
        alert(`No products found for "${searchTerm}"`);
        return;
    }
    sessionStorage.setItem('searchResults', JSON.stringify(matchedProducts));
    sessionStorage.setItem('searchTerm', searchTerm);
    window.location.href = 'shop.html';
}

function displaySearchResults() {
    const searchResults = sessionStorage.getItem('searchResults');
    const searchTerm = sessionStorage.getItem('searchTerm');
    if (searchResults && searchTerm) {
        const products = JSON.parse(searchResults);
        renderShopProducts(products);
        const pageHeader = document.querySelector('.page-header h1');
        if (pageHeader) {
            pageHeader.textContent = `Search Results for "${searchTerm}"`;
        }
        const pageSubtext = document.querySelector('.page-header p');
        if (pageSubtext) {
            pageSubtext.textContent = `Found ${products.length} product(s) matching your search`;
        }
        sessionStorage.removeItem('searchResults');
        sessionStorage.removeItem('searchTerm');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    handleSearch();
    if (window.location.pathname.includes('shop.html')) {
        displaySearchResults();
    }
});


const ADMIN_EMAIL = 'ruthvik@blockfortrust.com';
const ADMIN_PASSWORD = 'Saireddy880227';



function checkUserRole() {
    const email = document.getElementById('signin-email')?.value.trim();
    const password = document.getElementById('signin-password')?.value.trim();
    if (!email || !password) {
        hideRoleButtons();
        return;
    }
    if (email === ADMIN_EMAIL) {
        hideRoleButtons();
    } else {
        hideRoleButtons();
    }
}

function showRoleButtons(role) {
    const roleButtonsDiv = document.getElementById('role-buttons');
    const adminBtn = document.getElementById('admin-enter-btn');
    const defaultBtn = document.getElementById('default-signin-btn');
    if (!roleButtonsDiv || !adminBtn || !defaultBtn) return;
    defaultBtn.style.display = 'none';
    roleButtonsDiv.style.display = 'block';
    if (role === 'admin') {
        adminBtn.style.display = 'block';
    } else {
        hideRoleButtons();
    }
}

function hideRoleButtons() {
    const roleButtonsDiv = document.getElementById('role-buttons');
    const adminBtn = document.getElementById('admin-enter-btn');
    const defaultBtn = document.getElementById('default-signin-btn');
    if (!roleButtonsDiv || !adminBtn || !defaultBtn) return;
    roleButtonsDiv.style.display = 'none';
    adminBtn.style.display = 'none';
    defaultBtn.style.display = 'block';
}

function enterAsAdmin() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value.trim();
    const messageEl = document.getElementById('signin-message');
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('currentUser', email);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        messageEl.textContent = 'Logging in as Admin...';
        messageEl.className = 'auth-message success';
        messageEl.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
        return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password && u.role === 'admin');
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        messageEl.textContent = 'Logging in as Admin...';
        messageEl.className = 'auth-message success';
        messageEl.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        messageEl.textContent = 'Invalid admin credentials';
        messageEl.className = 'auth-message error';
        messageEl.style.display = 'block';
    }
}






