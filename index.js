let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');
const dots = document.querySelectorAll('.carousel-dot');

const featuredProdImage1 = "https://raw.githubusercontent.com/senthilamigo/zone5-shop-web/refs/heads/main/images/S0173.jpeg";
const featuredProdImage2 = "https://raw.githubusercontent.com/senthilamigo/zone5-shop-web/refs/heads/main/images/S0176.jpeg";
const featuredProdImage3 = "https://raw.githubusercontent.com/senthilamigo/zone5-shop-web/refs/heads/main/images/C0023.jpeg";
const featuredProdImage4 = "https://raw.githubusercontent.com/senthilamigo/zone5-shop-web/refs/heads/main/images/C0029.jpeg";

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

// Auto-rotate carousel
setInterval(nextSlide, 5000);

// Find the element by its ID and set its href attribute
document.getElementById('featuredProdImgLink1').href = featuredProdImage1;
document.getElementById('featuredProdImgLink2').href = featuredProdImage2;
document.getElementById('featuredProdImgLink3').href = featuredProdImage3;
document.getElementById('featuredProdImgLink4').href = featuredProdImage4;
