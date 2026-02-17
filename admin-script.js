// ===== CLEAR ALL DUMMY DATA =====
// This will clear all dummy products and orders on first load
(function() {
    const CLEAR_FLAG = 'dummy_data_cleared_v1';
    
    // Check if clearing has already been done
    if (!localStorage.getItem(CLEAR_FLAG)) {
        console.log('Admin: Clearing all dummy data...');
        
        // Clear products and orders
        localStorage.removeItem('products');
        localStorage.removeItem('orders');
        
        // Initialize with empty arrays
        localStorage.setItem('products', JSON.stringify([]));
        localStorage.setItem('orders', JSON.stringify([]));
        
        // Mark clearing as complete
        localStorage.setItem(CLEAR_FLAG, 'true');
        
        console.log('Admin: Dummy data cleared. System ready for real data.');
    }
})();
// ===== END CLEAR LOGIC =====

// Supabase client getter - returns window.supabase
const getSupabase = () => window.supabase;
// Create a proxy to access supabase
const supabase = new Proxy({}, {
    get: function(target, prop) {
        if (!window.supabase) {
            console.error('Supabase not initialized yet!');
            return undefined;
        }
        return window.supabase[prop];
    }
});

// Initialize admin data - NO DEFAULT PRODUCTS
function initializeAdminData() {
    // Clear old localStorage data to prevent conflicts with Supabase
    console.log('Clearing localStorage to use Supabase database only...');
    localStorage.removeItem('products');
    localStorage.removeItem('orders');
    localStorage.removeItem('vendors');
    localStorage.removeItem('categories');
    console.log('localStorage cleared - using Supabase database');
}

