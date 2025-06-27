document.addEventListener('DOMContentLoaded', function() {
    // Product Gallery Functionality
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-product-image');
    const mainVideo = document.getElementById('main-product-video');
    const colorSelect = document.getElementById('color');
    let currentColor = 'black'; // Default color
    
    // Define image paths for different colors
    const imagePaths = {
        black: {
            'image1': 'images/Wrap.webp',
            'image2': 'images/WrapBag.webp',
            'image3': 'images/WrapRolled.webp',
            'image4': 'images/Wraps.webp',
            'video': 'images/HowTheyWork.mp4',
            'videoCover': 'images/HowTheyWorkCover.png'
        },
        teal: {
            'image1': 'images/WrapTeal.webp',
            'image2': 'images/WrapBagTeal.webp',
            'image3': 'images/WrapRolledTeal.webp',
            'image4': 'images/Wraps.webp',
            'video': 'images/HowTheyWork.mp4',
            'videoCover': 'images/HowTheyWorkCover.png'
        }
    };

    // Function to update gallery based on selected color
    function updateGallery(color) {
        // Update all image thumbnails by their data-image-id
        const imageElements = document.querySelectorAll('.thumbnail[data-type="image"]');
        
        imageElements.forEach(element => {
            const imageId = element.getAttribute('data-image-id');
            if (imageId && imagePaths[color][imageId] && (imagePaths['black'][imageId] != imagePaths['teal'][imageId])) {
                element.setAttribute('data-src', imagePaths[color][imageId]);
                element.querySelector('img').src = imagePaths[color][imageId];
            }
        });
        
        // Update video thumbnail
        const videoThumbnail = document.querySelector('.thumbnail[data-type="video"]');
        videoThumbnail.querySelector('img').src = imagePaths[color].videoCover;
        
        // Update main image to match the active thumbnail
        const activeThumbnail = document.querySelector('.thumbnail.active');
        if (activeThumbnail) {
            const mediaType = activeThumbnail.getAttribute('data-type');
            
            if (mediaType === 'image') {
                // Add transition effect
                mainImage.classList.add('color-transition');
                thumbnails.forEach(thumb => {
                    thumb.querySelector('img').classList.add('color-transition');
                });
                
                mainImage.src = activeThumbnail.getAttribute('data-src');
                mainImage.style.display = 'block';
                mainVideo.style.display = 'none';
                
                // Remove transition class after animation completes
                setTimeout(() => {
                    mainImage.classList.remove('color-transition');
                    thumbnails.forEach(thumb => {
                        thumb.querySelector('img').classList.remove('color-transition');
                    });
                }, 500);
            }
        }
    }
    
    // Add event listener to color selector
    colorSelect.addEventListener('change', function() {
        currentColor = this.value;
        updateGallery(currentColor);
    });
    
    // Handle thumbnail clicks
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            const mediaType = this.getAttribute('data-type');
            const mediaSrc = this.getAttribute('data-src');
            
            if (mediaType === 'image') {
                // Show image, hide video
                mainImage.src = mediaSrc;
                mainImage.style.display = 'block';
                mainVideo.style.display = 'none';
                mainVideo.pause(); // Pause any playing video
            } else if (mediaType === 'video') {
                // Show video, hide image
                mainVideo.querySelector('source').src = mediaSrc;
                mainVideo.load(); // Important to reload the video with new source
                mainImage.style.display = 'none';
                mainVideo.style.display = 'block';
            }
        });
    });
});
