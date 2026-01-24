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