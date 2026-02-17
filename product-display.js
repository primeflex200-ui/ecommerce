



async function loadProductsWithVendors() {
    const productGrid = document.querySelector('.product-grid');
    const homeProductGrid = document.getElementById('home-product-grid');
    const targetGrid = productGrid || homeProductGrid;
    if (!targetGrid) return;
    targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Loading products...</div>';
    
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase not initialized');
        targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #d32f2f;">Database connection error. Please refresh the page.</div>';
        return;
    }
    
    try {
        const { data: products, error } = await window.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching products:', error);
            targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading products. Please try again.</div>';
            return;
        }
        if (!products || products.length === 0) {
            const message = homeProductGrid ? 
                'No products available yet. Check back soon!' : 
                'No products available yet. Admin needs to add products.';
            targetGrid.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                    <div style="font-size: 1.2rem; color: #666;">${message}</div>
                </div>
            `;
            return;
        }
        let filteredProducts = products;
        if (productGrid && !homeProductGrid) {
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            if (categoryParam) {
                filteredProducts = products.filter(product => product.category === categoryParam);
                if (filteredProducts.length === 0) {
                    targetGrid.innerHTML = `
                        <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                            <div style="font-size: 1.2rem; color: #666;">No products found in "${categoryParam}" category.</div>
                        </div>
                    `;
                    return;
                }
            }
        }
        const displayProducts = homeProductGrid ? products.slice(0, 4) : filteredProducts;
        const { data: vendors } = await window.supabase
            .from('vendors')
            .select('*');
        targetGrid.innerHTML = displayProducts.map(product => {
            let vendorInfo = { vendorName: 'CB Organic', businessName: 'CB Organic Farm' };
            if (product.vendor_id && vendors) {
                const vendor = vendors.find(v => v.id === product.vendor_id);
                if (vendor) {
                    vendorInfo = {
                        vendorName: vendor.vendor_name || vendor.business_name,
                        businessName: vendor.business_name
                    };
                }
            }
            const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
            const isAvailable = product.stock > 0;
            const unitDisplay = product.display_unit || (product.unit_quantity ? product.unit_quantity + product.unit : product.unit || '');
            return `
                <div class="product-card">
                    <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}">
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
    } catch (error) {
        console.error('Error loading products:', error);
        targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading products. Please try again.</div>';
    }
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
    window.supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
        .then(({ data: product, error }) => {
            if (error || !product) {
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
            DataManager.addToCart(product, quantity);
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            alert(`${quantity} x ${product.name} added to cart!`);
            if (qtyInput) {
                qtyInput.value = 1;
            }
        });
}


function addToCartFromShop(productId) {
    addToCartWithQuantity(productId);
}


function highlightActiveCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (!categoryParam) return;
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader) {
        pageHeader.textContent = categoryParam;
    }
    const categoryLinks = document.querySelectorAll('.shop-category-nav .category-link');
    categoryLinks.forEach(link => {
        if (link.textContent.trim() === categoryParam) {
            link.style.color = '#4a7c59';
            link.style.fontWeight = 'bold';
        }
    });
}


document.addEventListener('DOMContentLoaded', async function() {
    if (document.querySelector('.product-grid') || document.getElementById('home-product-grid')) {
        let retries = 0;
        while (typeof window.supabase === 'undefined' && retries < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase failed to initialize');
            const targetGrid = document.querySelector('.product-grid') || document.getElementById('home-product-grid');
            if (targetGrid) {
                targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #d32f2f;">Database connection error. Please refresh the page.</div>';
            }
            return;
        }
        
        loadProductsWithVendors();
        highlightActiveCategory();
    }
});
