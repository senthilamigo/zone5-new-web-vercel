let currentProduct = null;
let allProducts = [];
let quantity = 1;
let currentImageIndex = 0;

// Get product code from URL
const urlParams = new URLSearchParams(window.location.search);
const productCode = urlParams.get('code');

/* ===========================
   LOAD PRODUCT
=========================== */

async function loadProductDetail() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Failed to load products');

        allProducts = await response.json();
        currentProduct = allProducts.find(p => p.productcode === productCode);

        if (currentProduct) {
            renderProductDetail();
            renderRelatedProducts();
        } else {
            showError();
        }

    } catch (error) {
        console.error('Error loading product:', error);
        showError();
    }
}

/* ===========================
   RENDER PRODUCT
=========================== */

function renderProductDetail() {

    const productDetail = document.getElementById('productDetail');

    document.getElementById('breadcrumbCategory').textContent = currentProduct.category;
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
    document.getElementById('productFullDescription').textContent = currentProduct.description;

    const productImages = currentProduct.images?.length
        ? currentProduct.images
        : [currentProduct.image];

    const validImages = productImages.filter(Boolean);

    const thumbnailsHTML = validImages.map((image, index) => `
        <button onclick="changeMainImage('${image}', ${index})"
            class="relative block w-24 h-24 flex-shrink-0">

            <img src="${image}"
                class="w-full h-full object-cover rounded-lg border-2
                ${index === 0 ? 'border-yellow-600' : 'border-gray-200'}">
        </button>
    `).join('');

    /* ===========================
       DISCOUNT CALCULATION
    =========================== */

    let discountPercent = null;

    if (currentProduct.discountedprice && currentProduct.price) {

        discountPercent = Math.round(
            ((currentProduct.price - currentProduct.discountedprice) /
                currentProduct.price) * 100
        );
    }

    /* ===========================
       HTML
    =========================== */

    productDetail.innerHTML = `

    <!-- IMAGES -->
    <div>

        <div class="relative bg-white rounded-lg overflow-hidden shadow-lg mb-4">

            <img id="mainImage"
                src="${validImages[0]}"
                class="w-full h-auto object-cover">

            ${discountPercent ? `
                <div class="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
                    ${discountPercent}% OFF
                </div>
            ` : ``}

        </div>

        <div class="flex flex-wrap gap-2" id="thumbnailContainer">
            ${thumbnailsHTML}
        </div>

    </div>


    <!-- PRODUCT INFO -->
    <div>

        <div class="bg-white rounded-lg shadow-sm p-8">

            <span class="text-sm text-gray-500">
                ${currentProduct.category} / ${currentProduct.subcategory}
            </span>

            <h1 class="text-3xl font-bold mt-3 mb-4">
                ${currentProduct.name}
            </h1>

            <div class="mb-4 text-sm">
                Product Code:
                <span class="font-semibold">${currentProduct.productcode}</span>
            </div>


            <!-- PRICE -->
            <div class="flex items-center gap-4 mb-6">

                ${currentProduct.discountedprice ? `

                    <span class="text-4xl font-bold text-red-600">
                        ₹${currentProduct.discountedprice.toLocaleString('en-IN')}
                    </span>

                    <span class="text-xl text-gray-400 line-through">
                        ₹${currentProduct.price.toLocaleString('en-IN')}
                    </span>

                    <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                        ${discountPercent}% OFF
                    </span>

                ` : `

                    <span class="text-4xl font-bold text-yellow-600">
                        ₹${currentProduct.price.toLocaleString('en-IN')}
                    </span>

                `}

                <span class="px-4 py-2 rounded-full text-sm font-semibold
                    ${currentProduct.status === 'Available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}">

                    ${currentProduct.status === 'Available'
                        ? '✓ In Stock'
                        : '✗ Sold Out'}
                </span>

            </div>


            <!-- TAGS -->
            ${currentProduct.tags?.length ? `
            <div class="flex flex-wrap gap-2 mb-6">
                ${currentProduct.tags.map(tag =>
                    `<span class="bg-gray-100 px-3 py-1 rounded-full text-sm">${tag}</span>`
                ).join('')}
            </div>
            ` : ''}


            <p class="text-gray-700 mb-6">
                ${currentProduct.description}
            </p>


            <!-- QUANTITY -->
            <div class="mb-6">

                <label class="block text-sm font-semibold mb-2">
                    Quantity
                </label>

                <div class="flex items-center gap-4">

                    <button onclick="decreaseQuantity()"
                        class="w-10 h-10 border rounded-lg">
                        -
                    </button>

                    <span id="quantityDisplay" class="text-xl font-semibold w-12 text-center">
                        1
                    </span>

                    <button onclick="increaseQuantity()"
                        class="w-10 h-10 border rounded-lg">
                        +
                    </button>

                </div>

            </div>


            <!-- ACTION BUTTONS -->
            <div class="flex gap-4 mb-6">

                ${currentProduct.status === 'Available' ? `

                    <button onclick="addToCart()"
                        class="flex-1 bg-yellow-600 text-white py-4 rounded-lg font-semibold hover:bg-yellow-700">

                        Add to Cart
                    </button>

                    <a id="whatsappBtn"
                        target="_blank"
                        class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">

                        WhatsApp
                    </a>

                ` : `

                    <button disabled
                        class="flex-1 bg-gray-300 text-gray-500 py-4 rounded-lg">
                        Out of Stock
                    </button>

                `}

            </div>

        </div>

    </div>
    `;

    setupWhatsApp(currentProduct.name);
}

