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
        
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="vendor-info" style="font-size: 0.85rem; color: #666; margin: 0.5rem 0;">
                    <div><strong>Vendor:</strong> ${vendorInfo.vendorName}</div>
                    <div><strong>Business:</strong> ${vendorInfo.businessName}</div>
                </div>
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>
                <div class="stock-status" style="margin: 0.5rem 0;">
                    <span class="status-badge ${stockClass}" style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">
                        ${stockStatus}
                    </span>
                </div>
                <a href="product.html?id=${product.id}" class="btn btn-secondary" style="display: block; text-align: center; margin: 1rem;">View Details</a>
            </div>
        `;
    }).join('');
}

// Initialize on page load
if (document.querySelector('.product-grid')) {
    document.addEventListener('DOMContentLoaded', loadProductsWithVendors);
}
