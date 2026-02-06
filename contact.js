        // Configuration - Update this with your actual API endpoint
        const API_ENDPOINT = 'https://zone5-web-backend-vercel.vercel.app';
        // For production, use: 'https://yourdomain.com/api/send-contact-email'

        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartCount').textContent = count;
        }

        function toggleFAQ(button) {
            const content = button.nextElementSibling;
            const icon = button.querySelector('svg');
            
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        }

        function closeModal() {
            document.getElementById('successModal').classList.add('hidden');
        }

        function closeErrorModal() {
            document.getElementById('errorModal').classList.add('hidden');
        }

        // Contact form submission
        document.getElementById('contactForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = document.getElementById('submitButton');
            const buttonText = document.getElementById('buttonText');
            const originalText = buttonText.textContent;
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                submittedAt: new Date().toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            // Disable button and show loading state
            submitButton.disabled = true;
            buttonText.textContent = 'Sending...';
            
            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Show success modal
                    document.getElementById('successModal').classList.remove('hidden');
                    
                    // Reset form
                    document.getElementById('contactForm').reset();
                } else {
                    // Show error modal
                    document.getElementById('errorMessage').textContent = 
                        data.message || 'Failed to send message. Please try again.';
                    document.getElementById('errorModal').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('errorMessage').textContent = 
                    'Network error. Please check your connection and try again.';
                document.getElementById('errorModal').classList.remove('hidden');
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                buttonText.textContent = originalText;
            }
        });

        // Initialize cart count on page load
        updateCartCount();