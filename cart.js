        let cart = [];
        const SHIPPING_THRESHOLD = 999;
        const SHIPPING_COST = 99;

        function loadCart() {
            const savedCart = localStorage.getItem('cart');
            cart = savedCart ? JSON.parse(savedCart) : [];
            updateCartCount();
            renderCart();
        }

        function updateCartCount() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartCount').textContent = totalItems;
        }

        function renderCart() {
            const cartContent = document.getElementById('cartContent');
            const emptyCart = document.getElementById('emptyCart');

            if (cart.length === 0) {
                cartContent.classList.add('hidden');
                emptyCart.classList.remove('hidden');
                return;
            }

            cartContent.classList.remove('hidden');
            emptyCart.classList.add('hidden');

            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
            const total = subtotal + shipping;

            cartContent.innerHTML = `
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-6 border-b">
                            <h2 class="text-xl font-bold text-gray-900">Cart Items (${cart.length})</h2>
                        </div>
                        <div class="divide-y">
                            ${cart.map(item => `
                                <div class="p-6 flex gap-4">
                                    <a href="product-detail.html?code=${item.productcode}" class="flex-shrink-0">
                                        <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded-lg">
                                    </a>
                                    <div class="flex-1 min-w-0">
                                        <a href="product-detail.html?code=${item.productcode}" class="block">
                                            <h3 class="font-semibold text-gray-900 mb-1 hover:text-yellow-600 transition">${item.name}</h3>
                                        </a>
                                        <p class="text-sm text-gray-500 mb-2">${item.category} / ${item.subcategory}</p>
                                        <p class="text-sm text-gray-600 mb-3">Code: ${item.productcode}</p>
                                        <div class="flex items-center gap-4">
                                            <div class="flex items-center gap-2">
                                                <button onclick="updateQuantity('${item.productcode}', ${item.quantity - 1})" class="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 transition flex items-center justify-center">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                                    </svg>
                                                </button>
                                                <span class="w-12 text-center font-semibold">${item.quantity}</span>
                                                <button onclick="updateQuantity('${item.productcode}', ${item.quantity + 1})" class="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 transition flex items-center justify-center">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                            <button onclick="removeItem('${item.productcode}')" class="text-red-600 hover:text-red-700 text-sm font-medium transition">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-lg font-bold text-yellow-600">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        <p class="text-sm text-gray-500 mt-1">₹${item.price.toLocaleString('en-IN')} each</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="mt-6">
                        <a href="products.html" class="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-semibold transition">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Continue Shopping
                        </a>
                    </div>
                </div>

                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                        <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                        
                        <div class="space-y-4 mb-6">
                            <div class="flex justify-between text-gray-700">
                                <span>Subtotal (${cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                <span class="font-semibold">₹${subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div class="flex justify-between text-gray-700">
                                <span>Shipping</span>
                                <span class="font-semibold ${shipping === 0 ? 'text-green-600' : ''}">
                                    ${shipping === 0 ? 'FREE' : '₹' + shipping.toLocaleString('en-IN')}
                                </span>
                            </div>
                            ${subtotal < SHIPPING_THRESHOLD ? `
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p class="text-sm text-blue-800">
                                        Add ₹${(SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')} more for <strong>FREE shipping</strong>
                                    </p>
                                </div>
                            ` : `
                                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p class="text-sm text-green-800 flex items-center">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        You're eligible for <strong class="ml-1">FREE shipping!</strong>
                                    </p>
                                </div>
                            `}
                        </div>

                        <div class="border-t pt-4 mb-6">
                            <div class="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span class="text-yellow-600">₹${total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <button onclick="proceedToCheckout()" class="w-full bg-yellow-600 text-white py-4 rounded-lg font-semibold hover:bg-yellow-700 transition mb-4">
                            Proceed to Checkout
                        </button>

                        <div class="space-y-3">
                            <div class="flex items-center text-sm text-gray-600">
                                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Secure checkout
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                7 Days easy returns
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                100% Authentic products
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t">
                            <p class="text-sm text-gray-600 mb-3">We Accept</p>
                            <div class="flex gap-2 flex-wrap">
                                <div class="px-3 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">Visa</div>
                                <div class="px-3 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">Mastercard</div>
                                <div class="px-3 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">UPI</div>
                                <div class="px-3 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">Net Banking</div>
                                <div class="px-3 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">COD</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function updateQuantity(productCode, newQuantity) {
            if (newQuantity < 1) {
                removeItem(productCode);
                return;
            }

            const item = cart.find(item => item.productcode === productCode);
            if (item) {
                item.quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                updateCartCount();
            }
        }

        function removeItem(productCode) {
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                cart = cart.filter(item => item.productcode !== productCode);
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                updateCartCount();
            }
        }

        function proceedToCheckout() {
            document.getElementById('emailModal').classList.remove('hidden');
            document.getElementById('buyerEmail').value = '';
            document.getElementById('emailError').classList.add('hidden');
        }

        function closeEmailModal() {
            document.getElementById('emailModal').classList.add('hidden');
        }

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        function confirmCheckout() {
            const emailInput = document.getElementById('buyerEmail');
            const email = emailInput.value.trim();
            const emailError = document.getElementById('emailError');

            if (!validateEmail(email)) {
                emailError.classList.remove('hidden');
                emailInput.focus();
                return;
            }

            const orderId = 'ORD' + Date.now().toString().slice(-8);
            const orderDate = new Date().toLocaleString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
            const total = subtotal + shipping;

            const orderDetails = {
                orderId: orderId,
                email: email,
                date: orderDate,
                items: cart,
                subtotal: subtotal,
                shipping: shipping,
                total: total
            };

            sendConfirmationEmail(orderDetails);

            document.getElementById('orderId').textContent = orderId;
            document.getElementById('confirmEmail').textContent = email;
            
            const orderSummary = document.getElementById('orderSummary');
            orderSummary.innerHTML = `
                <h4 class="font-bold text-gray-900 mb-4">Order Details</h4>
                <div class="space-y-3 mb-4">
                    ${cart.map(item => `
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-700">${item.name} x ${item.quantity}</span>
                            <span class="font-semibold text-gray-900">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="border-t pt-3 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-700">Subtotal</span>
                        <span class="font-semibold">₹${subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-700">Shipping</span>
                        <span class="font-semibold ${shipping === 0 ? 'text-green-600' : ''}">
                            ${shipping === 0 ? 'FREE' : '₹' + shipping.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div class="flex justify-between text-lg font-bold border-t pt-2">
                        <span class="text-gray-900">Total</span>
                        <span class="text-yellow-600">₹${total.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            `;

            closeEmailModal();
            document.getElementById('checkoutModal').classList.remove('hidden');
            
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }

        function sendConfirmationEmail(orderDetails) {
            console.log('=== ORDER CONFIRMATION EMAIL ===');
            console.log('To:', orderDetails.email);
            console.log('Order ID:', orderDetails.orderId);
            console.log('Date:', orderDetails.date);
            console.log('\nOrder Items:');
            orderDetails.items.forEach(item => {
                console.log(`- ${item.name} (${item.productcode}) x ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}`);
            });
            console.log('\nSubtotal: ₹' + orderDetails.subtotal.toLocaleString('en-IN'));
            console.log('Shipping: ' + (orderDetails.shipping === 0 ? 'FREE' : '₹' + orderDetails.shipping.toLocaleString('en-IN')));
            console.log('Total: ₹' + orderDetails.total.toLocaleString('en-IN'));
            console.log('================================');
        }

        function closeCheckoutModal() {
            document.getElementById('checkoutModal').classList.add('hidden');
            renderCart();
        }

        loadCart();