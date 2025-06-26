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