// Admin Login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const messageEl = document.getElementById('login-message');
    
    if (email === 'ruthvik@blockfortrust.com' && password === 'Saireddy880227') {
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
    // Show confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout?\n\nClick OK to logout or Cancel to stay.');
    
    if (confirmLogout) {
        // User clicked Yes/OK - logout and redirect to homepage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }
    // If user clicked No/Cancel, do nothing (stay on current page)
}

// Vendor Logout
function vendorLogout() {
    logout();
}

// Load Dashboard Data from Supabase
async function loadDashboard() {
    try {
        // Fetch products from Supabase
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*');
        
        // Fetch orders from Supabase
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*');
        
        // Fetch vendors from Supabase
        const { data: vendors, error: vendorsError } = await supabase
            .from('vendors')
            .select('*');
        
        const productsList = products || [];
        const ordersList = orders || [];
        const vendorsList = vendors || [];
        
        const outOfStock = productsList.filter(p => !p.in_stock || p.stock === 0).length;
        
        document.getElementById('total-products').textContent = productsList.length;
        document.getElementById('total-vendors').textContent = vendorsList.length;
        document.getElementById('total-orders').textContent = ordersList.length;
        document.getElementById('out-of-stock').textContent = outOfStock;
        
        // Load vendors list
        loadVendorsList();
        
        // Load recent orders
        const recentOrdersList = document.getElementById('recent-orders-list');
        if (recentOrdersList) {
            const recentOrders = ordersList.slice(0, 5);
            recentOrdersList.innerHTML = recentOrders.map(order => `
                <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                    <strong>${order.id}</strong> - ${order.customer_email} - ₹${order.total} - ${order.status}
                </div>
            `).join('') || '<p>No orders yet</p>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load vendors list in dashboard from Supabase
async function loadVendorsList() {
    const tbody = document.getElementById('vendors-list-body');
    
    if (!tbody) return;
    
    try {
        // Fetch vendors from Supabase
        const { data: vendors, error: vendorsError } = await supabase
            .from('vendors')
            .select('*')
            .order('created_at', { ascending: false });
        
        // Fetch products to count per vendor
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('vendor_id');
        
        if (vendorsError) {
            console.error('Error fetching vendors:', vendorsError);
            tbody.innerHTML = '<tr><td colspan="6">Error loading vendors</td></tr>';
            return;
        }
        
        if (!vendors || vendors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No vendors yet</td></tr>';
            return;
        }
        
        const productsList = products || [];
        
        tbody.innerHTML = vendors.map(vendor => {
            const vendorProducts = productsList.filter(p => p.vendor_id === vendor.id);
            const createdDate = vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A';
            
            return `
                <tr>
                    <td>${vendor.vendor_name}</td>
                    <td>${vendor.business_name}</td>
                    <td>${vendor.phone || 'N/A'}</td>
                    <td><span class="status-badge in-stock">active</span></td>
                    <td>${vendorProducts.length}</td>
                    <td>${createdDate}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading vendors:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error loading vendors</td></tr>';
    }
}

// Open add vendor modal
function openAddVendorModal() {
    document.getElementById('add-vendor-panel').classList.add('active');
}

// Close add vendor modal
function closeAddVendorModal() {
    document.getElementById('add-vendor-panel').classList.remove('active');
    document.getElementById('add-vendor-form').reset();
    document.getElementById('add-vendor-message').textContent = '';
    document.getElementById('add-vendor-message').className = 'form-message';
}

// Handle add vendor - Save to Supabase
async function handleAddVendor(event) {
    event.preventDefault();
    
    const vendorName = document.getElementById('new-vendor-name').value;
    const businessName = document.getElementById('new-business-name').value;
    const phone = document.getElementById('new-vendor-phone').value;
    const address = document.getElementById('new-vendor-address').value;
    const messageEl = document.getElementById('add-vendor-message');
    
    // Show loading message
    messageEl.textContent = 'Creating vendor...';
    messageEl.className = 'form-message';
    
    const newVendor = {
        vendor_name: vendorName,
        business_name: businessName,
        phone: phone || '',
        address: address || ''
    };
    
    try {
        // Insert vendor into Supabase
        const { data, error } = await supabase
            .from('vendors')
            .insert([newVendor])
            .select();
        
        if (error) {
            console.error('Error adding vendor:', error);
            messageEl.textContent = 'Error adding vendor: ' + error.message;
            messageEl.className = 'form-message error';
            return;
        }
        
        messageEl.textContent = 'Vendor created successfully!';
        messageEl.className = 'form-message success';
        
        setTimeout(() => {
            closeAddVendorModal();
            loadDashboard();
        }, 1500);
    } catch (error) {
        console.error('Error adding vendor:', error);
        messageEl.textContent = 'Error adding vendor. Please try again.';
        messageEl.className = 'form-message error';
    }
}

// Load Products Table from Supabase
async function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    
    if (!tbody) {
        console.log('products-table-body element not found');
        return;
    }
    
    // Show loading state
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading products...</td></tr>';
    
    console.log('Fetching products from Supabase...');
    
    // Check if Supabase is available
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase client not available!');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Database connection not available. Please refresh the page.</td></tr>';
        return;
    }
    
    try {
        // Fetch products from Supabase
        const { data: products, error } = await window.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching products:', error);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading products: ' + error.message + '</td></tr>';
            return;
        }
        
        console.log('Products fetched:', products ? products.length : 0);
        
        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No products yet. Click "Add New Product" to add your first product.</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.image_url}" alt="${product.name}" class="product-image-small"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge ${product.in_stock ? 'in-stock' : 'out-of-stock'}">${product.in_stock ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                    <button class="action-btn btn-toggle" onclick="toggleStock('${product.id}')">${product.in_stock ? 'Mark Out' : 'Mark In'}</button>
                </td>
            </tr>
        `).join('');
        
        console.log('Products table loaded successfully');
    } catch (error) {
        console.error('Error loading products:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading products</td></tr>';
    }
}

// Delete Product from Supabase
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product: ' + error.message);
            return;
        }
        
        alert('Product deleted successfully!');
        loadProductsTable();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
    }
}

// Toggle Stock Status in Supabase
async function toggleStock(id) {
    try {
        // First, get the current product
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('in_stock')
            .eq('id', id)
            .single();
        
        if (fetchError) {
            console.error('Error fetching product:', fetchError);
            alert('Error updating stock status');
            return;
        }
        
        // Toggle the stock status
        const { error: updateError } = await supabase
            .from('products')
            .update({ in_stock: !product.in_stock })
            .eq('id', id);
        
        if (updateError) {
            console.error('Error updating stock:', updateError);
            alert('Error updating stock status');
            return;
        }
        
        loadProductsTable();
    } catch (error) {
        console.error('Error toggling stock:', error);
        alert('Error updating stock status. Please try again.');
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

// Add Product - Save to Supabase
async function handleAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const subcategory = document.getElementById('product-subcategory').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const unit = document.getElementById('product-unit').value;
    const unitQuantity = parseFloat(document.getElementById('product-unit-quantity').value);
    const description = document.getElementById('product-description').value;
    const vendorId = document.getElementById('product-vendor').value;
    const messageEl = document.getElementById('form-message');
    
    // Validate required fields
    if (!name || !category || !price || !stock || !unit || !unitQuantity) {
        messageEl.textContent = 'Please fill in all required fields';
        messageEl.className = 'form-message error';
        return;
    }
    
    // Show loading message
    messageEl.textContent = 'Adding product...';
    messageEl.className = 'form-message';
    
    // Create display unit (e.g., "500ml", "1kg", "2 pieces")
    const displayUnit = unitQuantity + unit;
    
    const newProduct = {
        name,
        category,
        subcategory,
        price,
        stock,
        unit,
        unit_quantity: unitQuantity,
        display_unit: displayUnit,
        vendor_id: vendorId || null,
        image_url: imageBase64 || 'images/placeholder.png',
        description,
        in_stock: stock > 0
    };
    
    console.log('Adding product to Supabase:', newProduct);
    
    try {
        // Insert product into Supabase
        const { data, error } = await supabase
            .from('products')
            .insert([newProduct])
            .select();
        
        if (error) {
            console.error('Error adding product:', error);
            messageEl.textContent = 'Error adding product: ' + error.message;
            messageEl.className = 'form-message error';
            return;
        }
        
        console.log('Product added successfully:', data);
        messageEl.textContent = 'Product added successfully! Redirecting...';
        messageEl.className = 'form-message success';
        
        // Redirect with cache busting
        setTimeout(() => {
            window.location.href = 'admin-products.html?t=' + Date.now();
        }, 1500);
        
    } catch (error) {
        console.error('Error adding product:', error);
        messageEl.textContent = 'Error adding product. Please try again.';
        messageEl.className = 'form-message error';
    }
}

// Load Orders Table from Supabase
async function loadOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    
    if (!tbody) return;
    
    // Show loading state
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Loading orders...</td></tr>';
    
    try {
        // Fetch orders from Supabase
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching orders:', error);
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading orders</td></tr>';
            return;
        }
        
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No orders yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map((order) => {
            const items = order.order_items || [];
            const itemsText = items.map(item => `${item.product_name} (${item.quantity})`).join(', ');
            const orderDate = new Date(order.created_at).toLocaleDateString();
            
            return `
            <tr>
                <td>${order.id}</td>
                <td>${itemsText || 'No items'}</td>
                <td>₹${order.total}</td>
                <td>N/A</td>
                <td>${orderDate}</td>
                <td>-</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Packed" ${order.status === 'Packed' ? 'selected' : ''}>Packed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td>
                    ${order.status === 'Delivered' ? 
                        `<button class="btn-delete" onclick="deleteOrder('${order.id}')" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">Delete</button>` : 
                        `<span style="color: #999; font-size: 0.85rem;">Available after delivery</span>`
                    }
                </td>
            </tr>
        `}).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading orders</td></tr>';
    }
}

// Update Order Status in Supabase
async function updateOrderStatus(orderId, newStatus) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        
        if (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
            return;
        }
        
        // Reload table to update delete button visibility
        await loadOrdersTable();
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Error updating order status. Please try again.');
    }
}

// Delete Order from Supabase (only for delivered orders)
async function deleteOrder(orderId) {
    try {
        // First check if order is delivered
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();
        
        if (fetchError || !order) {
            alert('Order not found!');
            return;
        }
        
        if (order.status !== 'Delivered') {
            alert('Only delivered orders can be deleted!');
            return;
        }
        
        if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);
            
            if (error) {
                console.error('Error deleting order:', error);
                alert('Error deleting order: ' + error.message);
                return;
            }
            
            alert('Order deleted successfully!');
            await loadOrdersTable();
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order. Please try again.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname;
    
    // Check admin auth on all admin pages (handled by supabase-auth.js)
    // The checkAdminAuth function is defined in supabase-auth.js
    
    initializeAdminData();
    
    // Wait for Supabase to be ready
    let retries = 0;
    while (typeof window.supabase === 'undefined' && retries < 10) {
        console.log('Waiting for Supabase to initialize...');
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase failed to initialize!');
        alert('Database connection failed. Please refresh the page.');
        return;
    }
    
    // Create global shorthand reference
    if (typeof supabase === 'undefined') {
        window.supabase = window.supabase;
    }
    
    console.log('Supabase initialized successfully');
    
    if (currentPage.includes('admin-dashboard.html')) {
        loadDashboard();
    } else if (currentPage.includes('admin-products.html')) {
        console.log('Loading products table...');
        await loadProductsTable();
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

// Initialize categories - No longer needed, categories are in Supabase
async function initializeCategories() {
    // Categories are now managed in Supabase database
    // This function is kept for compatibility but does nothing
}

// Get categories from Supabase
async function getCategories() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('name')
            .order('name');
        
        if (error) {
            console.error('Error fetching categories:', error);
            return DEFAULT_CATEGORIES;
        }
        
        return categories ? categories.map(c => c.name) : DEFAULT_CATEGORIES;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return DEFAULT_CATEGORIES;
    }
}

// Load categories into dropdown from Supabase
async function loadCategoriesDropdown() {
    const categorySelect = document.getElementById('product-category');
    if (!categorySelect) return;
    
    const categories = await getCategories();
    
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

// Display categories list with delete buttons from Supabase
async function displayCategoriesList() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    const categories = await getCategories();
    
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

// Add new category to Supabase
async function addCategory() {
    const input = document.getElementById('new-category-input');
    if (!input) return;
    
    const newCategory = input.value.trim();
    
    if (!newCategory) {
        alert('Please enter a category name');
        return;
    }
    
    try {
        // Check if category already exists
        const { data: existing } = await supabase
            .from('categories')
            .select('name')
            .eq('name', newCategory)
            .single();
        
        if (existing) {
            alert('Category already exists');
            return;
        }
        
        // Add new category
        const { error } = await supabase
            .from('categories')
            .insert([{ name: newCategory }]);
        
        if (error) {
            console.error('Error adding category:', error);
            alert('Error adding category: ' + error.message);
            return;
        }
        
        // Clear input
        input.value = '';
        
        // Refresh displays
        await loadCategoriesDropdown();
        await displayCategoriesList();
        
        // Show success message
        showMessage('Category added successfully!', 'success');
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category. Please try again.');
    }
}

// Delete category from Supabase
async function deleteCategory(categoryName) {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('name', categoryName);
        
        if (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category: ' + error.message);
            return;
        }
        
        // Refresh displays
        await loadCategoriesDropdown();
        await displayCategoriesList();
        
        // Show success message
        showMessage('Category deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
    }
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


// ===== MULTI-VENDOR SUPPORT =====

// Initialize vendors data
function initializeVendors() {
    if (!localStorage.getItem('vendors')) {
        const defaultVendors = [
            { id: 1, name: "CB Organic Farm", email: "vendor@cb.com", password: "vendor123", phone: "9876543210", status: "active" }
        ];
        localStorage.setItem('vendors', JSON.stringify(defaultVendors));
    }
}

// Initialize order items
function initializeOrderItems() {
    if (!localStorage.getItem('order_items')) {
        localStorage.setItem('order_items', JSON.stringify([]));
    }
}

// Call initialization
initializeVendors();
initializeOrderItems();

// ===== VENDOR LOGIN =====
function handleVendorLogin(event) {
    event.preventDefault();
// Vendor authentication functions removed - vendors are now managed as supplier records only

// ===== CATEGORY MANAGEMENT FUNCTIONS =====
    console.log('=== Loading Vendor Dashboard ===');
    
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser || currentUser.role !== 'vendor') {
        console.error('User is not a vendor, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    const vendorId = parseInt(localStorage.getItem('currentVendorId'));
    const vendorName = localStorage.getItem('currentVendorName') || 'Vendor';
    
    console.log('Vendor ID:', vendorId);
    console.log('Vendor Name:', vendorName);
    
    if (!vendorId) {
        console.error('Vendor ID not found!');
        alert('Vendor session not properly initialized. Please try logging in again.');
        logout();
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    console.log('Total products:', products.length);
    
    // Display vendor info
    const vendorNameInfo = document.getElementById('vendor-name-info');
    const vendorIdInfo = document.getElementById('vendor-id-info');
    
    if (vendorNameInfo) {
        vendorNameInfo.textContent = vendorName;
        console.log('Set vendor name in UI');
    }
    if (vendorIdInfo) {
        vendorIdInfo.textContent = vendorId;
        console.log('Set vendor ID in UI');
    }
    
    // Load inventory table (only vendor's products)
    loadVendorInventory(vendorId, products);
    
    // Load orders received (only vendor's orders)
    loadVendorOrdersReceived(vendorId);
    
    console.log('=== Vendor Dashboard Loaded ===');
}

// Load vendor inventory table
function loadVendorInventory(vendorId, products) {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    
    const vendorProducts = products.filter(p => p.vendor_id === vendorId);
    
    tbody.innerHTML = vendorProducts.map(product => {
        const unit = product.unit || 'piece';
        const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
        const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        
        return `
        <tr>
            <td>${product.name}</td>
            <td>₹${product.price}</td>
            <td>${product.stock}</td>
            <td>${unit}</td>
            <td><span class="status-badge ${stockClass}">${stockStatus}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="openStockEditPanel(${product.id})">Edit</button>
            </td>
        </tr>
    `}).join('') || '<tr><td colspan="6">No products in inventory</td></tr>';
}

// Load vendor orders received
function loadVendorOrdersReceived(vendorId) {
    const tbody = document.getElementById('orders-received-table-body');
    if (!tbody) return;
    
    // Get vendor-specific orders
    const vendorOrders = getVendorOrders(vendorId);
    
    tbody.innerHTML = vendorOrders.map(item => `
        <tr>
            <td>${item.orderId}</td>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>
                <select class="status-select" onchange="updateVendorOrderItemStatus('${item.id}', this.value)">
                    <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${item.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Packed" ${item.status === 'Packed' ? 'selected' : ''}>Packed</option>
                    <option value="Shipped" ${item.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${item.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="4">No orders received yet</td></tr>';
}

// Update vendor order item status
function updateVendorOrderItemStatus(orderItemId, newStatus) {
    if (updateOrderItemStatus(orderItemId, newStatus)) {
        alert('Order status updated successfully');
        loadVendorDashboard();
    } else {
        alert('Failed to update order status');
    }
}

// Open stock edit panel
function openStockEditPanel(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('stock-product-id').value = product.id;
        document.getElementById('stock-product-name').value = product.name;
        document.getElementById('stock-current').value = product.stock;
        document.getElementById('stock-new').value = product.stock;
        document.getElementById('stock-edit-panel').classList.add('active');
    }
}

// Close stock edit panel
function closeStockPanel() {
    document.getElementById('stock-edit-panel').classList.remove('active');
    document.getElementById('stock-edit-form').reset();
    document.getElementById('stock-form-message').textContent = '';
    document.getElementById('stock-form-message').className = 'form-message';
}

// Save stock update
function saveStockUpdate(event) {
    event.preventDefault();
    
    const productId = parseInt(document.getElementById('stock-product-id').value);
    const newStock = parseInt(document.getElementById('stock-new').value);
    const messageEl = document.getElementById('stock-form-message');
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        products[productIndex].stock = newStock;
        products[productIndex].inStock = newStock > 0;
        localStorage.setItem('products', JSON.stringify(products));
        
        messageEl.textContent = 'Stock updated successfully!';
        messageEl.className = 'form-message success';
        
        setTimeout(() => {
            closeStockPanel();
            loadVendorDashboard();
        }, 1000);
    } else {
        messageEl.textContent = 'Product not found';
        messageEl.className = 'form-message error';
    }
}

// ===== VENDOR PRODUCTS =====
function loadVendorProducts() {
    const vendorId = parseInt(localStorage.getItem('currentVendorId'));
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('vendor-products-table-body');
    
    if (!tbody) return;
    
    const vendorProducts = products.filter(p => p.vendor_id === vendorId);
    
    tbody.innerHTML = vendorProducts.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}" class="product-image-small"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">${product.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editVendorProduct(${product.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteVendorProduct(${product.id})">Delete</button>
                <button class="action-btn btn-toggle" onclick="toggleVendorStock(${product.id})">${product.inStock ? 'Mark Out' : 'Mark In'}</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7">No products yet</td></tr>';
}

// Open add product panel
function openAddProductPanel() {
    document.getElementById('product-panel-title').textContent = 'Add New Product';
    document.getElementById('product-id').value = '';
    document.getElementById('vendor-product-form').reset();
    document.getElementById('product-current-image').innerHTML = '';
    loadVendorCategoriesDropdown();
    document.getElementById('product-panel').classList.add('active');
}

// Close product panel
function closeProductPanel() {
    document.getElementById('product-panel').classList.remove('active');
    document.getElementById('vendor-product-form').reset();
}

// Load categories for vendor
function loadVendorCategoriesDropdown() {
    const categorySelect = document.getElementById('product-category');
    if (!categorySelect) return;
    
    const categories = getCategories();
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Preview product image for vendor
let vendorImageBase64 = '';
function previewProductImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('product-current-image');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            vendorImageBase64 = e.target.result;
            preview.innerHTML = `<img src="${vendorImageBase64}" alt="Preview" style="max-width: 150px; border-radius: 8px; margin-bottom: 10px;">`;
        };
        reader.readAsDataURL(file);
    }
}

// Edit vendor product
function editVendorProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('product-panel-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-subcategory').value = product.subcategory;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-unit').value = product.unit || 'piece';
        document.getElementById('product-description').value = product.description || '';
        
        loadVendorCategoriesDropdown();
        document.getElementById('product-category').value = product.category;
        
        const currentImageDiv = document.getElementById('product-current-image');
        currentImageDiv.innerHTML = `<img src="${product.image}" alt="${product.name}" style="max-width: 150px; border-radius: 8px; margin-bottom: 10px;">`;
        vendorImageBase64 = product.image;
        
        document.getElementById('product-panel').classList.add('active');
    }
}

// Save vendor product
function saveVendorProduct(event) {
    event.preventDefault();
    
    const vendorId = parseInt(localStorage.getItem('currentVendorId'));
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const subcategory = document.getElementById('product-subcategory').value;
    const price = parseInt(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const unit = document.getElementById('product-unit').value;
    const description = document.getElementById('product-description').value;
    const messageEl = document.getElementById('product-form-message');
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (productId) {
        // Edit existing product
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                category,
                subcategory,
                price,
                stock,
                unit,
                description,
                inStock: stock > 0,
                image: vendorImageBase64 || products[index].image
            };
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name,
            category,
            subcategory,
            price,
            stock,
            unit,
            image: vendorImageBase64 || 'images/placeholder.png',
            description,
            inStock: stock > 0,
            vendor_id: vendorId
        };
        products.push(newProduct);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    messageEl.textContent = 'Product saved successfully!';
    messageEl.className = 'form-message success';
    
    setTimeout(() => {
        closeProductPanel();
        loadVendorProducts();
        vendorImageBase64 = '';
    }, 1000);
}

// Delete vendor product
function deleteVendorProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    loadVendorProducts();
}

// Toggle vendor stock
function toggleVendorStock(id) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    if (product) {
        product.inStock = !product.inStock;
        localStorage.setItem('products', JSON.stringify(products));
        loadVendorProducts();
    }
}

// ===== VENDOR ORDERS =====
function loadVendorOrders() {
    const vendorId = parseInt(localStorage.getItem('currentVendorId'));
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tbody = document.getElementById('vendor-orders-table-body');
    
    if (!tbody) return;
    
    // Filter orders containing vendor's products
    const vendorOrders = orders.filter(order => 
        order.items && order.items.some(item => {
            const product = products.find(p => p.name === item.name);
            return product && product.vendor_id === vendorId;
        })
    );
    
    tbody.innerHTML = vendorOrders.map((order, index) => {
        const deliveryDate = order.deliveryDate || 'Not set';
        const deliveryStatus = order.deliveryStatus || 'Pending';
        
        return `
        <tr>
            <td>${order.id}</td>
            <td>${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</td>
            <td>₹${order.total}</td>
            <td>${order.date}</td>
            <td>
                <input type="date" class="delivery-date-input" value="${order.deliveryDate || ''}" 
                       onchange="updateVendorDeliveryDate('${order.id}', this.value)">
            </td>
            <td>
                <select class="status-select" onchange="updateVendorDeliveryStatus('${order.id}', this.value)">
                    <option value="Pending" ${deliveryStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${deliveryStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${deliveryStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${deliveryStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
        </tr>
    `}).join('') || '<tr><td colspan="6">No orders yet</td></tr>';
}

// Update delivery date
function updateVendorDeliveryDate(orderId, date) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.deliveryDate = date;
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Update delivery status
function updateVendorDeliveryStatus(orderId, status) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.deliveryStatus = status;
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Load vendors table from Supabase
async function loadVendorsTable() {
    const tbody = document.getElementById('vendors-table-body');
    
    if (!tbody) return;
    
    // Show loading state
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading vendors...</td></tr>';
    
    try {
        // Fetch vendors from Supabase
        const { data: vendors, error: vendorsError } = await supabase
            .from('vendors')
            .select('*')
            .order('created_at', { ascending: false });
        
        // Fetch products to count per vendor
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('vendor_id');
        
        if (vendorsError) {
            console.error('Error fetching vendors:', vendorsError);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading vendors</td></tr>';
            return;
        }
        
        if (!vendors || vendors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No vendors yet</td></tr>';
            return;
        }
        
        const productsList = products || [];
        
        tbody.innerHTML = vendors.map(vendor => {
            const vendorProductCount = productsList.filter(p => p.vendor_id === vendor.id).length;
            
            return `
            <tr>
                <td>${vendor.id.substring(0, 8)}...</td>
                <td>${vendor.vendor_name}</td>
                <td>${vendor.business_name}</td>
                <td>${vendor.phone || 'N/A'}</td>
                <td>${vendor.address || 'N/A'}</td>
                <td><span class="status-badge in-stock">active</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="editVendor('${vendor.id}')">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteVendor('${vendor.id}')">Delete</button>
                </td>
            </tr>
        `}).join('');
    } catch (error) {
        console.error('Error loading vendors:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading vendors</td></tr>';
    }
}

// Open add vendor panel
function openAddVendorPanel() {
    document.getElementById('vendor-panel-title').textContent = 'Add New Vendor';
    document.getElementById('vendor-id').value = '';
    document.getElementById('vendor-form').reset();
    document.getElementById('vendor-panel').classList.add('active');
}

// Close vendor panel
function closeVendorPanel() {
    document.getElementById('vendor-panel').classList.remove('active');
    document.getElementById('vendor-form').reset();
}

// Edit vendor - Load from Supabase
async function editVendor(id) {
    try {
        const { data: vendor, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error || !vendor) {
            alert('Error loading vendor details');
            return;
        }
        
        document.getElementById('vendor-panel-title').textContent = 'Edit Vendor';
        document.getElementById('vendor-id').value = vendor.id;
        document.getElementById('vendor-name').value = vendor.vendor_name;
        document.getElementById('business-name').value = vendor.business_name;
        document.getElementById('vendor-phone').value = vendor.phone || '';
        document.getElementById('vendor-address').value = vendor.address || '';
        document.getElementById('vendor-status').value = 'active';
        document.getElementById('vendor-panel').classList.add('active');
    } catch (error) {
        console.error('Error loading vendor:', error);
        alert('Error loading vendor details');
    }
}

// Save vendor to Supabase
async function saveVendor(event) {
    event.preventDefault();
    
    const vendorId = document.getElementById('vendor-id').value;
    const vendorName = document.getElementById('vendor-name').value;
    const businessName = document.getElementById('business-name').value;
    const phone = document.getElementById('vendor-phone').value;
    const address = document.getElementById('vendor-address').value;
    const status = document.getElementById('vendor-status').value;
    const messageEl = document.getElementById('vendor-form-message');
    
    messageEl.textContent = 'Saving vendor...';
    messageEl.className = 'form-message';
    
    try {
        if (vendorId) {
            // Edit existing vendor
            const { error } = await supabase
                .from('vendors')
                .update({
                    vendor_name: vendorName,
                    business_name: businessName,
                    phone: phone || '',
                    address: address || ''
                })
                .eq('id', vendorId);
            
            if (error) throw error;
        } else {
            // Add new vendor
            const { error } = await supabase
                .from('vendors')
                .insert([{
                    vendor_name: vendorName,
                    business_name: businessName,
                    phone: phone || '',
                    address: address || ''
                }]);
            
            if (error) throw error;
        }
        
        messageEl.textContent = 'Vendor saved successfully!';
        messageEl.className = 'form-message success';
        
        setTimeout(() => {
            closeVendorPanel();
            loadVendorsTable();
        }, 1000);
    } catch (error) {
        console.error('Error saving vendor:', error);
        messageEl.textContent = 'Error saving vendor: ' + error.message;
        messageEl.className = 'form-message error';
    }
}

// Delete vendor from Supabase
async function deleteVendor(id) {
    if (!confirm('Are you sure you want to delete this vendor? All their products will remain but will be unassigned.')) return;
    
    try {
        const { error } = await supabase
            .from('vendors')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting vendor:', error);
            alert('Error deleting vendor: ' + error.message);
            return;
        }
        
        alert('Vendor deleted successfully!');
        loadVendorsTable();
    } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Error deleting vendor. Please try again.');
    }
}

