        let products = [];
        let editingProductCode = null;

        const subcategoryMap = {
            'Saree': ['Festive Sarees', 'Party Wear Sarees', 'Office Wear Sarees', 'Casual Sarees'],
            'Salwar Suit': ['Unstitched Salwar Suits', 'Readymade Salwar Suit']
        };

        // Load products from storage
        async function loadProducts() {
            try {
                // First, try to load from GitHub
                const githubUrl = 'https://raw.githubusercontent.com/senthilamigo/zone5-new-web-vercel/main/data/products.json';
                
                try {
                    const response = await fetch(githubUrl);
                    if (response.ok) {
                        const githubProducts = await response.json();
                        if (Array.isArray(githubProducts) && githubProducts.length > 0) {
                            products = githubProducts;
                            // Save to localStorage for offline access
                            localStorage.setItem('products-data', JSON.stringify(products));
                            console.log('Products loaded from GitHub repository');
                            renderProducts();
                            return;
                        }
                    }
                } catch (githubError) {
                    console.log('Could not load from GitHub, falling back to localStorage:', githubError.message);
                }

                // Fallback to localStorage if GitHub fails
                const stored = localStorage.getItem('products-data');
                if (stored) {
                    products = JSON.parse(stored);
                    console.log('Products loaded from localStorage');
                } else {
                    products = [];
                    console.log('No products found, starting fresh');
                }
            } catch (error) {
                console.error('Error loading products:', error);
                products = [];
            }
            renderProducts();
        }

        // Save products to storage
        function saveProducts() {
            try {
                localStorage.setItem('products-data', JSON.stringify(products));
                return true;
            } catch (error) {
                console.error('Error saving products:', error);
                alert('Failed to save products. Please try again.');
                return false;
            }
        }

        // Export products to JSON file
        function exportProducts() {
            const dataStr = JSON.stringify(products, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'products.json';
            link.click();
            URL.revokeObjectURL(url);
        }

        // Import products from JSON file
        function importProducts(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const imported = JSON.parse(e.target.result);
                        if (Array.isArray(imported)) {
                            products = imported;
                            saveProducts();
                            renderProducts();
                            alert('Products imported successfully!');
                        } else {
                            alert('Invalid JSON format. Expected an array of products.');
                        }
                    } catch (error) {
                        alert('Error reading file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        }

        // Sync from GitHub - Manual refresh
        async function syncFromGitHub() {
            const button = event.target.closest('button');
            const originalHTML = button.innerHTML;
            
            try {
                button.disabled = true;
                button.innerHTML = `
                    <span class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Syncing...
                    </span>
                `;

                const githubUrl = 'https://raw.githubusercontent.com/senthilamigo/zone5-new-web-vercel/main/data/products.json';
                const response = await fetch(githubUrl, { cache: 'no-store' });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch from GitHub');
                }

                const githubProducts = await response.json();
                
                if (!Array.isArray(githubProducts)) {
                    throw new Error('Invalid data format from GitHub');
                }

                products = githubProducts;
                localStorage.setItem('products-data', JSON.stringify(products));
                renderProducts();
                
                button.disabled = false;
                button.innerHTML = originalHTML;
                
                alert(`✅ Successfully synced ${products.length} products from GitHub!`);
            } catch (error) {
                console.error('Error syncing from GitHub:', error);
                button.disabled = false;
                button.innerHTML = originalHTML;
                alert(`❌ Failed to sync from GitHub:\n\n${error.message}\n\nPlease check:\n1. The repository is accessible\n2. The products.json file exists in the main branch\n3. Your internet connection`);
            }
        }

        // Upload image to GitHub
        async function uploadImage(event, imageNumber) {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const statusDiv = document.getElementById('uploadStatus');
            const imageInput = document.getElementById(`image${imageNumber}`);
            const previewDiv = document.getElementById(`imagePreview${imageNumber}`);
            const previewImg = document.getElementById(`previewImg${imageNumber}`);

            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewDiv.classList.remove('hidden');
            };
            reader.readAsDataURL(file);

            // Get GitHub token
            let githubToken = localStorage.getItem('github_token');
            if (!githubToken) {
                githubToken = prompt('Enter your GitHub Personal Access Token:\n\n(This will be saved for future uploads)\n\nYou can create one at: https://github.com/settings/tokens\nRequired permissions: repo');
                
                if (!githubToken) {
                    statusDiv.innerHTML = '<span class="text-red-600">❌ GitHub token is required to upload images</span>';
                    statusDiv.classList.remove('hidden');
                    return;
                }
                
                // Save token for future use
                localStorage.setItem('github_token', githubToken);
            }

            try {
                statusDiv.innerHTML = `<span class="text-blue-600">⏳ Uploading image ${imageNumber} to GitHub...</span>`;
                statusDiv.classList.remove('hidden');

                // Generate filename with timestamp to avoid conflicts
                const timestamp = Date.now();
                const extension = file.name.split('.').pop();
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
                const filename = `${sanitizedName}_${timestamp}.${extension}`;

                const owner = 'senthilamigo';
                const repo = 'zone5-new-web-vercel';
                const branch = 'main';
                const path = `images/${filename}`;

                // Convert file to base64
                const fileReader = new FileReader();
                fileReader.onload = async function(e) {
                    try {
                        const base64Content = e.target.result.split(',')[1];

                        // Upload to GitHub
                        const uploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `token ${githubToken}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: `Upload product image: ${filename}`,
                                content: base64Content,
                                branch: branch
                            })
                        });

                        if (!uploadResponse.ok) {
                            const error = await uploadResponse.json();
                            if (uploadResponse.status === 401) {
                                // Invalid token, clear it
                                localStorage.removeItem('github_token');
                                throw new Error('Invalid GitHub token. Please try again with a valid token.');
                            }
                            throw new Error(error.message || 'Failed to upload image');
                        }

                        const result = await uploadResponse.json();
                        
                        // Set the image URL in the input field
                        const imageUrl = `https://raw.githubusercontent.com/senthilamigo/zone5-new-web-vercel/refs/heads/main/images/${filename}`;
                        imageInput.value = imageUrl;

                        statusDiv.innerHTML = `<span class="text-green-600">✅ Image ${imageNumber} uploaded successfully!</span>`;
                        
                        // Clear status after 3 seconds
                        setTimeout(() => {
                            statusDiv.classList.add('hidden');
                        }, 3000);

                    } catch (uploadError) {
                        console.error('Error uploading to GitHub:', uploadError);
                        statusDiv.innerHTML = `<span class="text-red-600">❌ Upload failed: ${uploadError.message}</span>`;
                    }
                };
                fileReader.readAsDataURL(file);

            } catch (error) {
                console.error('Error processing image:', error);
                statusDiv.innerHTML = `<span class="text-red-600">❌ Error: ${error.message}</span>`;
            }
        }

        // Clear GitHub token function (can be called from console if needed)
        function clearGitHubToken() {
            localStorage.removeItem('github_token');
            alert('GitHub token cleared. You will be prompted for a new token on next upload.');
        }

        // Update datastore - Push to GitHub
        async function updateDatastore() {
            if (products.length === 0) {
                alert('No products to update. Please add some products first.');
                return;
            }

            const githubToken = prompt('Enter your GitHub Personal Access Token:\n\n(You can create one at: https://github.com/settings/tokens)\nRequired permissions: repo');
            
            if (!githubToken) {
                alert('GitHub token is required to update the datastore.');
                return;
            }

            try {
                // Show loading state
                const button = event.target.closest('button');
                const originalHTML = button.innerHTML;
                button.disabled = true;
                button.innerHTML = `
                    <span class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                    </span>
                `;

                const owner = 'senthilamigo';
                const repo = 'zone5-new-web-vercel';
                const branch = 'main';
                const path = 'data/products.json';
                const content = JSON.stringify(products, null, 2);
                const encodedContent = btoa(unescape(encodeURIComponent(content)));

                // Get current file SHA (required for updating)
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                let sha = null;
                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                }

                // Update or create the file
                const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Update products.json - ${new Date().toLocaleString()}`,
                        content: encodedContent,
                        branch: branch,
                        ...(sha && { sha: sha })
                    })
                });

                button.disabled = false;
                button.innerHTML = originalHTML;

                if (updateResponse.ok) {
                    const result = await updateResponse.json();
                    alert(`✅ Datastore updated successfully!\n\nCommit: ${result.commit.sha.substring(0, 7)}\nView at: ${result.content.html_url}`);
                } else {
                    const error = await updateResponse.json();
                    throw new Error(error.message || 'Failed to update repository');
                }
            } catch (error) {
                console.error('Error updating datastore:', error);
                alert(`❌ Failed to update datastore:\n\n${error.message}\n\nPlease check:\n1. Your GitHub token has 'repo' permissions\n2. You have write access to the repository\n3. The branch 'dev' exists`);
                
                // Reset button state
                const button = event.target.closest('button');
                if (button) {
                    button.disabled = false;
                    button.innerHTML = `
                        <span class="flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Update Datastore
                        </span>
                    `;
                }
            }
        }

        // Render products table
        function renderProducts() {
            const tbody = document.getElementById('productsTableBody');
            const emptyState = document.getElementById('emptyState');
            const searchTerm = document.getElementById('searchProducts').value.toLowerCase();

            const filteredProducts = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.productcode.toLowerCase().includes(searchTerm)
            );

            if (filteredProducts.length === 0) {
                tbody.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            tbody.innerHTML = filteredProducts.map(product => {
                // Get the first image from the images array or fallback to image property
                const primaryImage = Array.isArray(product.images) && product.images.length > 0 
                    ? product.images[0] 
                    : (product.image || '');
                const imageCount = Array.isArray(product.images) ? product.images.length : (product.image ? 1 : 0);
                
                return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="relative">
                            <img src="${primaryImage}" alt="${product.name}" class="w-16 h-20 object-cover rounded">
                            ${imageCount > 1 ? `<span class="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">${imageCount}</span>` : ''}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${product.productcode}</td>
                    <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">${product.name}</td>
                    <td class="px-6 py-4 text-sm text-gray-700">${product.category}<br><span class="text-xs text-gray-500">${product.subcategory}</span></td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">₹${product.price.toLocaleString('en-IN')}</td>
                    <td class="px-6 py-4">
                        <span class="text-xs px-2 py-1 rounded-full ${product.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                            ${product.status}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex gap-2">
                            <button onclick="editProduct('${product.productcode}')" class="text-blue-600 hover:text-blue-800 transition" title="Edit">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="deleteProduct('${product.productcode}')" class="text-red-600 hover:text-red-800 transition" title="Delete">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        // Update subcategories based on selected category
        function updateSubcategories() {
            const category = document.getElementById('category').value;
            const subcategorySelect = document.getElementById('subcategory');
            
            subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
            
            if (category && subcategoryMap[category]) {
                subcategoryMap[category].forEach(sub => {
                    subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
                });
            }
        }

        // Open modal
        function openModal(productCode = null) {
            const modal = document.getElementById('productModal');
            const form = document.getElementById('productForm');
            const modalTitle = document.getElementById('modalTitle');
            const uploadStatus = document.getElementById('uploadStatus');
            
            form.reset();
            uploadStatus.classList.add('hidden');
            
            // Hide all previews
            for (let i = 1; i <= 5; i++) {
                document.getElementById(`imagePreview${i}`).classList.add('hidden');
            }
            
            editingProductCode = productCode;
            
            if (productCode) {
                const product = products.find(p => p.productcode === productCode);
                if (product) {
                    modalTitle.textContent = 'Edit Product';
                    document.getElementById('productcode').value = product.productcode;
                    document.getElementById('productcode').readOnly = true;
                    document.getElementById('name').value = product.name;
                    
                    // Handle multiple images
                    const images = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
                    for (let i = 0; i < 5; i++) {
                        const imageInput = document.getElementById(`image${i + 1}`);
                        const previewDiv = document.getElementById(`imagePreview${i + 1}`);
                        const previewImg = document.getElementById(`previewImg${i + 1}`);
                        
                        if (i < images.length && images[i]) {
                            imageInput.value = images[i];
                            previewImg.src = images[i].startsWith('http') ? images[i] : `https://raw.githubusercontent.com/senthilamigo/zone5-new-web-vercel/main/${images[i]}`;
                            previewDiv.classList.remove('hidden');
                        } else {
                            imageInput.value = '';
                        }
                    }
                    
                    document.getElementById('description').value = product.description;
                    document.getElementById('category').value = product.category;
                    updateSubcategories();
                    document.getElementById('subcategory').value = product.subcategory;
                    document.getElementById('tags').value = product.tags ? product.tags.join(', ') : '';
                    document.getElementById('price').value = product.price;
                    document.getElementById('status').value = product.status;
                }
            } else {
                modalTitle.textContent = 'Add New Product';
                document.getElementById('productcode').readOnly = false;
            }
            
            modal.classList.add('active');
        }

        // Close modal
        function closeModal() {
            const modal = document.getElementById('productModal');
            modal.classList.remove('active');
            editingProductCode = null;
        }

        // Handle form submission
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect all images
            const images = [];
            for (let i = 1; i <= 5; i++) {
                const imageValue = document.getElementById(`image${i}`).value.trim();
                if (imageValue) {
                    images.push(imageValue);
                }
            }
            
            // Validate at least one image
            if (images.length === 0) {
                alert('Please provide at least one product image.');
                return;
            }
            
            const productData = {
                productcode: document.getElementById('productcode').value.trim(),
                name: document.getElementById('name').value.trim(),
                images: images,  // Store as array
                description: document.getElementById('description').value.trim(),
                category: document.getElementById('category').value,
                subcategory: document.getElementById('subcategory').value,
                tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
                price: parseFloat(document.getElementById('price').value),
                status: document.getElementById('status').value
            };

            if (editingProductCode) {
                const index = products.findIndex(p => p.productcode === editingProductCode);
                if (index !== -1) {
                    products[index] = productData;
                }
            } else {
                if (products.some(p => p.productcode === productData.productcode)) {
                    alert('Product code already exists. Please use a unique code.');
                    return;
                }
                products.push(productData);
            }

            const saved = saveProducts();
            if (saved) {
                renderProducts();
                closeModal();
                alert(editingProductCode ? 'Product updated successfully!' : 'Product added successfully!');
            }
        });

        // Edit product
        function editProduct(productCode) {
            openModal(productCode);
        }

        // Delete product
        function deleteProduct(productCode) {
            if (confirm('Are you sure you want to delete this product?')) {
                products = products.filter(p => p.productcode !== productCode);
                const saved = saveProducts();
                if (saved) {
                    renderProducts();
                    alert('Product deleted successfully!');
                }
            }
        }

        // Search products
        document.getElementById('searchProducts').addEventListener('input', renderProducts);

        // Initialize
        loadProducts();