/* ===========================
   RELATED PRODUCTS
=========================== */

function renderRelatedProducts() {

    const relatedProducts = allProducts
        .filter(p =>
            p.category === currentProduct.category &&
            p.productcode !== currentProduct.productcode
        )
        .slice(0, 4);

    const container = document.getElementById('relatedProducts');

    container.innerHTML = relatedProducts.map(product => {

        const productImage =
            product.images?.length ? product.images[0] : product.image;

        const price = product.discountedprice
            ? product.discountedprice
            : product.price;

        return `
        <a href="product-detail.html?code=${product.productcode}"
            class="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl">

            <div class="aspect-[4/5] bg-gray-100 overflow-hidden">

                <img src="${productImage}"
                    class="w-full h-full object-cover group-hover:scale-110 transition">

            </div>

            <div class="p-4">

                <div class="text-xs text-gray-500 mb-1">
                    ${product.subcategory}
                </div>

                <h3 class="font-semibold mb-2">
                    ${product.name}
                </h3>

                <span class="text-lg font-bold text-yellow-600">
                    "  "
                </span>

            </div>

        </a>
        `;

    }).join('');
}

/* ===========================
   IMAGE SWITCH
=========================== */

function changeMainImage(imageSrc) {
    document.getElementById('mainImage').src = imageSrc;
}

/* ===========================
   QUANTITY
=========================== */

function increaseQuantity() {
    quantity++;
    document.getElementById('quantityDisplay').textContent = quantity;
}

function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
        document.getElementById('quantityDisplay').textContent = quantity;
    }
}

/* ===========================
   ADD TO CART
=========================== */

function addToCart() {

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find(
        item => item.productcode === currentProduct.productcode
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...currentProduct,
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount();
}

/* ===========================
   CART COUNT
=========================== */

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    document.getElementById('cartCount').textContent = totalItems;
}

/* ===========================
   WHATSAPP
=========================== */

function setupWhatsApp(productName) {

    const phoneNumber = "919940656889";

    const message =
        `Hi, I am interested in ${productName}`;

    const link =
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    document.getElementById("whatsappBtn").href = link;
}

/* ===========================
   ERROR
=========================== */

function showError() {

    const productDetail = document.getElementById('productDetail');

    productDetail.innerHTML = `
        <div class="text-center py-12">

            <h3 class="text-xl font-semibold mb-4">
                Product Not Found
            </h3>

            <a href="products.html"
                class="bg-yellow-600 text-white px-6 py-3 rounded-lg">

                Browse Products

            </a>

        </div>
    `;
}

/* ===========================
   INIT
=========================== */

updateCartCount();
loadProductDetail();
