// ===== PRODUCT DISPLAY WITH VENDOR INFORMATION =====
// Uses DataManager for data operations

// Load products with vendor information
function loadProductsWithVendors() {
    const products = DataManager.getAllProducts();
    const vendors = DataManager.getAllVendors();
    const productGrid = document.querySelector('.product-grid');
    const homeProductGrid = document.getElementById('home-product-grid');
    
    const targetGrid = productGrid || homeProductGrid;
    if (!targetGrid) return;
    
    // Check if products exist
    if (products.length === 0) {
        const message = homeProductGrid ? 
            'No products available yet. Check back soon!' : 
            'No products available yet. Admin needs to add products.';
        DataManager.renderEmptyState(targetGrid, message, '📦');
        return;
    }
    
    // Get category from URL parameter (only on shop page)
    let filteredProducts = products;
    if (productGrid && !homeProductGrid) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            filteredProducts = products.filter(product => product.category === categoryParam);
            
            // If no products in this category, show message
            if (filteredProducts.length === 0) {
                DataManager.renderEmptyState(targetGrid, `No products found in "${categoryParam}" category.`, '🔍');
                return;
            }
        }
    }
    
    // Limit to 4 products on home page
    const displayProducts = homeProductGrid ? products.slice(0, 4) : filteredProducts;
    
    targetGrid.innerHTML = displayProducts.map(product => {
        // Find vendor for this product
        let vendorInfo = { vendorName: 'CB Organic', businessName: 'CB Organic Farm' };
        if (product.vendorId) {
            const vendor = vendors.find(v => v.id === product.vendorId);
            if (vendor) {
                vendorInfo = {
                    vendorName: vendor.vendorName || vendor.businessName,
                    businessName: vendor.businessName
                };
            }
        }
        
        const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
        const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        const isAvailable = product.stock > 0;
        
        // Display unit (e.g., "500ml", "1kg")
        const unitDisplay = product.displayUnit || (product.unitQuantity ? product.unitQuantity + product.unit : product.unit || '');
        
        return `
            <div class="product-card">
                <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
                <div class="vendor-info" style="font-size: 0.85rem; color: #666; margin: 0.5rem 0; padding: 0.5rem; background: #f9f9f9; border-radius: 5px;">
                    <div style="margin-bottom: 0.3rem;"><strong>Vendor:</strong> ${vendorInfo.vendorName}</div>
                    <div><strong>Business:</strong> ${vendorInfo.businessName}</div>
                </div>
                <h3>${product.name}</h3>
                ${unitDisplay ? `<p style="color: #666; font-size: 0.9rem; margin: 0.3rem 0;">${unitDisplay}</p>` : ''}
                <p class="price">₹${product.price}</p>
                <div class="stock-status" style="margin: 0.5rem 0;">
                    <span class="status-badge ${stockClass}" style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">
                        ${stockStatus}
                    </span>
                </div>
                ${isAvailable ? 
                    `<div class="quantity-selector" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 1rem 0;">
                        <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">-</button>
                        <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" style="width: 60px; height: 35px; text-align: center; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;" readonly>
                        <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">+</button>
                    </div>
                    <button onclick="addToCartWithQuantity('${product.id}')" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 0.5rem 0;">Add to Cart</button>` :
                    `<button class="btn btn-secondary" style="display: block; width: 100%; text-align: center; margin: 1rem 0; opacity: 0.5; cursor: not-allowed;" disabled>Out of Stock</button>`
                }
            </div>
        `;
    }).join('');
}

// Quantity control functions
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
    
    const product = DataManager.getProductById(productId);
    
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    if (product.stock <= 0) {
        alert('This product is out of stock!');
        return;
    }
    
    if (quantity > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
        return;
    }
    
    // Add to cart using DataManager
    DataManager.addToCart(product, quantity);
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Show success message
    alert(`${quantity} x ${product.name} added to cart!`);
    
    // Reset quantity to 1
    if (qtyInput) {
        qtyInput.value = 1;
    }
}

// Add to cart from shop page (legacy function for compatibility)
function addToCartFromShop(productId) {
    addToCartWithQuantity(productId);
}

// Highlight active category on shop page
function highlightActiveCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (!categoryParam) return;
    
    // Update page header if exists
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader) {
        pageHeader.textContent = categoryParam;
    }
    
    // Highlight active category in navigation
    const categoryLinks = document.querySelectorAll('.shop-category-nav .category-link');
    categoryLinks.forEach(link => {
        if (link.textContent.trim() === categoryParam) {
            link.style.color = '#4a7c59';
            link.style.fontWeight = 'bold';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.product-grid') || document.getElementById('home-product-grid')) {
        loadProductsWithVendors();
        highlightActiveCategory();
    }
});
