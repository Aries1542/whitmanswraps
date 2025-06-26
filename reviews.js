// Reviews Carousel Functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    showSlide(currentSlideIndex);
    
    // Auto-advance carousel every 5 seconds
    // setInterval(function() {
    //     changeSlide(1);
    // }, 5000);
});

function changeSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    showSlide(currentSlideIndex);
}

function currentSlide(slideIndex) {
    currentSlideIndex = slideIndex - 1;
    showSlide(currentSlideIndex);
}

function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Remove active class from all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show current slide and activate corresponding dot
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
}