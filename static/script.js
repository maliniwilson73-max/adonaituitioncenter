// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Sticky Navbar on Scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu if open
            const navbar = document.querySelector('.navbar-collapse');
            if (navbar.classList.contains('show')) {
                const toggler = document.querySelector('.navbar-toggler');
                toggler.click();
            }
        }
    });
});

// Counter Animation for Achievements Section
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / speed;

        const updateCount = () => {
            const current = parseInt(counter.innerText);
            if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target;
            }
        };

        updateCount();
    });
}

// Trigger counter animation when section is visible
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.classList.contains('achievements-section')) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const achievementSection = document.querySelector('.achievements-section');
if (achievementSection) {
    observer.observe(achievementSection);
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const classSelected = document.getElementById('class').value;
        const message = document.getElementById('message').value;

        // Validate form
        if (!name || !phone || !classSelected) {
            alert('Please fill in all required fields');
            return;
        }

        // Create WhatsApp message
        const whatsappMessage = `Hello! I'm interested in joining Adonai Tuition Center.\n\nName: ${name}\nPhone: ${phone}\nClass Interested: ${classSelected}\nMessage: ${message || 'No additional message'}`;
        
        // Encode and redirect to WhatsApp
        const whatsappUrl = `https://wa.me/919841563747?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');

        // Optional: Reset form
        contactForm.reset();
    });
}

// Navbar active link indicator
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Mobile menu auto-close on link click
document.querySelectorAll('.navbar-collapse a').forEach(link => {
    link.addEventListener('click', () => {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarCollapse.classList.contains('show')) {
            navbarToggler.click();
        }
    });
});

// Add animation on page load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Carousel auto-scroll for gallery (if needed)
const galleryItems = document.querySelectorAll('.gallery-item');
if (galleryItems.length > 0) {
    // Gallery items will use the CSS hover effect
    console.log('Gallery initialized with', galleryItems.length, 'items');
}

// Form validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, ''));
}

// Real-time validation for contact form
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('blur', function() {
        if (!validatePhone(this.value)) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });
}

// Initialize tooltips (if using Bootstrap tooltips)
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Log initialization
console.log('Adonai Tuition Center Website Initialized');
console.log('Contact: +91 9841563747');
console.log('WhatsApp: https://wa.me/919841563747');
