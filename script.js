// Skill Sharing Platform - Interactive JavaScript with Backend Integration

// API Configuration
const API_BASE_URL = 'https://skillshare-backend-ugri.onrender.com/api';

// API Utility Functions
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    }
};

// Data Management
let skillsData = [];
let providersData = [];
let currentUser = null;

// Load data from backend
async function loadSkills() {
    try {
        const result = await api.get('/skills');
        skillsData = result.data.skills;
        updateSkillsUI();
        console.log('Skills loaded:', skillsData.length);
    } catch (error) {
        console.error('Failed to load skills:', error);
        showNotification('Failed to load skills', 'error');
    }
}

async function loadProviders() {
    try {
        const result = await api.get('/users/search/providers');
        providersData = result.data.users;
        updateProvidersUI();
        console.log('Providers loaded:', providersData.length);
    } catch (error) {
        console.error('Failed to load providers:', error);
        showNotification('Failed to load providers', 'error');
    }
}

// Update UI with real data
function updateSkillsUI() {
    const skillsContainer = document.querySelector('.skills-grid');
    if (!skillsContainer || !skillsData.length) return;

    skillsContainer.innerHTML = skillsData.map(skill => `
        <div class="skill-card" data-skill-id="${skill._id}">
            <div class="skill-icon" style="background: ${skill.color || '#667eea'}">
                <i class="${skill.icon || 'fas fa-code'}"></i>
            </div>
            <h3>${skill.name}</h3>
            <p>${skill.description}</p>
            <div class="skill-stats">
                <span><i class="fas fa-users"></i> ${skill.totalParticipants || 0}</span>
                <span><i class="fas fa-star"></i> ${skill.averageRating || 0}</span>
            </div>
            <div class="skill-tags">
                ${skill.tags ? skill.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('') : ''}
            </div>
        </div>
    `).join('');

    // Re-attach event listeners
    attachSkillCardEvents();
}

function updateProvidersUI() {
    const providersContainer = document.querySelector('.providers-grid');
    if (!providersContainer || !providersData.length) return;

    providersContainer.innerHTML = providersData.map(provider => `
        <div class="provider-card" data-provider-id="${provider._id}">
            <div class="provider-header">
                <img src="${provider.profileImage || 'https://via.placeholder.com/80'}" alt="${provider.firstName}" class="provider-avatar">
                <div class="provider-info">
                    <h3>${provider.firstName} ${provider.lastName}</h3>
                    <p>${provider.skills && provider.skills.length > 0 ? provider.skills[0].name : 'Skill Provider'}</p>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <span>4.9 (${Math.floor(Math.random() * 100) + 50} reviews)</span>
                    </div>
                </div>
            </div>
            <p class="provider-bio">${provider.bio || 'Experienced professional ready to share knowledge and skills.'}</p>
            <div class="provider-skills">
                ${provider.skills ? provider.skills.slice(0, 3).map(skill => 
                    `<span class="skill-tag">${skill.name}</span>`
                ).join('') : '<span class="skill-tag">Skills</span>'}
            </div>
            <div class="provider-footer">
                <span class="price">$${provider.hourlyRate || 50}/session</span>
                <a href="provider-profile.html?id=${provider._id}" class="btn btn-primary">View Profile</a>
            </div>
        </div>
    `).join('');

    // Re-attach event listeners
    attachProviderCardEvents();
}

// Authentication Functions
async function signup(userData) {
    try {
        const result = await api.post('/auth/signup', userData);
        if (result.success) {
            showNotification('Account created successfully! Please check your email for verification.', 'success');
            return result.data;
        }
    } catch (error) {
        showNotification(error.message || 'Signup failed', 'error');
        throw error;
    }
}

async function login(credentials) {
    try {
        const result = await api.post('/auth/login', credentials);
        if (result.success) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            currentUser = result.data.user;
            showNotification('Login successful!', 'success');
            updateAuthUI();
            return result.data;
        }
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
        throw error;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthUI();
    showNotification('Logged out successfully', 'success');
}

function updateAuthUI() {
    const authLinks = document.querySelectorAll('.nav-auth a');
    const userInfo = document.querySelector('.user-info');
    
    if (currentUser) {
        // User is logged in
        authLinks.forEach(link => {
            if (link.textContent.includes('Login') || link.textContent.includes('Sign Up')) {
                link.style.display = 'none';
            }
        });
        
        if (userInfo) {
            userInfo.innerHTML = `
                <span>Welcome, ${currentUser.firstName}!</span>
                <button class="btn btn-secondary btn-small" onclick="logout()">Logout</button>
            `;
            userInfo.style.display = 'block';
        }
    } else {
        // User is not logged in
        authLinks.forEach(link => {
            link.style.display = 'inline-block';
        });
        
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 1000;
                max-width: 300px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: #48bb78; }
            .notification-error { background: #f56565; }
            .notification-info { background: #4299e1; }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Event Listeners
function attachSkillCardEvents() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        card.addEventListener('click', function() {
            const skillId = this.dataset.skillId;
            showSkillDetails(skillId);
        });
    });
}

function attachProviderCardEvents() {
    const providerCards = document.querySelectorAll('.provider-card');
    
    providerCards.forEach(card => {
        const viewProfileBtn = card.querySelector('.btn-primary');
        
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const providerId = card.dataset.providerId;
                window.location.href = `provider-profile.html?id=${providerId}`;
            });
        }
    });
}

function showSkillDetails(skillId) {
    const skill = skillsData.find(s => s._id === skillId);
    if (skill) {
        showNotification(`Selected: ${skill.name}`, 'info');
        // You can implement a modal or redirect to skill details page
    }
}

// Form Handlers
function handleSignupForm(formData) {
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        accountType: formData.get('accountType'),
        skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : [],
        interests: formData.get('interests') ? formData.get('interests').split(',').map(s => s.trim()) : []
    };
    
    return signup(userData);
}

function handleLoginForm(formData) {
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    return login(credentials);
}

// Initialize application
async function initializeApp() {
    try {
        // Load data from backend
        await Promise.all([loadSkills(), loadProviders()]);
        
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            currentUser = JSON.parse(user);
            updateAuthUI();
        }
        
        console.log('Skill Sharing Platform initialized successfully with backend integration!');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('Failed to initialize application', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize the app
    initializeApp();
    
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
    
    // Smooth Scrolling for Navigation Links (only for same-page anchors)
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Only handle same-page anchor links
            if (targetId.startsWith('#')) {
                e.preventDefault();
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
            }
            // External links will work normally
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
    
    // CTA Button Animation
    const ctaButton = document.querySelector('.cta-section .btn-primary');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Redirect to signup page
            window.location.href = 'signup.html';
        });
    }
    
    // Search Functionality
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
    `;
    document.head.appendChild(searchStyles);
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const skillCards = document.querySelectorAll('.skill-card');
        
        skillCards.forEach(card => {
            const skillName = card.querySelector('h3').textContent.toLowerCase();
            const skillDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (skillName.includes(query) || skillDesc.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Password Strength Indicator (Sign Up Page)
    const passwordInput = document.getElementById('password');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
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
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                await handleSignupForm(formData);
                // Redirect to login page after successful signup
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                console.error('Signup failed:', error);
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                await handleLoginForm(formData);
                // Redirect to home page after successful login
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } catch (error) {
                console.error('Login failed:', error);
            }
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your contact form logic here
            showNotification('Contact form submitted! We\'ll get back to you soon.', 'success');
        });
    }

    // Mobile navigation styles are now handled in CSS
});
