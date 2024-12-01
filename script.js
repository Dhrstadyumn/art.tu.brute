document.addEventListener('DOMContentLoaded', () => {
    // Populate profile information
    document.getElementById('fullName').textContent = profileInfo['Full Name'];
    document.getElementById('username').textContent = '@' + profileInfo['Username'];
    document.getElementById('bio').textContent = profileInfo['Biography'];
    document.getElementById('posts-count').textContent = profileInfo['Posts'];
    document.getElementById('followers-count').textContent = profileInfo['Followers'];
    document.getElementById('following-count').textContent = profileInfo['Following'];
    
    const externalLink = document.getElementById('external-link');
    if (profileInfo['External URL']) {
        externalLink.href = profileInfo['External URL'];
    } else {
        externalLink.style.display = 'none';
    }

    // Initialize gallery
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalContainer = document.getElementById('modal-content');
    const modalCaption = document.getElementById('modal-caption');
    const modalHashtags = document.getElementById('modal-hashtags');
    const modalDate = document.getElementById('modal-date');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let currentCarouselIndex = 0;
    let currentPost = null;
    
    function createGalleryItem(post) {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        
        const firstMedia = post.image_paths[0];
        
        if (firstMedia.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = 'posts/' + firstMedia;
            video.controls = true;
            div.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = 'posts/' + firstMedia;
            img.alt = post.caption;
            div.appendChild(img);
        }
        
        // Add carousel indicator if multiple images
        if (post.image_paths.length > 1) {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            indicator.textContent = `${post.image_paths.length} images`;
            div.appendChild(indicator);
        }
        
        div.addEventListener('click', () => showModal(post));
        return div;
    }
    
    function createModalContent(mediaPath) {
        if (mediaPath.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = 'posts/' + mediaPath;
            video.controls = true;
            return video;
        } else {
            const img = document.createElement('img');
            img.src = 'posts/' + mediaPath;
            img.alt = currentPost.caption;
            return img;
        }
    }
    
    function updateModalContent() {
        // Clear previous content
        while (modalContainer.firstChild) {
            if (modalContainer.firstChild.tagName === 'VIDEO') {
                modalContainer.firstChild.pause();
            }
            modalContainer.firstChild.remove();
        }
        
        // Add new content
        const mediaElement = createModalContent(currentPost.image_paths[currentCarouselIndex]);
        modalContainer.appendChild(mediaElement);
        
        // Update carousel navigation
        if (currentPost.image_paths.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
            prevBtn.disabled = currentCarouselIndex === 0;
            nextBtn.disabled = currentCarouselIndex === currentPost.image_paths.length - 1;
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }
    
    function showModal(post) {
        currentPost = post;
        currentCarouselIndex = 0;
        
        modalCaption.textContent = post.caption;
        modalHashtags.innerHTML = post.hashtags
            .map(tag => `<span class="hashtag">${tag}</span>`)
            .join('');
        modalDate.textContent = new Date(post.date).toLocaleDateString();
        
        updateModalContent();
        modal.style.display = 'block';
    }
    
    // Carousel navigation
    prevBtn.addEventListener('click', () => {
        if (currentCarouselIndex > 0) {
            currentCarouselIndex--;
            updateModalContent();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentCarouselIndex < currentPost.image_paths.length - 1) {
            currentCarouselIndex++;
            updateModalContent();
        }
    });
    
    closeBtn.addEventListener('click', () => {
        const videoElement = modalContainer.querySelector('video');
        if (videoElement) {
            videoElement.pause();
        }
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            const videoElement = modalContainer.querySelector('video');
            if (videoElement) {
                videoElement.pause();
            }
            modal.style.display = 'none';
        }
    });
    
    // Search and sort functionality
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    
    function filterAndSortPosts() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortOrder = sortSelect.value;
        
        const filteredPosts = posts.filter(post => {
            const caption = post.caption.toLowerCase();
            const hashtags = post.hashtags.join(' ').toLowerCase();
            return caption.includes(searchTerm) || hashtags.includes(searchTerm);
        });
        
        const sortedPosts = [...filteredPosts].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        
        gallery.innerHTML = '';
        sortedPosts.forEach(post => {
            gallery.appendChild(createGalleryItem(post));
        });
    }
    
    searchInput.addEventListener('input', filterAndSortPosts);
    sortSelect.addEventListener('change', filterAndSortPosts);
    
    // Initial load
    filterAndSortPosts();
});
