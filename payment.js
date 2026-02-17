// ===== PAYMENT SYSTEM =====

// Payment Modal HTML
const paymentModalHTML = `
<div class="payment-modal" id="payment-modal" style="display: none;">
    <div class="payment-modal-overlay" onclick="closePaymentModal()"></div>
    <div class="payment-sidebar">
        <div class="payment-sidebar-header">
            <h2 id="payment-modal-title">Complete Payment</h2>
            <button class="payment-close" onclick="closePaymentModal()">&times;</button>
        </div>
        
        <div class="payment-sidebar-body">
            <!-- Order Details Section -->
            <div class="order-details-section" id="order-details-section">
                <h3>Order Details</h3>
                <div id="order-items-list"></div>
                <div class="order-breakdown">
                    <div class="breakdown-row">
                        <span>Subtotal:</span>
                        <span id="order-subtotal">₹0</span>
                    </div>
                    <div class="breakdown-row">
                        <span>Tax (5%):</span>
                        <span id="order-tax">₹0</span>
                    </div>
                    <div class="breakdown-row">
                        <span>Shipping:</span>
                        <span id="order-shipping">₹50</span>
                    </div>
                    <div class="breakdown-row total-row">
                        <span>Total:</span>
                        <span id="order-total">₹0</span>
                    </div>
                </div>
            </div>
            
            <!-- Donation Details Section -->
            <div class="donation-details-section" id="donation-details-section" style="display: none;">
                <h3>Donation Details</h3>
                <div class="donation-info">
                    <div class="donation-row">
                        <span>Donor Name:</span>
                        <span id="donor-name-display"></span>
                    </div>
                    <div class="donation-row">
                        <span>Amount:</span>
                        <span id="donation-amount-display">₹0</span>
                    </div>
                </div>
            </div>
            
            <!-- Payment Methods Section -->
            <div class="payment-methods-section">
                <h3>Select Payment Method</h3>
                
                <label class="payment-method-option">
                    <input type="radio" name="payment-method" value="Cash on Delivery" checked>
                    <div class="payment-method-card">
                        <div class="payment-method-icon">💵</div>
                        <div class="payment-method-info">
                            <div class="payment-method-name">Cash on Delivery</div>
                            <div class="payment-method-desc">Pay when you receive your order</div>
                        </div>
                    </div>
                </label>
                
                <label class="payment-method-option">
                    <input type="radio" name="payment-method" value="UPI">
                    <div class="payment-method-card">
                        <div class="payment-method-icon">📱</div>
                        <div class="payment-method-info">
                            <div class="payment-method-name">UPI</div>
                            <div class="payment-method-desc">Google Pay, PhonePe, Paytm</div>
                        </div>
                    </div>
                </label>
            </div>
            
            <div id="payment-processing" class="payment-processing" style="display: none;">
                <div class="payment-spinner"></div>
                <div class="payment-processing-text">Connecting to payment server...</div>
                <div class="payment-processing-subtext">Please wait while we process your payment</div>
            </div>
            
            <div id="payment-success" class="payment-success" style="display: none;">
                <div class="payment-success-icon">✓</div>
                <div class="payment-success-text">Payment Successful!</div>
            </div>
        </div>
        
        <div class="payment-sidebar-footer">
            <button class="btn btn-secondary" onclick="closePaymentModal()">Cancel</button>
            <button class="btn btn-primary" id="pay-now-btn" onclick="processPayment()">Pay Now</button>
        </div>
    </div>
</div>
`;

