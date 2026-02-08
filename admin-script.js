// Check admin authentication
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && !currentPage.includes('admin.html')) {
        window.location.href = 'admin.html';
    }
}

// Initialize admin data
function initializeAdminData() {
    // Initialize products if not exists
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            { id: 1, name: "Premium A2 Ghee", category: "Bakery & Dairy", subcategory: "Ghee", price: 899, stock: 50, image: "images/ghee.png", description: "Pure A2 cow ghee", inStock: true },
            { id: 3, name: "Gomutra Ark", category: "Conscious Living", subcategory: "Herbal Products", price: 299, stock: 30, image: "images/gomutra.png", description: "Traditional wellness", inStock: true },
            { id: 4, name: "Organic Dung Cakes", category: "Home Food", subcategory: "Traditional Foods", price: 199, stock: 0, image: "images/cow-dung.png", description: "Eco-friendly", inStock: false },
            { id: 5, name: "Panchagavya Mix", category: "Special Categories", subcategory: "Combo Packs", price: 499, stock: 25, image: "images/panchagavya.png", description: "Complete wellness", inStock: true },
            { id: 7, name: "Fresh Buttermilk", category: "Snacks & More", subcategory: "Traditional Snacks", price: 45, stock: 60, image: "images/buttermilk.png", description: "Refreshing", inStock: true },
            { id: 8, name: "Fresh Paneer", category: "Bakery & Dairy", subcategory: "Paneer", price: 350, stock: 40, image: "images/paneer.png", description: "Fresh paneer", inStock: true },
            { id: 9, name: "Pure Gomutra", category: "Conscious Living", subcategory: "Herbal Products", price: 150, stock: 20, image: "images/gomutra.png", description: "Pure wellness", inStock: true }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
    
    // Initialize orders if not exists
    if (!localStorage.getItem('orders')) {
        const defaultOrders = [
            { 
                id: "CB" + Date.now().toString().slice(-6), 
                customerName: "Rahul Sharma", 
                items: [{ name: "Premium A2 Ghee", quantity: 2, price: 899 }], 
                total: 1798, 
                date: new Date().toLocaleDateString(), 
                status: "Pending" 
            },
            { 
                id: "CB" + (Date.now() - 100000).toString().slice(-6), 
                customerName: "Priya Patel", 
                items: [{ name: "Premium A2 Ghee", quantity: 2, price: 899 }], 
                total: 1798, 
                date: new Date().toLocaleDateString(), 
                status: "Shipped" 
            }
        ];
        localStorage.setItem('orders', JSON.stringify(defaultOrders));
    }
}

// Admin Login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const messageEl = document.getElementById('login-message');
    
    if (email === 'admin@cb.com' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        messageEl.textContent = 'Login successful! Redirecting...';
        messageEl.className = 'login-message success';
        
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        messageEl.textContent = 'Invalid credentials';
        messageEl.className = 'login-message error';
    }
}

// Admin Logout
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin.html';
}

// Load Dashboard Data
function loadDashboard() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const outOfStock = products.filter(p => !p.inStock || p.stock === 0).length;
    
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('out-of-stock').textContent = outOfStock;
    
    // Load recent orders
    const recentOrdersList = document.getElementById('recent-orders-list');
    if (recentOrdersList) {
        const recentOrders = orders.slice(0, 5);
        recentOrdersList.innerHTML = recentOrders.map(order => `
            <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                <strong>${order.id}</strong> - ${order.customerName} - ₹${order.total} - ${order.status}
            </div>
        `).join('') || '<p>No orders yet</p>';
    }
}

// Load Products Table
function loadProductsTable() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('products-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}" class="product-image-small"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">${product.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                <button class="action-btn btn-toggle" onclick="toggleStock(${product.id})">${product.inStock ? 'Mark Out' : 'Mark In'}</button>
            </td>
        </tr>
    `).join('');
}

// Delete Product
function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    loadProductsTable();
}

// Toggle Stock Status
function toggleStock(id) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    if (product) {
        product.inStock = !product.inStock;
        localStorage.setItem('products', JSON.stringify(products));
        loadProductsTable();
    }
}

// Edit Product - Open Side Panel
function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    
    if (product) {
        // Populate form fields
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-name').value = product.name;
        document.getElementById('edit-category').value = product.category;
        document.getElementById('edit-subcategory').value = product.subcategory;
        document.getElementById('edit-price').value = product.price;
        document.getElementById('edit-stock').value = product.stock;
        document.getElementById('edit-description').value = product.description;
        
        // Show current image
        const currentImageDiv = document.getElementById('edit-current-image');
        currentImageDiv.innerHTML = `<img src="${product.image}" alt="${product.name}" style="max-width: 150px; border-radius: 8px;">`;
        
        // Open panel
        document.getElementById('edit-panel').classList.add('active');
    }
}

// Close Edit Panel
function closeEditPanel() {
    document.getElementById('edit-panel').classList.remove('active');
    document.getElementById('edit-product-form').reset();
}

// Save Product Edit
function saveProductEdit(event) {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('edit-product-id').value);
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex !== -1) {
        // Get form values
        products[productIndex].name = document.getElementById('edit-name').value;
        products[productIndex].category = document.getElementById('edit-category').value;
        products[productIndex].subcategory = document.getElementById('edit-subcategory').value;
        products[productIndex].price = parseInt(document.getElementById('edit-price').value);
        products[productIndex].stock = parseInt(document.getElementById('edit-stock').value);
        products[productIndex].description = document.getElementById('edit-description').value;
        
        // Update stock status
        products[productIndex].inStock = products[productIndex].stock > 0;
        
        // Handle image update if new image is selected
        const imageInput = document.getElementById('edit-image');
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                products[productIndex].image = e.target.result;
                localStorage.setItem('products', JSON.stringify(products));
                closeEditPanel();
                loadProductsTable();
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            // No new image, just save
            localStorage.setItem('products', JSON.stringify(products));
            closeEditPanel();
            loadProductsTable();
        }
    }
}

// Preview Image
let imageBase64 = '';
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageBase64 = e.target.result;
            preview.innerHTML = `<img src="${imageBase64}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Add Product
function handleAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const subcategory = document.getElementById('product-subcategory').value;
    const price = parseInt(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value;
    const messageEl = document.getElementById('form-message');
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    const newProduct = {
        id: newId,
        name,
        category,
        subcategory,
        price,
        stock,
        image: imageBase64 || 'images/placeholder.png',
        description,
        inStock: stock > 0
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    messageEl.textContent = 'Product added successfully!';
    messageEl.className = 'form-message success';
    
    setTimeout(() => {
        window.location.href = 'admin-products.html';
    }, 1500);
}

// Load Orders Table
function loadOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tbody = document.getElementById('orders-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</td>
            <td>₹${order.total}</td>
            <td>${order.date}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus(${index}, this.value)">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Packed" ${order.status === 'Packed' ? 'selected' : ''}>Packed</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6">No orders yet</td></tr>';
}

// Update Order Status
function updateOrderStatus(index, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders[index]) {
        orders[index].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (!currentPage.includes('admin.html')) {
        checkAdminAuth();
    }
    
    initializeAdminData();
    
    if (currentPage.includes('admin-dashboard.html')) {
        loadDashboard();
    } else if (currentPage.includes('admin-products.html')) {
        loadProductsTable();
    } else if (currentPage.includes('admin-orders.html')) {
        loadOrdersTable();
    }
});
