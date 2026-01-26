        let allProducts = [];
        let filteredProducts = [];
        let currentPage = 1;
        const productsPerPage = 9;

        // Load products from JSON file
        async function loadProducts() {
            try {
                const response = await fetch('data/products.json');
                if (!response.ok) {
                    throw new Error('Failed to load products');
                }
                allProducts = await response.json();
                filteredProducts = [...allProducts];
                renderProducts();
            } catch (error) {
                console.error('Error loading products:', error);
                document.getElementById('productGrid').innerHTML = `
                <div class="col-span-full text-center py-8">
    <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>

    <h3 class="text-lg font-semibold text-gray-700 mb-1">
        Unable to Load Products
    </h3>

    <p class="text-sm text-gray-500">
        Please make sure the products.json file exists in the data folder.
    </p>
</div>

                `;
            }
        }

        function renderProducts() {
            const productGrid = document.getElementById('productGrid');
            const startIndex = (currentPage - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            const productsToShow = filteredProducts.slice(startIndex, endIndex);

            productGrid.innerHTML = productsToShow.map(product => `
                <div class="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div class="relative overflow-hidden h-64 lg:h-48 bg-gray-100">

                        <a href="product-detail.html?code=${product.productcode}">
                            <img src="${product.image}" alt="${product.name}"
     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">

                        </a>
                        ${product.status === 'SoldOut' ? `
                            <div class="absolute inset-0 sold-out-overlay flex items-center justify-center">
                                <span class="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg">SOLD OUT</span>
                            </div>
                        ` : ''}
                        <button onclick="toggleFavorite(this, '${product.productcode}')" class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition z-10">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                        ${product.status === 'Available' ? `
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href="product-detail.html?code=${product.productcode}" class="block w-full bg-white text-gray-900 py-2 rounded-full font-semibold hover:bg-gray-100 transition text-center">Quick View</a>
                            </div>
                        ` : ''}
                    </div>
                    <div class="p-4">
                        <div class="text-xs text-gray-500 mb-1">${product.category} / ${product.subcategory}</div>
                        <a href="product-detail.html?code=${product.productcode}">
                            <h3 class="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] hover:text-yellow-600 transition">${product.name}</h3>
                        </a>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xl font-bold text-yellow-600">₹${product.price.toLocaleString('en-IN')}</span>
                            <span class="text-xs px-2 py-1 rounded-full ${product.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${product.status === 'Available' ? 'In Stock' : 'Sold Out'}</span>
                        </div>
                        <div class="mt-3">
                            ${product.tags && product.tags.length > 0 ? `
                                <div class="flex flex-wrap gap-1">
                                    ${product.tags.slice(0, 3).map(tag => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            document.getElementById('productCount').textContent = filteredProducts.length;
            renderPagination();
        }

        function renderPagination() {
            const pagination = document.getElementById('pagination');
            const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
            
            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }

            let html = '';
            
            if (currentPage > 1) {
                html += `<button onclick="changePage(${currentPage - 1})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">Previous</button>`;
            }

            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    html += `<button onclick="changePage(${i})" class="px-4 py-2 border rounded-lg transition ${i === currentPage ? 'bg-yellow-600 text-white border-yellow-600' : 'border-gray-300 hover:bg-gray-100'}">${i}</button>`;
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                    html += `<span class="px-2">...</span>`;
                }
            }

            if (currentPage < totalPages) {
                html += `<button onclick="changePage(${currentPage + 1})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">Next</button>`;
            }

            pagination.innerHTML = html;
        }

        function changePage(page) {
            currentPage = page;
            renderProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function applyFilters() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            const category = document.getElementById('categoryFilter').value;
            const subcategory = document.getElementById('subcategoryFilter').value;
            const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
            const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
            const showAvailable = document.getElementById('availableCheck').checked;
            const showSoldOut = document.getElementById('soldOutCheck').checked;
            const sortBy = document.getElementById('sortFilter').value;

            filteredProducts = allProducts.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(search) || 
                                    (product.tags && product.tags.some(tag => tag.toLowerCase().includes(search)));
                const matchesCategory = !category || product.category === category;
                const matchesSubcategory = !subcategory || product.subcategory === subcategory;
                const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
                const matchesStatus = (showAvailable && product.status === 'Available') || 
                                    (showSoldOut && product.status === 'SoldOut');

                return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice && matchesStatus;
            });

            // Apply sorting
            if (sortBy === 'price-low') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'price-high') {
                filteredProducts.sort((a, b) => b.price - a.price);
            } else if (sortBy === 'name-az') {
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'name-za') {
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            }

            currentPage = 1;
            renderProducts();
        }

        function resetFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('subcategoryFilter').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('availableCheck').checked = true;
            document.getElementById('soldOutCheck').checked = false;
            document.getElementById('sortFilter').value = 'default';
            
            filteredProducts = [...allProducts];
            currentPage = 1;
            renderProducts();
        }

        function toggleFavorite(button, productCode) {
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

        // Event listeners for real-time filtering
        document.getElementById('searchInput').addEventListener('input', applyFilters);
        document.getElementById('categoryFilter').addEventListener('change', applyFilters);
        document.getElementById('subcategoryFilter').addEventListener('change', applyFilters);
        document.getElementById('sortFilter').addEventListener('change', applyFilters);

        // Initialize products on page load
        loadProducts();
  
