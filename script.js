/**
 * Nexus Landing Page - Interactive JavaScript
 * Modern Vanilla JS implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements Selection ---
    const htmlElement = document.documentElement;
    const siteHeader = document.getElementById('siteHeader');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('backToTopBtn');
    
    // Contact Form Elements
    const contactForm = document.getElementById('contactForm');
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    const userMessageInput = document.getElementById('userMessage');
    const charCountDisplay = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitBtn');
    
    // Toast Notification Elements
    const toastNotification = document.getElementById('toastNotification');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastCloseBtn = document.getElementById('toastCloseBtn');
    let toastTimeout = null;

    // Footer Year
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================================================
    // 2. Theme Toggle (Dark & Light Mode) with LocalStorage
    // ==========================================================================
    const THEME_KEY = 'nexus_theme_mode';

    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            return savedTheme;
        }
        // Fallback to system preference
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };

    const applyTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    };

    // Initialize Theme
    applyTheme(getInitialTheme());

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // ==========================================================================
    // 3. Header Scroll Effect & Back-to-Top Button
    // ==========================================================================
    const handleScrollEffects = () => {
        const scrollY = window.scrollY;

        // Sticky Header shadow effect
        if (siteHeader) {
            if (scrollY > 30) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        }

        // Back to top visibility
        if (backToTopBtn) {
            if (scrollY > 350) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', handleScrollEffects, { passive: true });
    handleScrollEffects(); // Trigger on initial load

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================================================
    // 4. Mobile Navigation Menu Drawer
    // ==========================================================================
    const toggleMobileMenu = (forceClose = false) => {
        if (!mobileMenuBtn || !navMenu) return;

        const isCurrentlyOpen = mobileMenuBtn.classList.contains('active');
        const shouldOpen = forceClose ? false : !isCurrentlyOpen;

        if (shouldOpen) {
            mobileMenuBtn.classList.add('active');
            navMenu.classList.add('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        } else {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
    }

    // Close mobile menu when clicking outside or pressing Escape
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('open')) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                toggleMobileMenu(true);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
            toggleMobileMenu(true);
        }
    });

    // Close menu when clicking any nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu(true);
        });
    });

    // ==========================================================================
    // 5. ScrollSpy (Active Section Highlight in Navbar)
    // ==========================================================================
    const sections = document.querySelectorAll('section[id]');

    const updateActiveNavOnScroll = () => {
        const scrollPosition = window.scrollY + 120; // Offset for sticky header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', updateActiveNavOnScroll, { passive: true });

    // ==========================================================================
    // 6. Animated Stats Counter (Intersection Observer)
    // ==========================================================================
    const statsSection = document.getElementById('aboutStatsGrid');
    const statCounters = document.querySelectorAll('.stat-count');
    let hasAnimatedStats = false;

    const animateCounters = () => {
        statCounters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
            const duration = 1600; // ms
            const startTime = performance.now();

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out quad
                const easeProgress = 1 - (1 - progress) * (1 - progress);
                const currentVal = Math.floor(easeProgress * target);

                counter.textContent = currentVal;

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    counter.textContent = target;
                }
            };

            requestAnimationFrame(step);
        });
    };

    if (statsSection && 'IntersectionObserver' in window) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimatedStats) {
                    hasAnimatedStats = true;
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });

        statsObserver.observe(statsSection);
    }

    // ==========================================================================
    // 7. Interactive 3D Tilt on Feature Cards
    // ==========================================================================
    const tiltCards = document.querySelectorAll('.feature-card[data-tilt]');

    // Only apply tilt on devices that support hover (non-touch)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -6; // max -6 to +6 deg
                const rotateY = ((x - centerX) / centerX) * 6;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ==========================================================================
    // 8. Contact Form Validation & Submission
    // ==========================================================================
    
    // Live Character Counter for Textarea
    if (userMessageInput && charCountDisplay) {
        userMessageInput.addEventListener('input', () => {
            const currentLen = userMessageInput.value.length;
            const maxLen = userMessageInput.getAttribute('maxlength') || 500;
            charCountDisplay.textContent = `${currentLen} / ${maxLen}`;
        });
    }

    // Field Validation Helpers
    const setFieldStatus = (inputElement, isValid, errorMessage = '') => {
        const feedbackElement = inputElement.parentElement.querySelector('.field-feedback');
        
        if (isValid) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            if (feedbackElement) feedbackElement.textContent = '';
        } else {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
            if (feedbackElement) feedbackElement.textContent = errorMessage;
        }
    };

    const clearFieldStatus = (inputElement) => {
        const feedbackElement = inputElement.parentElement.querySelector('.field-feedback');
        inputElement.classList.remove('is-valid', 'is-invalid');
        if (feedbackElement) feedbackElement.textContent = '';
    };

    // Live validation on blur & input
    if (userNameInput) {
        userNameInput.addEventListener('blur', () => {
            const val = userNameInput.value.trim();
            if (val.length < 2) {
                setFieldStatus(userNameInput, false, 'სახელი უნდა შედგებოდეს მინიმუმ 2 სიმბოლოსგან');
            } else {
                setFieldStatus(userNameInput, true);
            }
        });
        userNameInput.addEventListener('input', () => {
            if (userNameInput.classList.contains('is-invalid')) {
                clearFieldStatus(userNameInput);
            }
        });
    }

    const validateEmailFormat = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(email);
    };

    if (userEmailInput) {
        userEmailInput.addEventListener('blur', () => {
            const val = userEmailInput.value.trim();
            if (!val) {
                setFieldStatus(userEmailInput, false, 'გთხოვთ შეიყვანოთ ელ-ფოსტის მისამართი');
            } else if (!validateEmailFormat(val)) {
                setFieldStatus(userEmailInput, false, 'გთხოვთ მიუთითოთ ვალიდური ელ-ფოსტა (მაგ: mail@example.com)');
            } else {
                setFieldStatus(userEmailInput, true);
            }
        });
        userEmailInput.addEventListener('input', () => {
            if (userEmailInput.classList.contains('is-invalid')) {
                clearFieldStatus(userEmailInput);
            }
        });
    }

    if (userMessageInput) {
        userMessageInput.addEventListener('blur', () => {
            const val = userMessageInput.value.trim();
            if (val.length < 10) {
                setFieldStatus(userMessageInput, false, 'შეტყობინება უნდა იყოს მინიმუმ 10 სიმბოლო');
            } else {
                setFieldStatus(userMessageInput, true);
            }
        });
        userMessageInput.addEventListener('input', () => {
            if (userMessageInput.classList.contains('is-invalid')) {
                clearFieldStatus(userMessageInput);
            }
        });
    }

    // Show Toast Function
    const showToast = (title, message, isError = false) => {
        if (!toastNotification) return;

        if (toastTimeout) clearTimeout(toastTimeout);

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        if (isError) {
            toastNotification.style.borderColor = '#EF4444';
            toastNotification.querySelector('.toast-icon').style.background = 'rgba(239, 68, 68, 0.2)';
            toastNotification.querySelector('.toast-icon').style.color = '#EF4444';
        } else {
            toastNotification.style.borderColor = '#10B981';
            toastNotification.querySelector('.toast-icon').style.background = 'rgba(16, 185, 129, 0.2)';
            toastNotification.querySelector('.toast-icon').style.color = '#10B981';
        }

        toastNotification.classList.add('show');

        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 5000);
    };

    if (toastCloseBtn) {
        toastCloseBtn.addEventListener('click', () => {
            if (toastNotification) {
                toastNotification.classList.remove('show');
            }
        });
    }

    // Form Submission Handling
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;
            let firstInvalidField = null;

            // Validate Name
            const nameVal = userNameInput.value.trim();
            if (nameVal.length < 2) {
                setFieldStatus(userNameInput, false, 'სახელი უნდა შედგებოდეს მინიმუმ 2 სიმბოლოსგან');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = userNameInput;
            } else {
                setFieldStatus(userNameInput, true);
            }

            // Validate Email
            const emailVal = userEmailInput.value.trim();
            if (!emailVal || !validateEmailFormat(emailVal)) {
                setFieldStatus(userEmailInput, false, 'გთხოვთ მიუთითოთ ვალიდური ელ-ფოსტა');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = userEmailInput;
            } else {
                setFieldStatus(userEmailInput, true);
            }

            // Validate Message
            const msgVal = userMessageInput.value.trim();
            if (msgVal.length < 10) {
                setFieldStatus(userMessageInput, false, 'შეტყობინება უნდა იყოს მინიმუმ 10 სიმბოლო');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = userMessageInput;
            } else {
                setFieldStatus(userMessageInput, true);
            }

            if (!isValid) {
                if (firstInvalidField) firstInvalidField.focus();
                showToast('შეცდომა!', 'გთხოვთ შეამოწმოთ შევსებული ველები და სცადოთ თავიდან.', true);
                return;
            }

            // If valid, simulate submission
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;

                // Reset Form
                contactForm.reset();
                clearFieldStatus(userNameInput);
                clearFieldStatus(userEmailInput);
                clearFieldStatus(userMessageInput);
                if (charCountDisplay) charCountDisplay.textContent = '0 / 500';

                // Display success toast
                showToast('წარმატება!', 'გმადლობთ! თქვენი შეტყობინება წარმატებით გაიგზავნა. ჩვენი გუნდი მალე დაგიკავშირდებათ.', false);
            }, 1000);
        });
    }
});
