let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 24;
let selectedTags = [];

/* ===========================
   SHUFFLE PRODUCTS
=========================== */

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

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
        // Filter out disabled products
        allProducts = allProducts.filter(p => p.status !== 'Disabled');

        allProducts = shuffleArray(allProducts);

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
        </div>`;
    }
}

/* ===========================
   CATEGORY FROM URL
=========================== */

function applyCategoryFromURL() {

    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get("category");

    if (categoryFromURL) {

        const categorySelect = document.getElementById("categoryFilter");

        if (categorySelect) {
            categorySelect.value = categoryFromURL;
        }

        document.getElementById('availableCheck').checked = true;

        const pageTitle = document.querySelector("h1");

        if (pageTitle) {
            pageTitle.textContent = categoryFromURL;
        }
    }
}

/* ===========================
   TAG FROM URL
=========================== */

function applyTagFromURL() {

    const params = new URLSearchParams(window.location.search);
    const tagFromURL = params.get("tag");

    if (tagFromURL) {

        selectedTags = [tagFromURL];   // do NOT lowercase

        renderSelectedTags();
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

    productGrid.innerHTML = productsToShow.map(product => {

        const image =
            Array.isArray(product.images) && product.images.length
                ? product.images[0]
                : product.image;

        let discountPercent = null;

        if (product.discountedprice && product.price) {

            discountPercent = Math.round(
                ((product.price - product.discountedprice) / product.price) * 100
            );
        }

        return `

        <div class="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">

            <div class="relative overflow-hidden h-72 bg-gray-100">

                <a href="product-detail.html?code=${product.productcode}">

                    <img src="${image}"
                        alt="${product.name}"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">

                </a>

                ${discountPercent ? `
                <div class="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                    ${discountPercent}% OFF
                </div>
                ` : ``}

                ${product.status === 'Sold out' ? `
                <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span class="bg-red-600 text-white px-6 py-2 rounded-full font-bold">
                        SOLD OUT
                    </span>
                </div>
                ` : ``}

            </div>

            <div class="p-4">

                <div class="text-xs text-gray-500 mb-1">
                    ${product.category} / ${product.subcategory}
                </div>

                <a href="product-detail.html?code=${product.productcode}">
                    <h3 class="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] hover:text-yellow-600 transition">
                        ${product.name}
                    </h3>
                </a>

                <div class="flex items-center gap-2 flex-wrap">

                    ${product.discountedprice ? `

                        <span class="text-lg font-bold text-red-600">
                            ₹${product.discountedprice.toLocaleString('en-IN')}
                        </span>

                        <span class="text-sm text-gray-400 line-through">
                            ₹${product.price.toLocaleString('en-IN')}
                        </span>

                    ` : `

                        <span class="text-lg font-bold text-yellow-600">
                            ₹${product.price.toLocaleString('en-IN')}
                        </span>

                    `}

                </div>

            </div>

        </div>

        `;

    }).join('');

    document.getElementById('productCount').textContent = filteredProducts.length;

    if (endIndex < filteredProducts.length) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }
}

/* ===========================
   LOAD MORE
=========================== */

const loadMoreBtn = document.getElementById('loadMoreBtn');

if (loadMoreBtn) {

    loadMoreBtn.addEventListener('click', () => {

        currentPage++;

        renderProducts();
    });
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

           console.log("Selected Tag:", selectedTags);
         console.log("Product Tags:", product.tags);

        const matchesSearch =
            !search || product.name.toLowerCase().includes(search);

        const matchesCategory =
            !category || product.category === category;

        const matchesSubcategory =
            !subcategory || product.subcategory === subcategory;

        const priceToCheck =
            product.discountedprice ? product.discountedprice : product.price;

        const matchesPrice =
            priceToCheck >= minPrice && priceToCheck <= maxPrice;

        const matchesStatus =
            (showAvailable && product.status === 'Available') ||
            (showSoldOut && product.status === 'Sold out');

       const matchesTags =
             selectedTags.length === 0 ||
             (Array.isArray(product.tags) &&
                 product.tags.some(productTag =>
                     selectedTags.some(selectedTag =>
                         productTag.trim().toLowerCase() === selectedTag.trim().toLowerCase()
                     )
                 ));

        return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice && matchesStatus && matchesTags;
    });

    if (sortBy === 'price-low') {
        filteredProducts.sort((a, b) =>
            (a.discountedprice || a.price) - (b.discountedprice || b.price)
        );
    }

    if (sortBy === 'price-high') {
        filteredProducts.sort((a, b) =>
            (b.discountedprice || b.price) - (a.discountedprice || a.price)
        );
    }

    if (sortBy === 'name-az') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === 'name-za') {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    currentPage = 1;

    renderProducts();
}

/* ===========================
   TAG UI
=========================== */

function renderSelectedTags() {

    const container = document.getElementById('selectedTags');

    container.innerHTML = selectedTags.map(tag => `
        <span class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            ${tag}
            <button onclick="removeTag('${tag}')" class="hover:text-red-600">&times;</button>
        </span>
    `).join('');
}

function removeTag(tag) {

    selectedTags = selectedTags.filter(t => t !== tag);

    renderSelectedTags();

    applyFilters();
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

function initTagInput() {

    const input = document.getElementById('tagInput');
    const suggestions = document.getElementById('tagSuggestions');

    if (!input || !suggestions) return;

    input.addEventListener('input', () => {

        const query = input.value.trim().toLowerCase();

        const allTags = getAllTags();

        if (!query) {
            suggestions.classList.add('hidden');
            return;
        }

        const matches = allTags.filter(tag =>
            tag.toLowerCase().includes(query) &&
            !selectedTags.includes(tag)
        );

        if (matches.length === 0) {
            suggestions.classList.add('hidden');
            return;
        }

        suggestions.innerHTML = matches.map(tag => `
            <li onclick="addTag('${tag}')"
            class="px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 cursor-pointer">
                ${tag}
            </li>
        `).join('');

        suggestions.classList.remove('hidden');
    });

    document.addEventListener('click', e => {

        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.classList.add('hidden');
        }

    });

}

/* ===========================
   INIT
=========================== */

loadProducts().then(() => {

    applyTagFromURL();

    applyCategoryFromURL();

    initTagInput();

    applyFilters();
});
