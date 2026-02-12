// ===== TEMPORARY RESET LOGIC - REMOVE MILK AND CURD PRODUCTS =====
// This will force clear old product data and reinitialize without milk/curd
(function() {
    const RESET_FLAG = 'products_reset_v2';
    
    // Check if reset has already been done
    if (!localStorage.getItem(RESET_FLAG)) {
        console.log('Admin: Resetting products - removing milk and curd...');
        
        // Clear old product data
        localStorage.removeItem('products');
        
        // Mark reset as complete
        localStorage.setItem(RESET_FLAG, 'true');
        
        console.log('Admin: Products reset complete.');
    }
})();
// ===== END RESET LOGIC =====

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

// ===== CATEGORY MANAGEMENT FUNCTIONS =====

// Default categories
const DEFAULT_CATEGORIES = [
    "Fruits & Vegetables",
    "Daily Staples",
    "Snacks & More",
    "Bakery & Dairy",
    "Home Food",
    "Special Categories",
    "Conscious Living"
];

// Toggle category management panel
function toggleCategoryManagement() {
    const panel = document.getElementById('category-management-panel');
    if (!panel) return;
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        // Load categories when panel is opened
        displayCategoriesList();
    } else {
        panel.style.display = 'none';
    }
}

// Initialize categories in localStorage
function initializeCategories() {
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
}

// Get categories from localStorage
function getCategories() {
    const categories = localStorage.getItem('categories');
    return categories ? JSON.parse(categories) : DEFAULT_CATEGORIES;
}

// Load categories into dropdown
function loadCategoriesDropdown() {
    const categorySelect = document.getElementById('product-category');
    if (!categorySelect) return;
    
    const categories = getCategories();
    
    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    // Add categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Display categories list with delete buttons
function displayCategoriesList() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    const categories = getCategories();
    
    categoriesList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.style.cssText = 'display: flex; align-items: center; gap: 8px; background: white; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd;';
        
        const categoryName = document.createElement('span');
        categoryName.textContent = category;
        categoryName.style.cssText = 'flex: 1; color: #333;';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '×';
        deleteBtn.style.cssText = 'background: #d32f2f; color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1;';
        deleteBtn.onclick = () => deleteCategory(category);
        deleteBtn.title = 'Delete category';
        
        categoryItem.appendChild(categoryName);
        categoryItem.appendChild(deleteBtn);
        categoriesList.appendChild(categoryItem);
    });
}

// Add new category
function addCategory() {
    const input = document.getElementById('new-category-input');
    if (!input) return;
    
    const newCategory = input.value.trim();
    
    if (!newCategory) {
        alert('Please enter a category name');
        return;
    }
    
    const categories = getCategories();
    
    // Check if category already exists
    if (categories.includes(newCategory)) {
        alert('Category already exists');
        return;
    }
    
    // Add new category
    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // Clear input
    input.value = '';
    
    // Refresh displays
    loadCategoriesDropdown();
    displayCategoriesList();
    
    // Show success message
    showMessage('Category added successfully!', 'success');
}

// Delete category
function deleteCategory(categoryName) {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
        return;
    }
    
    let categories = getCategories();
    
    // Remove category
    categories = categories.filter(cat => cat !== categoryName);
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // Refresh displays
    loadCategoriesDropdown();
    displayCategoriesList();
    
    // Show success message
    showMessage('Category deleted successfully!', 'success');
}

// Show message helper
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Initialize category management on add-product page
if (window.location.pathname.includes('admin-add-product.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        initializeCategories();
        loadCategoriesDropdown();
        displayCategoriesList();
        
        // Add Enter key support for adding categories
        const categoryInput = document.getElementById('new-category-input');
        if (categoryInput) {
            categoryInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addCategory();
                }
            });
        }
        
        // Ensure panel is hidden by default
        const panel = document.getElementById('category-management-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    });
}
