// ===== PRODUCT DISPLAY WITH VENDOR INFORMATION =====

// Load products with vendor information
function loadProductsWithVendors() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const productGrid = document.querySelector('.product-grid');
    
    if (!productGrid) return;
    
    productGrid.innerHTML = products.map(product => {
        // Find vendor for this product
        let vendorInfo = { vendorName: 'N/A', businessName: 'N/A' };
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
                    `<button onclick="addToCartFromShop(${product.id})" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 1rem 0;">Add to Cart</button>` :
                    `<button class="btn btn-secondary" style="display: block; width: 100%; text-align: center; margin: 1rem 0; opacity: 0.5; cursor: not-allowed;" disabled>Out of Stock</button>`
                }
            </div>
        `;
    }).join('');
}

// Add to cart from shop page
function addToCartFromShop(productId) {
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
    
    // Get existing cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            vendor_id: product.vendor_id
        });
    }
    
    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    alert(`${product.name} added to cart!`);
}

// Initialize on page load
if (document.querySelector('.product-grid')) {
    document.addEventListener('DOMContentLoaded', loadProductsWithVendors);
}
