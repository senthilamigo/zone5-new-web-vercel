let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 24;
let selectedTags = [];

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
       allProducts = allProducts.reverse();
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

function applyTagFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tagFromURL = params.get("tag");

    if (tagFromURL) {

        // Add tag to selectedTags array
        if (!selectedTags.includes(tagFromURL)) {
            selectedTags.push(tagFromURL);
        }

        renderSelectedTags();   // show tag chip
        applyFilters();         // filter products
    }
}



/* ===========================
   RENDER PRODUCTS
=========================== */
function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    const endIndex = currentPage * productsPerPage;
    const productsToShow = filteredProducts.slice(0, endIndex);

    productGrid.innerHTML = productsToShow.map(product => `
        <div class="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div class="relative overflow-hidden h-72 bg-gray-100">
                <a href="product-detail.html?code=${product.productcode}">
                    <img src="${Array.isArray(product.images) ? product.images[0] : product.images}"
                        alt="${product.name}"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </a>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-2">
                    ${product.name}
                </h3>
                <span class="text-xl font-bold text-yellow-600">
                    ₹${product.price.toLocaleString('en-IN')}
                </span>
            </div>
        </div>
    `).join('');

    document.getElementById('productCount').textContent = filteredProducts.length;

    // FIX: Only show button if more products exist
    if (endIndex < filteredProducts.length) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }
}

const loadMoreBtn = document.getElementById('loadMoreBtn');

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderProducts();
    });
}


/* ===========================
   PAGINATION
=========================== */

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
    !search || 
    (product.name && product.name.toLowerCase().includes(search));

        const matchesCategory = !category || product.category === category;
        const matchesSubcategory = !subcategory || product.subcategory === subcategory;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        const matchesStatus =
            (showAvailable && product.status === 'Available') ||
            (showSoldOut && product.status === 'Sold out');
        const matchesTags = selectedTags.length === 0 || 
            selectedTags.every(tag => Array.isArray(product.tags) && product.tags.includes(tag));

        return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice && matchesStatus && matchesTags;
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
    document.getElementById('tagInput').value = '';
    selectedTags = [];
    renderSelectedTags();

    filteredProducts = [...allProducts];
    currentPage = 1;
    renderProducts();
}

/* ===========================
   TAG FILTER
=========================== */
function getAllTags() {
    const tagSet = new Set();
    allProducts.forEach(p => {
        if (Array.isArray(p.tags)) p.tags.forEach(t => tagSet.add(t));
    });
    return [...tagSet].sort();
}

function renderSelectedTags() {
    const container = document.getElementById('selectedTags');
    container.innerHTML = selectedTags.map(tag => `
        <span class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            ${tag}
            <button onclick="removeTag('${tag}')" class="hover:text-red-600 transition leading-none">&times;</button>
        </span>
    `).join('');
}

function addTag(tag) {
    if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
        renderSelectedTags();
        applyFilters();
    }
    document.getElementById('tagInput').value = '';
    document.getElementById('tagSuggestions').classList.add('hidden');
}

function removeTag(tag) {
    selectedTags = selectedTags.filter(t => t !== tag);
    renderSelectedTags();
    applyFilters();
}

function initTagInput() {
    const input = document.getElementById('tagInput');
    const suggestions = document.getElementById('tagSuggestions');

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const allTags = getAllTags();

        if (!query) {
            suggestions.classList.add('hidden');
            return;
        }

        const matches = allTags.filter(t => t.toLowerCase().includes(query) && !selectedTags.includes(t));

        if (matches.length === 0) {
            suggestions.classList.add('hidden');
            return;
        }

        suggestions.innerHTML = matches.map(tag => `
            <li onclick="addTag('${tag}')"
                class="px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 cursor-pointer transition">
                ${tag}
            </li>
        `).join('');
        suggestions.classList.remove('hidden');
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const firstMatch = suggestions.querySelector('li');
            if (firstMatch) firstMatch.click();
        }
        if (e.key === 'Escape') {
            suggestions.classList.add('hidden');
        }
    });

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.classList.add('hidden');
        }
    });
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
    initTagInput();
   applyTagFromURL();
});
