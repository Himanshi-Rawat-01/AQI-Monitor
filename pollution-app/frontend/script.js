/* ==================== MOTION PREFERENCES ==================== */
function initMotionPreferences() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyPreference = (matches) => {
        document.body.classList.toggle('reduced-motion', matches);
    };

    applyPreference(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', (event) => applyPreference(event.matches));
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener((event) => applyPreference(event.matches));
    }
}

/* ==================== PERFORMANCE MODE ==================== */
function initPerformanceMode() {
    const cpuCores = navigator.hardwareConcurrency || 8;
    const memoryGb = navigator.deviceMemory || 8;
    const lowPowerDevice = cpuCores <= 4 || memoryGb <= 4 || window.innerWidth <= 1024;

    document.body.classList.toggle('low-performance', lowPowerDevice);
}

/* ==================== HAMBURGER MENU ==================== */
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-link, .nav-item').forEach(item => {
            item.addEventListener('click', function () {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-container')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });

        // Close menu when Escape key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

/* ==================== SMOOTH SCROLL ==================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ==================== NAVBAR SCROLL EFFECT ==================== */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;
    
    function updateNavbar() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });
}

/* ==================== SMOOTH BACKGROUND TRANSITIONS ==================== */
/* ==================== ENHANCED SCROLL REVEAL & ANIMATIONS ==================== */
function initScrollBackgroundTransitions() {
    if (!('IntersectionObserver' in window)) {
        return;
    }

    // One-time reveal for carousel cards to ensure visible entrance animation.
    const carouselCards = document.querySelectorAll('.features-carousel .feature-card');
    carouselCards.forEach((card, index) => {
        card.style.animation = `smoothFadeInUp 0.7s ease-out ${index * 0.08}s both`;
    });

    // Section title reveal animation
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view-title');
                titleObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.35,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.section-title').forEach(title => {
        title.classList.add('title-reveal-pending');
        titleObserver.observe(title);
    });
}

/* ==================== SCROLL TO TOP BUTTON ==================== */
function initScrollToTop() {
    // Create scroll-to-top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = ' ';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);

    // Show/hide scroll button
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                if (window.pageYOffset > 300) {
                    scrollBtn.classList.add('show');
                } else {
                    scrollBtn.classList.remove('show');
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        smoothScrollToTop(800);
    });
}

/* ==================== FEATURES CAROUSEL ==================== */
function initFeatureCarousel() {
    const carousel = document.querySelector('[data-feature-carousel]');
    if (!carousel) return;

    const track = carousel.querySelector('[data-feature-track]');
    const prevBtn = carousel.querySelector('[data-feature-prev]');
    const nextBtn = carousel.querySelector('[data-feature-next]');
    const dotsWrap = carousel.querySelector('[data-feature-dots]');
    const meta = carousel.querySelector('[data-feature-meta]');
    const cards = Array.from(track ? track.querySelectorAll('.feature-card') : []);

    if (!track || !prevBtn || !nextBtn || !dotsWrap || !meta || cards.length === 0) return;

    let slidesPerView = 3;
    let currentSlide = 0;
    let maxSlide = 0;
    let autoplayTimer = null;

    function getSlidesPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function buildDots() {
        dotsWrap.innerHTML = '';
        for (let i = 0; i <= maxSlide; i += 1) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'feature-dot';
            dot.setAttribute('aria-label', `Go to feature slide ${i + 1}`);
            dot.addEventListener('click', () => {
                currentSlide = i;
                updateCarousel();
                restartAutoplay();
            });
            dotsWrap.appendChild(dot);
        }
    }

    function updateCarousel() {
        const cardWidth = cards[0].getBoundingClientRect().width;
        const styles = window.getComputedStyle(track);
        const rawGap = styles.columnGap !== 'normal' ? styles.columnGap : styles.gap;
        const gap = Number.isNaN(parseFloat(rawGap)) ? 0 : parseFloat(rawGap);
        const translateX = currentSlide * (cardWidth + gap);

        track.style.transform = `translateX(-${translateX}px)`;

        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === maxSlide;

        const dots = dotsWrap.querySelectorAll('.feature-dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
        });

        const activeStart = currentSlide;
        const activeEnd = currentSlide + slidesPerView - 1;
        cards.forEach((card, index) => {
            const inWindow = index >= activeStart && index <= activeEnd;
            card.classList.toggle('is-active-window', inWindow);
            card.classList.toggle('is-leading', index === activeStart);
        });

        meta.textContent = `Slide ${currentSlide + 1} of ${maxSlide + 1}`;
    }

    function restartAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
        }

        autoplayTimer = setInterval(() => {
            if (maxSlide === 0) return;
            currentSlide = currentSlide >= maxSlide ? 0 : currentSlide + 1;
            updateCarousel();
        }, 4500);
    }

    function reflowCarousel() {
        slidesPerView = getSlidesPerView();
        maxSlide = Math.max(0, cards.length - slidesPerView);
        currentSlide = Math.min(currentSlide, maxSlide);
        buildDots();
        updateCarousel();
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide -= 1;
            updateCarousel();
            restartAutoplay();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < maxSlide) {
            currentSlide += 1;
            updateCarousel();
            restartAutoplay();
        }
    });

    carousel.addEventListener('mouseenter', () => {
        if (autoplayTimer) clearInterval(autoplayTimer);
    });

    carousel.addEventListener('mouseleave', () => {
        restartAutoplay();
    });

    carousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (event.key === 'ArrowRight') {
            nextBtn.click();
        }
    });

    window.addEventListener('resize', reflowCarousel);

    reflowCarousel();
    restartAutoplay();
}

