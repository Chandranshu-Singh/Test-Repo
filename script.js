// Skill Sharing Platform - Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navAuth = document.querySelector('.nav-auth');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            navAuth.classList.toggle('active');
        });
    }
    
    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    navAuth.classList.remove('active');
                }
            }
        });
    });
    
    // Navbar Background on Scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Animate Elements on Scroll
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
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.skill-card, .step, .provider-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Counter Animation for Stats
    const stats = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString() + '+';
        }, 20);
    };
    
    // Animate stats when they come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const text = statNumber.textContent;
                const target = parseInt(text.replace(/[^0-9]/g, ''));
                
                animateCounter(statNumber, target);
                statsObserver.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => statsObserver.observe(stat));
    
    // Interactive Skill Cards
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Provider Card Interactions
    const providerCards = document.querySelectorAll('.provider-card');
    
    providerCards.forEach(card => {
        const viewProfileBtn = card.querySelector('.btn-primary');
        
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', function() {
                // Simulate profile view action
                this.textContent = 'Loading...';
                setTimeout(() => {
                    this.textContent = 'Profile Viewed';
                    this.style.background = '#48bb78';
                }, 1000);
            });
        }
    });
    
    // CTA Button Animation
    const ctaButton = document.querySelector('.cta-section .btn-primary');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Simulate sign-up action
            this.textContent = 'Redirecting...';
            this.style.background = '#48bb78';
            
            setTimeout(() => {
                // You can replace this with actual sign-up logic
                alert('Welcome to SkillShare! This would redirect to a sign-up form.');
                this.textContent = 'Get Started Today';
                this.style.background = '';
            }, 2000);
        });
    }
    
    // Search Functionality (Placeholder)
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for skills...';
    searchInput.className = 'search-input';
    
    // Add search input to hero section
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.appendChild(searchInput);
        heroActions.appendChild(searchContainer);
    }
    
    // Search input styling
    const searchStyles = document.createElement('style');
    searchStyles.textContent = `
        .search-container {
            margin-top: 1rem;
        }
        .search-input {
            width: 100%;
            max-width: 400px;
            padding: 12px 20px;
            border: 2px solid #e2e8f0;
            border-radius: 25px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s ease;
        }
        .search-input:focus {
            border-color: #667eea;
        }
        .search-input::placeholder {
            color: #a0aec0;
        }
    `;
    document.head.appendChild(searchStyles);
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Filter skill cards based on search
        skillCards.forEach(card => {
            const skillName = card.querySelector('h3').textContent.toLowerCase();
            const skillDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (skillName.includes(searchTerm) || skillDesc.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.opacity = '1';
            } else {
                card.style.opacity = '0.3';
            }
        });
    });
    
    // Add loading states to buttons
    const allButtons = document.querySelectorAll('.btn');
    
    allButtons.forEach(button => {
        if (!button.classList.contains('btn-outline')) {
            button.addEventListener('click', function() {
                if (!this.classList.contains('btn-outline')) {
                    const originalText = this.textContent;
                    this.textContent = 'Loading...';
                    this.style.pointerEvents = 'none';
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.pointerEvents = 'auto';
                    }, 2000);
                }
            });
        }
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Add floating animation to skill icons
    const skillIcons = document.querySelectorAll('.skill-icon');
    
    skillIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.2}s`;
        icon.style.animation = 'float 4s ease-in-out infinite';
    });
    
    // Add floating animation CSS
    const floatingStyles = document.createElement('style');
    floatingStyles.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(floatingStyles);
    
    // Initialize tooltips for skill tags
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.background = '#667eea';
            this.style.color = 'white';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.background = '#edf2f7';
            this.style.color = '#4a5568';
        });
    });
    
    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        z-index: 1001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    // Update progress bar on scroll
    window.addEventListener('scroll', function() {
        const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
    
    // Add "Back to Top" button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    `;
    document.body.appendChild(backToTop);
    
    // Show/hide back to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Back to top functionality
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add hover effect to back to top button
    backToTop.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.background = '#764ba2';
    });
    
    backToTop.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.background = '#667eea';
    });
    
    // FAQ Accordion Functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle answer visibility
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Password Strength Indicator
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            let strengthClass = '';
            let strengthLabel = '';
            
            if (strength <= 2) {
                strengthClass = 'weak';
                strengthLabel = 'Weak';
            } else if (strength <= 3) {
                strengthClass = 'medium';
                strengthLabel = 'Medium';
            } else {
                strengthClass = 'strong';
                strengthLabel = 'Strong';
            }
            
            strengthFill.className = `strength-fill ${strengthClass}`;
            strengthText.textContent = strengthLabel;
        });
    }

    // Password Toggle Visibility
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    // Account Type Selection (Sign Up Page)
    const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
    const learnerSkills = document.getElementById('learnerSkills');
    const providerSkills = document.getElementById('providerSkills');
    
    if (accountTypeRadios.length > 0 && learnerSkills && providerSkills) {
        accountTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'learner') {
                    learnerSkills.style.display = 'block';
                    providerSkills.style.display = 'none';
                } else {
                    learnerSkills.style.display = 'none';
                    providerSkills.style.display = 'block';
                }
            });
        });
    }

    // Form Validation and Submission
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const contactForm = document.getElementById('contactForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your signup logic here
            alert('Sign up form submitted! (This is a demo)');
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your login logic here
            alert('Login form submitted! (This is a demo)');
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your contact form logic here
            alert('Contact form submitted! (This is a demo)');
        });
    }

    console.log('Skill Sharing Platform initialized successfully!');
});

// Add CSS for mobile navigation
const mobileNavStyles = document.createElement('style');
mobileNavStyles.textContent = `
    @media (max-width: 768px) {
        .nav-menu.active,
        .nav-auth.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-top: 1px solid #e2e8f0;
        }
        
        .nav-menu.active {
            gap: 1rem;
        }
        
        .nav-auth.active {
            gap: 0.5rem;
            padding-top: 0;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(mobileNavStyles);
