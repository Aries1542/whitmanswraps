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

// Touch/swipe functionality for mobile
let startX = 0;
let endX = 0;

document.addEventListener('touchstart', function(e) {
    startX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    endX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - next slide
            changeSlide(1);
        } else {
            // Swiped right - previous slide
            changeSlide(-1);
        }
    }
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Add mobile navigation toggle functionality
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-nav-toggle';
    mobileToggle.innerHTML = '<span></span><span></span><span></span>';
    
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    
    nav.insertBefore(mobileToggle, navLinks);
    
    mobileToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Toggle hamburger/X icon
        const spans = this.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when clicking outside or when a menu item is clicked
    document.addEventListener('click', function(event) {
        if ((navLinks.classList.contains('active') && 
            !navLinks.contains(event.target) && 
            !mobileToggle.contains(event.target)) || 
            event.target.closest('.nav-links a')) {
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Reset hamburger icon
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when window is resized to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Reset hamburger icon
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});