// Payment Modal Styles
const paymentModalStyles = `
<style>
.payment-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
}

.payment-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.payment-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 450px;
    max-width: 90%;
    height: 100%;
    background: white;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.3s ease;
    z-index: 10001;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

.payment-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
    background: #f8f8f8;
}

.payment-sidebar-header h2 {
    margin: 0;
    color: #2e7d32;
    font-size: 1.5rem;
}

.payment-close {
    background: none;
    border: none;
    font-size: 2rem;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s;
}

.payment-close:hover {
    color: #333;
}

.payment-sidebar-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
}

.order-details-section,
.donation-details-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
}

.order-details-section h3,
.donation-details-section h3,
.payment-methods-section h3 {
    font-size: 1.2rem;
    color: #2e7d32;
    margin-bottom: 1rem;
}

.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
    border-bottom: none;
}

.order-item-info {
    flex: 1;
}

.order-item-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
}

.order-item-details {
    font-size: 0.85rem;
    color: #666;
}

.order-item-price {
    font-weight: 600;
    color: #2e7d32;
}

.order-breakdown {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #e0e0e0;
}

.breakdown-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 0.95rem;
}

.breakdown-row.total-row {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2e7d32;
    padding-top: 1rem;
    border-top: 2px solid #e0e0e0;
    margin-top: 0.5rem;
}

.donation-info {
    background: #f0f7f0;
    padding: 1rem;
    border-radius: 8px;
}

.donation-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 1rem;
}

.donation-row:last-child {
    font-weight: bold;
    color: #2e7d32;
    font-size: 1.2rem;
}

.payment-methods-section {
    margin-bottom: 1rem;
}

.payment-method-option {
    display: block;
    margin-bottom: 0.75rem;
    cursor: pointer;
}

.payment-method-option input[type="radio"] {
    display: none;
}

.payment-method-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s;
}

.payment-method-option input[type="radio"]:checked + .payment-method-card {
    border-color: #4a7c59;
    background: #f0f7f0;
}

.payment-method-card:hover {
    border-color: #4a7c59;
}

.payment-method-icon {
    font-size: 2rem;
    margin-right: 1rem;
}

.payment-method-info {
    flex: 1;
}

.payment-method-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
}

.payment-method-desc {
    font-size: 0.85rem;
    color: #666;
}

.payment-processing {
    text-align: center;
    padding: 2rem;
}

.payment-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f0f0f0;
    border-top: 4px solid #4a7c59;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.payment-processing-text {
    font-size: 1.1rem;
    color: #666;
    font-weight: 500;
}

.payment-processing-subtext {
    font-size: 0.9rem;
    color: #999;
    margin-top: 0.5rem;
}

.payment-success {
    text-align: center;
    padding: 2rem;
}

.payment-success-icon {
    width: 80px;
    height: 80px;
    background: #4a7c59;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    margin: 0 auto 1rem;
    animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.payment-success-text {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2e7d32;
}

.payment-sidebar-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 2px solid #e0e0e0;
    background: #f8f8f8;
}

.payment-sidebar-footer .btn {
    flex: 1;
    padding: 0.75rem;
    font-size: 1rem;
}

@media (max-width: 768px) {
    .payment-sidebar {
        width: 100%;
        max-width: 100%;
    }
}
</style>
`;

// Initialize payment modal
function initializePaymentModal() {
    if (!document.getElementById('payment-modal')) {
        document.body.insertAdjacentHTML('beforeend', paymentModalStyles);
        document.body.insertAdjacentHTML('beforeend', paymentModalHTML);
    }
}

// Global payment context
let currentPaymentContext = null;