/* ==================== FEATURE CARD BG1 VIDEO ==================== */
function initFeatureCardVideoBackground() {
    const featureCards = document.querySelectorAll('#features .feature-card');
    if (!featureCards.length) return;

    // Keep card videos on capable devices, but skip on low-performance setups.
    const shouldSkipVideo = document.body.classList.contains('low-performance');
    if (shouldSkipVideo) {
        return;
    }

    const cardVideos = [];

    featureCards.forEach((card) => {
        if (card.querySelector('.feature-card-bg-video')) return;

        const video = document.createElement('video');
        video.className = 'feature-card-bg-video';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('aria-hidden', 'true');

        const source = document.createElement('source');
        source.src = '../uploads/bg1.mp4';
        source.type = 'video/mp4';
        video.appendChild(source);

        card.prepend(video);
        cardVideos.push(video);
    });

    if (!cardVideos.length) return;

    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (!(video instanceof HTMLVideoElement)) return;

                if (entry.isIntersecting) {
                    video.play().catch(() => {
                        // Ignore autoplay rejection; cards still render fine.
                    });
                } else {
                    video.pause();
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '120px 0px'
        });

        cardVideos.forEach((video) => videoObserver.observe(video));
    }
}

/* ==================== SCROLL PROGRESS BAR ==================== */
function initScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #1f242c, #656f7b);
        width: 0%;
        z-index: 9999;
        transition: width 150ms ease;
    `;
    document.body.appendChild(progressBar);

    let ticking = false;
    const updateProgress = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = scrollHeight > 0 ? (window.pageYOffset / scrollHeight) * 100 : 0;
        progressBar.style.width = scrolled + '%';
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }, { passive: true });
}

/* ==================== SCROLL PERFORMANCE MODE ==================== */
function initScrollPerformanceMode() {
    let releaseTimer = null;

    const onScroll = () => {
        if (!document.body.classList.contains('is-scrolling')) {
            document.body.classList.add('is-scrolling');
        }

        if (releaseTimer) {
            clearTimeout(releaseTimer);
        }

        releaseTimer = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 140);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ==================== START MONITORING CTA ==================== */
function initStartMonitoringButton() {
    const startMonitoringBtn = document.getElementById('startMonitoringBtn');
    if (!startMonitoringBtn) return;

    startMonitoringBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const user = localStorage.getItem('aqi_user') || sessionStorage.getItem('aqi_user');
        const token = localStorage.getItem('aqi_token') || sessionStorage.getItem('aqi_token');

        window.location.href = user && token ? 'dashboard.html' : 'login.html';
    });
}

/* ==================== SCROLL ANIMATION SYSTEM ==================== */
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('.scroll-animate:not([data-reveal])').forEach(el => {
            el.classList.add('animate-in');
        });
        return;
    }

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    // Observe all elements marked for scroll animation
    const scrollElements = document.querySelectorAll('.scroll-animate:not([data-reveal])');
    if (scrollElements.length > 0) {
        scrollElements.forEach(el => {
            animationObserver.observe(el);
        });
    }

}

/* ==================== FRAMER-STYLE SCROLL REVEAL OBSERVER ==================== */
function initScrollRevealObserver() {
    const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
    const topicSections = Array.from(document.querySelectorAll('.homepage .features, .homepage .process-section, .homepage .control-section'));

    if (!revealElements.length && !topicSections.length) {
        return;
    }

    document.body.classList.add('js-reveal-ready');

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach((el) => {
            el.classList.add('reveal-active');
        });
        topicSections.forEach((section, idx) => {
            section.classList.add('topic-reveal');
            if (idx === 0) section.classList.add('topic-active');
        });
        return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: '0px 0px -6% 0px'
    });

    revealElements.forEach((el) => {
        revealObserver.observe(el);
    });

    let activeSection = null;
    const sectionObserver = new IntersectionObserver((entries) => {
        let best = null;

        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('topic-reveal');

                if (!best || entry.intersectionRatio > best.intersectionRatio) {
                    best = entry;
                }
            }
        });

        if (best && best.target !== activeSection) {
            topicSections.forEach((section) => {
                section.classList.toggle('topic-active', section === best.target);
            });
            activeSection = best.target;
        }
    }, {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-4% 0px -14% 0px'
    });

    topicSections.forEach((section, idx) => {
        sectionObserver.observe(section);
        if (idx === 0) {
            section.classList.add('topic-reveal', 'topic-active');
            activeSection = section;
        }
    });
}

/* ==================== STAGGERED SECTION REVEAL ==================== */
function initStaggerReveal() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('[data-stagger]').forEach((group) => {
            group.classList.add('is-visible');
        });
        return;
    }

    const staggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const group = entry.target;
            const children = Array.from(group.children);
            children.forEach((child, index) => {
                child.style.transitionDelay = `${index * 90}ms`;
            });

            group.classList.add('is-visible');
            observer.unobserve(group);
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('[data-stagger]').forEach((group) => {
        staggerObserver.observe(group);
    });
}

/* ==================== HERO SCROLL CUE ==================== */
function initHeroScrollCue() {
    const cue = document.querySelector('.scroll-cue');
    if (!cue) return;

    const toggleCue = () => {
        cue.style.opacity = window.scrollY > 120 ? '0' : '0.9';
        cue.style.pointerEvents = window.scrollY > 120 ? 'none' : 'auto';
    };

    window.addEventListener('scroll', toggleCue, { passive: true });
    toggleCue();
}

/* ==================== HOW IT WORKS TIMELINE ==================== */
function initProcessTimeline() {
    const timeline = document.querySelector('[data-process-timeline]');
    if (!timeline) return;

    const timelineSection = timeline.closest('.process-section');

    const steps = Array.from(timeline.querySelectorAll('[data-timeline-step]'));
    if (!steps.length) return;

    let metrics = [];
    let ticking = false;
    let lastProgress = -1;
    let lastActive = -1;

    function rebuildMetrics() {
        const scrollY = window.pageYOffset;
        metrics = steps.map((step) => {
            const rect = step.getBoundingClientRect();
            const top = rect.top + scrollY;
            return {
                top,
                center: top + rect.height / 2
            };
        });
    }

    function updateTimeline() {
        if (timelineSection) {
            const rect = timelineSection.getBoundingClientRect();
            // Skip expensive math when section is far from the viewport.
            if (rect.bottom < -120 || rect.top > window.innerHeight + 120) {
                ticking = false;
                return;
            }
        }

        const viewportMark = window.pageYOffset + window.innerHeight * 0.62;
        let reached = -1;
        let activeIndex = 0;
        let nearest = Number.POSITIVE_INFINITY;

        metrics.forEach((metric, index) => {
            const distance = Math.abs(metric.center - viewportMark);
            if (distance < nearest) {
                nearest = distance;
                activeIndex = index;
            }
            if (metric.center <= viewportMark) {
                reached = index;
            }
        });

        const progress = Math.max(0, Math.min(1, (reached + 1) / steps.length));
        if (progress !== lastProgress) {
            timeline.style.setProperty('--timeline-progress', progress.toFixed(3));
            lastProgress = progress;
        }

        if (activeIndex !== lastActive) {
            steps.forEach((step, index) => {
                step.classList.toggle('is-active', index === activeIndex && step.classList.contains('in-view'));
            });
            lastActive = activeIndex;
        }

        ticking = false;
    }

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });

            rebuildMetrics();
            if (!ticking) {
                window.requestAnimationFrame(updateTimeline);
                ticking = true;
            }
        }, {
            threshold: 0.28,
            rootMargin: '0px 0px -8% 0px'
        });

        steps.forEach((step) => revealObserver.observe(step));
    } else {
        steps.forEach((step) => step.classList.add('in-view'));
        timeline.style.setProperty('--timeline-progress', '1');
    }

    const progressHandler = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateTimeline);
            ticking = true;
        }
    };

    window.addEventListener('scroll', progressHandler, { passive: true });
    window.addEventListener('resize', () => {
        rebuildMetrics();
        progressHandler();
    });

    rebuildMetrics();
    updateTimeline();
}

/* ==================== CONTROL POINT REVEAL ==================== */
function initControlPointReveal() {
    const items = Array.from(document.querySelectorAll('[data-control-reveal] li'));
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
        items.forEach((item) => item.classList.add('in-view'));
        return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const item = entry.target;
            const siblings = Array.from(item.parentElement ? item.parentElement.children : []);
            const index = siblings.indexOf(item);
            item.style.transitionDelay = `${Math.max(0, index) * 95}ms`;
            item.classList.add('in-view');
            observer.unobserve(item);
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -30px 0px'
    });

    items.forEach((item) => revealObserver.observe(item));
}

/* ==================== INITIALIZATION ==================== */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all features
    try {
        // Check if CONFIG is available
        if (typeof CONFIG === 'undefined') {
            console.warn('CONFIG not loaded. Some features may use default values.');
        }

        const isHomepage = document.body.classList.contains('homepage');
        
        initMotionPreferences();
        initPerformanceMode();
        initHamburgerMenu();
        initNavbarScroll();

        if (isHomepage) {
            initSmoothScroll();
            initScrollToTop();
            initScrollBackgroundTransitions();
            initScrollAnimations();
            initScrollRevealObserver();
            initScrollPerformanceMode();
            initStaggerReveal();
            initHeroScrollCue();
            initProcessTimeline();
            initControlPointReveal();
            initFeatureCarousel();
            initFeatureCardVideoBackground();
            initScrollProgressBar();
            initStartMonitoringButton();
        }
        
        initGSAPReveals();
        initLiveMotion();
        
        console.log('AirSense initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Smooth scroll to top with simple animations
function smoothScrollToTop(duration = 800) {
    const start = window.pageYOffset;
    const startTime = performance.now();
    
    const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start * (1 - progress));
        
        if (progress < 1) {
            window.requestAnimationFrame(scroll);
        }
    };
    
    window.requestAnimationFrame(scroll);
}

/* ==================== GSAP ONE PAGE SCROLL REVEAL ==================== */
function initGSAPReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Keep perspective for 3D effects sitewide
    gsap.set('body', { perspective: 1200 });

    // ── Hero: fast, snappy entrance on load ────────────────────────────────────
    const heroReveals = document.querySelectorAll('.hero .gsap-reveal');
    if (heroReveals.length) {
        const heroTl = gsap.timeline({ delay: 0.15 });
        heroTl.fromTo(heroReveals,
            { y: 120, opacity: 0, scale: 0.6, rotationX: 30 },
            {
                y: 0, opacity: 1, scale: 1, rotationX: 0,
                duration: 1.0, stagger: 0.18, ease: 'back.out(1.6)',
                onComplete: () => startHeadingFloat(heroReveals)  // float AFTER reveal
            }
        );
    }

    // ── Sections: pop-in reveal per section (NO scrub – stays visible) ─────────
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        // Headings / text blocks
        const reveals = section.querySelectorAll('.gsap-reveal');
        if (reveals.length) {
            gsap.fromTo(reveals,
                { y: 80, opacity: 0, scale: 0.7, rotationX: 25 },
                {
                    y: 0, opacity: 1, scale: 1, rotationX: 0,
                    duration: 0.9, stagger: 0.18, ease: 'back.out(1.5)',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        // No 'end' / no 'scrub' → fires once, element STAYS visible
                        toggleActions: 'play none none none'
                    },
                    onComplete: () => startHeadingFloat(reveals)
                }
            );
        }

        // Cards pop-in with stagger and spring bounce
        const cards = section.querySelectorAll('.feature-card, .process-card, .timeline-card, .control-panel');
        if (cards.length) {
            gsap.fromTo(cards,
                { y: 100, opacity: 0, scale: 0.75, rotationY: 15 },
                {
                    y: 0, opacity: 1, scale: 1, rotationY: 0,
                    duration: 0.8, stagger: 0.12, ease: 'back.out(1.8)',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 75%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // List items zipper cascade
        const listItems = section.querySelectorAll('.control-list li, [data-timeline-step]');
        if (listItems.length) {
            gsap.fromTo(listItems,
                { x: -60, opacity: 0, scale: 0.88 },
                {
                    x: 0, opacity: 1, scale: 1,
                    duration: 0.6, stagger: 0.1, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 70%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    });

    ScrollTrigger.config({ limitCallbacks: true });
}

// Smooth ambient float that runs AFTER reveal completes (no conflict)
function startHeadingFloat(elements) {
    gsap.to(elements, {
        y: '+=10',
        rotationZ: 0.8,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.5, from: 'random' }
    });
}

/* ==================== LIVE CONTINUOUS MOTION ==================== */
function initLiveMotion() {
    if (typeof gsap === 'undefined') return;

    // 1. Ambient soft grey particles — slow, calm, never shiver
    const particleContainer = document.createElement('div');
    particleContainer.setAttribute('aria-hidden', 'true');
    particleContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:hidden;';
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        const size = 6 + Math.random() * 12;
        p.style.cssText = `position:absolute;width:${size}px;height:${size}px;
            background:radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%);
            border-radius:50%;opacity:0;`;
        particleContainer.appendChild(p);

        gsap.set(p, {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
        });

        // Very slow random float — never snappy
        gsap.to(p, {
            x: '+=' + (Math.random() * 80 - 40),
            y: '+=' + (Math.random() * 80 - 40),
            opacity: 0.08 + Math.random() * 0.2,
            duration: 20 + Math.random() * 20,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
    }

    // 2. Hero center gentle float (only .nature-center, not .gsap-reveal to avoid conflict)
    const heroCenter = document.querySelector('.hero .nature-center');
    if (heroCenter) {
        gsap.to(heroCenter, {
            y: 12,
            duration: 4,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
    }

    // 3. Mouse parallax — video depth shift + card tilt
    let mx = 0, my = 0;
    let rAFId = null;

    document.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth - 0.5);
        my = (e.clientY / window.innerHeight - 0.5);

        if (!rAFId) {
            rAFId = requestAnimationFrame(() => {
                gsap.to('.feature-card, .process-card, .control-panel', {
                    rotationY: mx * 18,
                    rotationX: -my * 18,
                    transformPerspective: 900,
                    ease: 'power2.out',
                    duration: 0.9,
                    overwrite: 'auto'
                });
                gsap.to('.hero-video-bg, .process-bg-video', {
                    x: mx * -35,
                    y: my * -35,
                    scale: 1.05,
                    ease: 'power2.out',
                    duration: 1.4,
                    overwrite: 'auto'
                });
                rAFId = null;
            });
        }
    });
}