// Load vendors dropdown from Supabase
async function loadVendorsDropdown() {
    const vendorSelect = document.getElementById('product-vendor');
    if (!vendorSelect) {
        console.log('Vendor select element not found');
        return;
    }
    
    console.log('Loading vendors dropdown...');
    
    try {
        const { data: vendors, error } = await supabase
            .from('vendors')
            .select('*')
            .order('vendor_name');
        
        if (error) {
            console.error('Error loading vendors:', error);
            return;
        }
        
        console.log('Vendors loaded:', vendors);
        
        vendorSelect.innerHTML = '<option value="">Select Vendor</option>';
        
        if (vendors && vendors.length > 0) {
            vendors.forEach(vendor => {
                const option = document.createElement('option');
                option.value = vendor.id;
                option.textContent = vendor.vendor_name || vendor.business_name;
                vendorSelect.appendChild(option);
                console.log('Added vendor option:', vendor.vendor_name || vendor.business_name);
            });
        } else {
            console.log('No vendors found in database');
        }
    } catch (error) {
        console.error('Error loading vendors:', error);
    }
}

// Update handleAddProduct to include vendor_id
const originalHandleAddProduct = handleAddProduct;
handleAddProduct = function(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const vendorId = parseInt(document.getElementById('product-vendor').value);
    const category = document.getElementById('product-category').value;
    const subcategory = document.getElementById('product-subcategory').value;
    const price = parseInt(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value;
    const messageEl = document.getElementById('form-message');
    
    if (!vendorId) {
        messageEl.textContent = 'Please select a vendor';
        messageEl.className = 'form-message error';
        return;
    }
    
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
        inStock: stock > 0,
        vendor_id: vendorId
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    messageEl.textContent = 'Product added successfully!';
    messageEl.className = 'form-message success';
    
    setTimeout(() => {
        window.location.href = 'admin-products.html';
    }, 1500);
};

// Update loadOrdersTable to show vendor and delivery info
const originalLoadOrdersTable = loadOrdersTable;
loadOrdersTable = function() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const tbody = document.getElementById('orders-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = orders.map((order, index) => {
        // Get vendor for first item (simplified)
        let vendorName = 'N/A';
        if (order.items && order.items.length > 0) {
            const firstProduct = products.find(p => p.name === order.items[0].name);
            if (firstProduct && firstProduct.vendor_id) {
                const vendor = vendors.find(v => v.id === firstProduct.vendor_id);
                if (vendor) vendorName = vendor.name;
            }
        }
        
        const deliveryDate = order.deliveryDate || 'Not set';
        const deliveryStatus = order.deliveryStatus || 'Pending';
        
        return `
        <tr>
            <td>${order.id}</td>
            <td>${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</td>
            <td>₹${order.total}</td>
            <td>${vendorName}</td>
            <td>${order.date}</td>
            <td>
                <input type="date" class="delivery-date-input" value="${order.deliveryDate || ''}" 
                       onchange="updateAdminDeliveryDate(${index}, this.value)">
            </td>
            <td>
                <select class="status-select" onchange="updateAdminDeliveryStatus(${index}, this.value)">
                    <option value="Pending" ${deliveryStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${deliveryStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${deliveryStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${deliveryStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td>
                ${deliveryStatus === 'Delivered' ? 
                    `<button class="btn-delete" onclick="deleteOrder(${index})" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">Delete</button>` : 
                    `<span style="color: #999; font-size: 0.85rem;">Available after delivery</span>`
                }
            </td>
        </tr>
    `}).join('') || '<tr><td colspan="8">No orders yet</td></tr>';
};

// Update admin delivery date
function updateAdminDeliveryDate(index, date) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders[index]) {
        orders[index].deliveryDate = date;
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Update admin delivery status
function updateAdminDeliveryStatus(index, status) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders[index]) {
        orders[index].deliveryStatus = status;
        localStorage.setItem('orders', JSON.stringify(orders));
        // Reload table to update delete button visibility
        loadOrdersTable();
    }
}

// Update loadProductsTable to show vendor info
const originalLoadProductsTable = loadProductsTable;
loadProductsTable = function() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const tbody = document.getElementById('products-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = products.map(product => {
        let vendorName = 'N/A';
        if (product.vendor_id) {
            const vendor = vendors.find(v => v.id === product.vendor_id);
            if (vendor) vendorName = vendor.name;
        }
        
        return `
        <tr>
            <td><img src="${product.image}" alt="${product.name}" class="product-image-small"></td>
            <td>${product.name}<br><small style="color: #666;">Vendor: ${vendorName}</small></td>
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
    `}).join('');
};

// Initialize on page load - extend existing DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    // Vendor pages
    if (currentPage.includes('vendor-')) {
        checkVendorAuth();
        displayVendorName();
        
        if (currentPage.includes('vendor-dashboard.html')) {
            loadVendorDashboard();
        } else if (currentPage.includes('vendor-products.html')) {
            loadVendorProducts();
        } else if (currentPage.includes('vendor-orders.html')) {
            loadVendorOrders();
        }
    }
    
    // Admin vendors page
    if (currentPage.includes('admin-vendors.html')) {
        loadVendorsTable();
    }
    
    // Admin add product page - load vendors dropdown
    if (currentPage.includes('admin-add-product.html')) {
        loadVendorsDropdown();
    }
});


// ===== CATEGORY MANAGEMENT FUNCTIONS =====

// Open Add Category Modal
function openAddCategoryModal() {
    document.getElementById('add-category-modal').style.display = 'flex';
    document.getElementById('new-category-name').value = '';
    document.getElementById('category-form-message').textContent = '';
}

// Close Add Category Modal
function closeAddCategoryModal() {
    document.getElementById('add-category-modal').style.display = 'none';
}

// Add New Category
function addNewCategory(event) {
    event.preventDefault();
    
    const categoryName = document.getElementById('new-category-name').value.trim();
    const messageEl = document.getElementById('category-form-message');
    
    if (!categoryName) {
        messageEl.textContent = 'Please enter a category name';
        messageEl.style.color = 'red';
        return;
    }
    
    // Get existing categories
    let categories = JSON.parse(localStorage.getItem('categories')) || [
        "Fruits & Vegetables",
        "Daily Staples",
        "Snacks & More",
        "Bakery & Dairy",
        "Home Food",
        "Special Categories",
        "Conscious Living"
    ];
    
    // Check if category already exists
    if (categories.includes(categoryName)) {
        messageEl.textContent = 'Category already exists!';
        messageEl.style.color = 'red';
        return;
    }
    
    // Add new category
    categories.push(categoryName);
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // Refresh category dropdown
    loadCategoryOptions();
    
    messageEl.textContent = 'Category added successfully!';
    messageEl.style.color = 'green';
    
    // Close modal after 1 second
    setTimeout(() => {
        closeAddCategoryModal();
    }, 1000);
}

// Open Delete Category Modal
function openDeleteCategoryModal() {
    const modal = document.getElementById('delete-category-modal');
    const select = document.getElementById('delete-category-select');
    
    // Load categories
    let categories = JSON.parse(localStorage.getItem('categories')) || [
        "Fruits & Vegetables",
        "Daily Staples",
        "Snacks & More",
        "Bakery & Dairy",
        "Home Food",
        "Special Categories",
        "Conscious Living"
    ];
    
    select.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    
    modal.style.display = 'flex';
    document.getElementById('delete-category-message').textContent = '';
}

// Close Delete Category Modal
function closeDeleteCategoryModal() {
    document.getElementById('delete-category-modal').style.display = 'none';
}

// Delete Category
function deleteCategory(event) {
    event.preventDefault();
    
    const categoryToDelete = document.getElementById('delete-category-select').value;
    const messageEl = document.getElementById('delete-category-message');
    
    if (!categoryToDelete) {
        messageEl.textContent = 'Please select a category to delete';
        messageEl.style.color = 'red';
        return;
    }
    
    // Get existing categories
    let categories = JSON.parse(localStorage.getItem('categories')) || [
        "Fruits & Vegetables",
        "Daily Staples",
        "Snacks & More",
        "Bakery & Dairy",
        "Home Food",
        "Special Categories",
        "Conscious Living"
    ];
    
    // Remove category
    categories = categories.filter(cat => cat !== categoryToDelete);
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // Refresh category dropdown
    loadCategoryOptions();
    
    messageEl.textContent = 'Category deleted successfully!';
    messageEl.style.color = 'green';
    
    // Close modal after 1 second
    setTimeout(() => {
        closeDeleteCategoryModal();
    }, 1000);
}

// Load category options in dropdown
function loadCategoryOptions() {
    const categorySelect = document.getElementById('product-category');
    if (!categorySelect) return;
    
    let categories = JSON.parse(localStorage.getItem('categories')) || [
        "Fruits & Vegetables",
        "Daily Staples",
        "Snacks & More",
        "Bakery & Dairy",
        "Home Food",
        "Special Categories",
        "Conscious Living"
    ];
    
    const currentValue = categorySelect.value;
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === currentValue) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    });
}

// Initialize categories on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('product-category')) {
        loadCategoryOptions();
    }
});
