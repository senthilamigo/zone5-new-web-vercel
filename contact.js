        // Configuration - Update this with your actual API endpoint
        const API_ENDPOINT = 'https://zone5-web-backend-vercel.vercel.app';
        // For production, use: 'https://yourdomain.com/api/send-contact-email'

        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = count;
            }
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

        // Wait for DOM to be fully loaded before adding event listeners
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded - Initializing contact form...');
            console.log('API Endpoint:', API_ENDPOINT);
            
            // Initialize cart count
            updateCartCount();
            
            // Get form element
            const contactForm = document.getElementById('contactForm');
            
            if (!contactForm) {
                console.error('Contact form not found!');
                return;
            }
            
            console.log('Contact form found, adding event listener...');
            
            // Add submit event listener
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Form submitted!');
                
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
                
                console.log('Form data:', formData);
                
                // Disable button and show loading state
                submitButton.disabled = true;
                buttonText.textContent = 'Sending...';
                
                try {
                    console.log('Sending request to:', API_ENDPOINT);
                    
                    const response = await fetch(API_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    console.log('Response status:', response.status);
                    
                    const data = await response.json();
                    console.log('Response data:', data);
                    
                    if (response.ok && data.success) {
                        // Show success modal
                        console.log('Success! Showing modal...');
                        document.getElementById('successModal').classList.remove('hidden');
                        
                        // Reset form
                        contactForm.reset();
                    } else {
                        // Show error modal
                        console.error('Error response:', data);
                        document.getElementById('errorMessage').textContent = 
                            data.message || 'Failed to send message. Please try again.';
                        document.getElementById('errorModal').classList.remove('hidden');
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                    document.getElementById('errorMessage').textContent = 
                        'Network error. Please check your connection and try again.';
                    document.getElementById('errorModal').classList.remove('hidden');
                } finally {
                    // Re-enable button
                    submitButton.disabled = false;
                    buttonText.textContent = originalText;
                }
            });
            
            console.log('Contact form event listener attached successfully!');
        });