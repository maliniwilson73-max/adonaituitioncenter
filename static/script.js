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
const courseOptions = {
    'Regular Tuition': [
        'English',
        'Tamil',
        'Mathematics',
        'Science',
        'Social Studies'
    ],
    'Summer Program': [
        '10th Standard Mathematics',
        '10th Standard Science',
        'Maths Improvement',
        'English Grammar & Reading Skills'
    ]
};

function updateCourseOptions(program) {
    const courseSelect = document.querySelector('#course');
    if (!courseSelect) {
        return;
    }

    courseSelect.innerHTML = '<option value="" disabled selected>Select Subject / Course</option>';
    courseSelect.disabled = true;

    if (!courseOptions[program]) {
        return;
    }

    courseOptions[program].forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        courseSelect.appendChild(option);
    });

    courseSelect.disabled = false;
}

function onProgramChange() {
    const programSelect = document.querySelector('#program');
    const courseSelect = document.querySelector('#course');
    if (!programSelect || !courseSelect) {
        return;
    }
    updateCourseOptions(programSelect.value);
    courseSelect.classList.remove('is-invalid');
}

window.onProgramChange = onProgramChange;

function initializeContactForm() {
    const contactForm = document.querySelector('#contactForm');
    const programSelect = document.querySelector('#program');
    const courseSelect = document.querySelector('#course');

    if (programSelect && courseSelect) {
        programSelect.addEventListener('change', onProgramChange);
        if (programSelect.value) {
            updateCourseOptions(programSelect.value);
        }
    }

    if (!programSelect || !courseSelect || !contactForm) {
        return;
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const studentName = document.getElementById('studentName');
        const parentName = document.getElementById('parentName');
        const schoolName = document.getElementById('schoolName');
        const phone = document.getElementById('phone');
        const classSelect = document.getElementById('class');
        const program = document.getElementById('program');
        const course = document.getElementById('course');

        let isValid = true;

        [studentName, parentName, schoolName, phone, classSelect, program, course].forEach(field => {
            field.classList.remove('is-invalid');
            if (!field.value || field.value.trim() === '') {
                field.classList.add('is-invalid');
                isValid = false;
            }
        });

        if (phone.value && !validatePhone(phone.value)) {
            phone.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            document.getElementById('formErrorMessage').classList.remove('d-none');
            document.getElementById('formSuccessMessage').classList.add('d-none');
            return;
        }

        const formData = new FormData(contactForm);
        const action = contactForm.getAttribute('action');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
        submitBtn.disabled = true;

        fetch(action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                document.getElementById('formSuccessMessage').classList.remove('d-none');
                document.getElementById('formErrorMessage').classList.add('d-none');
                contactForm.reset();
                updateCourseOptions('');
            } else {
                document.getElementById('formErrorMessage').classList.remove('d-none');
                document.getElementById('formSuccessMessage').classList.add('d-none');
            }
        })
        .catch(() => {
            document.getElementById('formErrorMessage').classList.remove('d-none');
            document.getElementById('formSuccessMessage').classList.add('d-none');
        })
        .finally(() => {
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForm);
} else {
    initializeContactForm();
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
