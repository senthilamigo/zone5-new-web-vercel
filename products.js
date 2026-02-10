let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 48;

/* ===========================
   LOAD PRODUCTS
=========================== */
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        allProducts = await response.json();
        filteredProducts = [...allProducts];

        renderProducts();
        return true;

    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productGrid').innerHTML = `
            <div class="col-span-full text-center py-8">
                <h3 class="text-lg font-semibold text-gray-700 mb-1">
                    Unable to Load Products
                </h3>
                <p class="text-sm text-gray-500">
                    Please make sure the products.json file exists.
                </p>
            </div>
        `;
    }
}

/* ===========================
   APPLY CATEGORY FROM URL
=========================== */
function applyCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get("category");

    if (categoryFromURL) {
        const categorySelect = document.getElementById("categoryFilter");
        categorySelect.value = categoryFromURL;

        // Auto-check available by default
        document.getElementById('availableCheck').checked = true;

        applyFilters();

        // Optional: change page title dynamically
        const pageTitle = document.querySelector("h1");
        if (pageTitle) {
            pageTitle.textContent = categoryFromURL;
        }
    }
}

/* ===========================
   RENDER PRODUCTS
=========================== */
function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    productGrid.innerHTML = productsToShow.map(product => `
        <div class="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div class="relative overflow-hidden h-72 lg:h-72 bg-gray-100">
                <a href="product-detail.html?code=${product.productcode}">
                    <img src="${product.image}" alt="${product.name}"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </a>

                ${product.status === 'Sold out' ? `
                    <div class="absolute inset-0 sold-out-overlay flex items-center justify-center">
                        <span class="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg">SOLD OUT</span>
                    </div>
                ` : ''}

                <button onclick="toggleFavorite(this)"
                    class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition z-10">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>

            <div class="p-4">
                <div class="text-xs text-gray-500 mb-1">${product.category} / ${product.subcategory}</div>
                <a href="product-detail.html?code=${product.productcode}">
                    <h3 class="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] hover:text-yellow-600 transition">
                        ${product.name}
                    </h3>
                </a>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-yellow-600">
                        ₹${product.price.toLocaleString('en-IN')}
                    </span>
                    <span class="text-xs px-2 py-1 rounded-full 
                        ${product.status === 'Available' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'}">
                        ${product.status === 'Available' ? 'In Stock' : 'Sold out'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('productCount').textContent = filteredProducts.length;
    renderPagination();
}

/* ===========================
   PAGINATION
=========================== */
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    if (currentPage > 1) {
        html += `<button onclick="changePage(${currentPage - 1})"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
            Previous
        </button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="changePage(${i})"
            class="px-4 py-2 border rounded-lg transition 
            ${i === currentPage 
                ? 'bg-yellow-600 text-white border-yellow-600' 
                : 'border-gray-300 hover:bg-gray-100'}">
            ${i}
        </button>`;
    }

    if (currentPage < totalPages) {
        html += `<button onclick="changePage(${currentPage + 1})"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
            Next
        </button>`;
    }

    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===========================
   FILTERS
=========================== */
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const subcategory = document.getElementById('subcategoryFilter').value;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    let showAvailable = document.getElementById('availableCheck').checked;
    let showSoldOut = document.getElementById('soldOutCheck').checked;
    const sortBy = document.getElementById('sortFilter').value;

    if (!showAvailable && !showSoldOut) {
        showAvailable = true;
        showSoldOut = true;
    }

    filteredProducts = allProducts.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(search)));

        const matchesCategory = !category || product.category === category;
        const matchesSubcategory = !subcategory || product.subcategory === subcategory;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        const matchesStatus =
            (showAvailable && product.status === 'Available') ||
            (showSoldOut && product.status === 'Sold out');

        return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice && matchesStatus;
    });

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
    document.getElementById('availableCheck').checked = false;
    document.getElementById('soldOutCheck').checked = false;
    document.getElementById('sortFilter').value = 'default';

    filteredProducts = [...allProducts];
    currentPage = 1;
    renderProducts();
}

/* ===========================
   FAVORITE
=========================== */
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

/* ===========================
   CART COUNT
=========================== */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

updateCartCount();

/* ===========================
   EVENT LISTENERS
=========================== */
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('subcategoryFilter').addEventListener('change', applyFilters);
document.getElementById('sortFilter').addEventListener('change', applyFilters);

/* ===========================
   INIT
=========================== */
loadProducts().then(() => {
    applyCategoryFromURL();
});
