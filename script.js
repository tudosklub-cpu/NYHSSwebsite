// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Hungarian flag click animation for all buttons and links
    document.querySelectorAll('.btn, .event-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's an anchor link or no href
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            
            e.preventDefault();
            
            // Add clicked class for animation
            this.classList.add('clicked');
            
            // Navigate after animation completes
            setTimeout(() => {
                window.location.href = href;
            }, 400);
        });
    });
    
    // Toggle mobile menu
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = this.querySelectorAll('span');
            if (mainNav.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                
                // Reset hamburger menu
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mainNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            mainNav.classList.remove('active');
            
            // Reset hamburger menu
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    
    // Add active class to current page navigation
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.querySelectorAll('.about-card, .event-card, .leadership-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Form validation (if contact form exists)
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const name = document.querySelector('#name').value.trim();
            const email = document.querySelector('#email').value.trim();
            const subject = document.querySelector('#subject').value.trim() || 'Contact Form Submission';
            const message = document.querySelector('#message').value.trim();
            const interest = document.querySelector('#interest').value;
            
            let isValid = true;
            let errorMessage = '';
            
            if (!name) {
                errorMessage += 'Name is required.\n';
                isValid = false;
            }
            
            if (!email) {
                errorMessage += 'Email is required.\n';
                isValid = false;
            } else if (!isValidEmail(email)) {
                errorMessage += 'Please enter a valid email address.\n';
                isValid = false;
            }
            
            if (!message) {
                errorMessage += 'Message is required.\n';
                isValid = false;
            }
            
            if (!isValid) {
                alert(errorMessage);
                return;
            }
            
            // Build mailto link with form data
            const mailBody = `Name: ${name}%0D%0AEmail: ${email}%0D%0AArea of Interest: ${interest || 'Not specified'}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(message)}`;
            const mailtoLink = `mailto:tudosklub@gmail.com?subject=${encodeURIComponent(subject)}&body=${mailBody}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show confirmation
            alert('Your default email client will open. Please send the email to complete your message.');
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add hover effect to cards
    document.querySelectorAll('.about-card, .event-card, .leadership-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        });
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                mainNav.classList.remove('active');
                
                // Reset hamburger menu
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }, 250);
    });

    // Lightbox functionality for photo gallery
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');
        const galleryItems = document.querySelectorAll('.gallery-item img');
        let currentIndex = 0;
        let images = [];

        // Build images array
        galleryItems.forEach((img, index) => {
            images.push(img.src);
            img.addEventListener('click', function() {
                currentIndex = index;
                openLightbox(this.src);
            });
            img.style.cursor = 'pointer';
        });

        function openLightbox(src) {
            lightboxImage.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            lightboxImage.src = images[currentIndex];
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            lightboxImage.src = images[currentIndex];
        }

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', showPrev);
        lightboxNext.addEventListener('click', showNext);

        // Close on background click
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }
});