// Open payment modal for checkout
function openCheckoutPayment(orderData) {
    initializePaymentModal();
    
    currentPaymentContext = {
        type: 'checkout',
        data: orderData
    };
    
    // Set title
    document.getElementById('payment-modal-title').textContent = 'Complete Payment';
    
    // Show order details section, hide donation section
    document.getElementById('order-details-section').style.display = 'block';
    document.getElementById('donation-details-section').style.display = 'none';
    
    // Populate order items
    const orderItemsList = document.getElementById('order-items-list');
    orderItemsList.innerHTML = '';
    
    orderData.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-details">Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</div>
            </div>
            <div class="order-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
        `;
        orderItemsList.appendChild(itemDiv);
    });
    
    // Calculate breakdown
    const subtotal = orderData.total;
    const tax = subtotal * 0.05;
    const shipping = 50;
    const total = subtotal + tax + shipping;
    
    document.getElementById('order-subtotal').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('order-tax').textContent = '₹' + tax.toFixed(2);
    document.getElementById('order-shipping').textContent = '₹' + shipping.toFixed(2);
    document.getElementById('order-total').textContent = '₹' + total.toFixed(2);
    
    // Update order data with final total
    orderData.finalTotal = total;
    
    // Show modal
    document.getElementById('payment-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open payment modal for donation
function openDonationPayment(donationData) {
    initializePaymentModal();
    
    currentPaymentContext = {
        type: 'donation',
        data: donationData
    };
    
    // Set title
    document.getElementById('payment-modal-title').textContent = 'Complete Donation';
    
    // Hide order details section, show donation section
    document.getElementById('order-details-section').style.display = 'none';
    document.getElementById('donation-details-section').style.display = 'block';
    
    // Populate donation details
    document.getElementById('donor-name-display').textContent = donationData.name;
    document.getElementById('donation-amount-display').textContent = '₹' + donationData.amount.toFixed(2);
    
    // Show modal
    document.getElementById('payment-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentPaymentContext = null;
    
    // Reset modal state
    document.getElementById('payment-processing').style.display = 'none';
    document.getElementById('payment-success').style.display = 'none';
    document.querySelector('.payment-methods-section').style.display = 'block';
    document.querySelector('.payment-sidebar-footer').style.display = 'flex';
}

// Process payment
async function processPayment() {
    if (!currentPaymentContext) return;
    
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Hide payment options and footer
    document.querySelector('.payment-methods-section').style.display = 'none';
    document.querySelector('.payment-sidebar-footer').style.display = 'none';
    
    // Show payment loader
    showPaymentLoader();
    
    // Simulate payment processing (2 seconds)
    setTimeout(async () => {
        hidePaymentLoader();
        showPaymentSuccess();
        
        // Process based on context type
        if (currentPaymentContext.type === 'checkout') {
            await processCheckoutPayment(selectedMethod);
        } else if (currentPaymentContext.type === 'donation') {
            processDonationPayment(selectedMethod);
        }
        
        // Close modal and redirect after 2 seconds
        setTimeout(() => {
            closePaymentModal();
            
            if (currentPaymentContext.type === 'checkout') {
                window.location.href = 'orders.html';
            } else {
                alert('Thank you for your generous donation!');
            }
        }, 2000);
    }, 2000);
}

// Payment Loader Functions
function showPaymentLoader() {
    document.getElementById('payment-processing').style.display = 'block';
    document.getElementById('payment-success').style.display = 'none';
}

function hidePaymentLoader() {
    document.getElementById('payment-processing').style.display = 'none';
}

function showPaymentSuccess() {
    document.getElementById('payment-success').style.display = 'block';
}

// Process checkout payment
async function processCheckoutPayment(paymentMethod) {
    const orderData = currentPaymentContext.data;
    
    const orderId = 'CB' + Date.now();
    const finalTotal = orderData.finalTotal || (orderData.total + (orderData.total * 0.05) + 50);
    
    try {
        // Get current user email from Supabase session
        const { data: { user } } = await window.supabase.auth.getUser();
        const customerEmail = user?.email || orderData.email || 'guest@example.com';
        
        // Insert order into Supabase orders table
        const { data: orderInserted, error: orderError } = await window.supabase
            .from('orders')
            .insert({
                id: orderId,
                customer_email: customerEmail,
                total: finalTotal,
                status: 'Pending'
            })
            .select()
            .single();
        
        if (orderError) {
            console.error('Error inserting order:', orderError);
            alert('Failed to save order. Please try again.');
            return;
        }
        
        // Insert order items into Supabase order_items table
        const orderItems = orderData.items.map(item => ({
            order_id: orderId,
            product_id: item.id || null,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
        }));
        
        const { error: itemsError } = await window.supabase
            .from('order_items')
            .insert(orderItems);
        
        if (itemsError) {
            console.error('Error inserting order items:', itemsError);
            alert('Failed to save order items. Please try again.');
            return;
        }
        
        console.log('Order saved successfully:', orderId);
        
        // Clear cart from localStorage
        localStorage.setItem('cart', JSON.stringify([]));
        
        // Update cart count
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        
    } catch (error) {
        console.error('Error processing checkout:', error);
        alert('Failed to process order. Please try again.');
    }
}

// Process donation payment
function processDonationPayment(paymentMethod) {
    const donationData = currentPaymentContext.data;
    
    const donation = {
        id: 'DON' + Date.now(),
        name: donationData.name,
        amount: donationData.amount,
        paymentMethod: paymentMethod,
        status: 'Completed',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
    };
    
    // Save donation
    const donations = JSON.parse(localStorage.getItem('donations')) || [];
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
}

// Razorpay integration placeholder (for future use)
function initializeRazorpay(amount, orderId, callback) {
    // This function will be used when integrating real Razorpay
    // For now, it's a placeholder
    
    /* Example Razorpay integration:
    const options = {
        key: "YOUR_RAZORPAY_KEY",
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "CB Organic Store",
        description: "Order Payment",
        order_id: orderId,
        handler: function (response) {
            callback(true, response);
        },
        prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999"
        },
        theme: {
            color: "#4a7c59"
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
    */
}
