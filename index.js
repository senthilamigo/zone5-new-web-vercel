let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-item');
        const dots = document.querySelectorAll('.carousel-dot');

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.opacity = i === index ? '1' : '0';
            });
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.remove('bg-white/50', 'w-2');
                    dot.classList.add('bg-white', 'w-8');
                } else {
                    dot.classList.remove('bg-white', 'w-8');
                    dot.classList.add('bg-white/50', 'w-2');
                }
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        function goToSlide(index) {
            currentSlide = index;
            showSlide(currentSlide);
        }

        function toggleFavorite(button) {
            const svg = button.querySelector('svg');
            if (svg.classList.contains('fill-red-500')) {
                svg.classList.remove('fill-red-500', 'text-red-500');
                svg.classList.add('text-gray-600');
                svg.setAttribute('fill', 'none');
            } else {
                svg.classList.remove('text-gray-600');
                svg.classList.add('fill-red-500', 'text-red-500');
                svg.setAttribute('fill', 'currentColor');
            }
        }

        function quickView(button) {
            // Get the product card (parent element with data-product-code)
            const productCard = button.closest('[data-product-code]');
            if (productCard) {
                const productCode = productCard.getAttribute('data-product-code');
                // Navigate to product detail page with product code
                window.location.href = `product-detail.html?code=${productCode}`;
            }
        }

        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartCount').textContent = totalItems;
        }

        // Update cart count on page load
        updateCartCount();

        // Auto-rotate carousel
        setInterval(nextSlide, 5000);

        // Newsletter subscription function
        async function subscribeNewsletter() {
            const emailInput = document.getElementById('newsletterEmail');
            const subscribeBtn = document.getElementById('subscribeBtn');
            const messageDiv = document.getElementById('subscribeMessage');
            const email = emailInput.value.trim();

            // Validate email
            if (!email) {
                messageDiv.innerHTML = '<p class="text-red-400 text-sm">Please enter your email address</p>';
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageDiv.innerHTML = '<p class="text-red-400 text-sm">Please enter a valid email address</p>';
                return;
            }

            // Disable button and show loading state
            subscribeBtn.disabled = true;
            subscribeBtn.textContent = 'Subscribing...';
            messageDiv.innerHTML = '';

            try {
                // Send subscription request to server
                const response = await fetch('/api/subscribe-newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.success) {
                    messageDiv.innerHTML = '<p class="text-green-400 text-sm font-semibold">✓ Thank you for subscribing! Check your email for confirmation.</p>';
                    emailInput.value = '';
                } else {
                    messageDiv.innerHTML = `<p class="text-red-400 text-sm">${data.message || 'Failed to subscribe. Please try again.'}</p>`;
                }
            } catch (error) {
                console.error('Error subscribing:', error);
                messageDiv.innerHTML = '<p class="text-red-400 text-sm">Network error. Please try again later.</p>';
            } finally {
                // Re-enable button
                subscribeBtn.disabled = false;
                subscribeBtn.textContent = 'Subscribe';
            }
        }