/**
* Template Name: Spectra Virtual Labs Enhanced - main.js v1.5 (Performance Optimized)
* Based on DevFolio, Modified by Kelvin Mafurendi & AI Assistant
*/
(function() {
  "use strict";

  /* Helper Functions (select, on, onscroll) */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    }
    return document.querySelector(el);
  };
  
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };
  
  // Cache DOM selectors for frequent use
  const DOM = {
    body: document.body,
    header: document.getElementById('header'),
    navbar: select('#navbar .scrollto', true),
    preloader: document.getElementById('preloader'),
    backtotop: select('.back-to-top')
  };
  
  // Consolidated scroll handler for better performance
  const scrollHandler = () => {
    const scrollPosition = window.scrollY;
    
    // Navbar links active state
    if (DOM.navbar && DOM.navbar.length) {
      const position = scrollPosition + 200;
      DOM.navbar.forEach(navbarlink => {
        if (!navbarlink.hash) return;
        let section = select(navbarlink.hash);
        if (!section) return;
        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
          navbarlink.classList.add('active');
        } else {
          navbarlink.classList.remove('active');
        }
      });
    }
    
    // Header scroll class
    if (DOM.header) {
      if (scrollPosition > 100) {
        DOM.header.classList.add('header-scrolled');
      } else {
        DOM.header.classList.remove('header-scrolled');
      }
    }
    
    // Back to top button visibility
    if (DOM.backtotop) {
      if (scrollPosition > 100) {
        DOM.backtotop.classList.add('active');
      } else {
        DOM.backtotop.classList.remove('active');
      }
    }
  };
  
  // Add a single scroll listener instead of multiple
  window.addEventListener('scroll', scrollHandler, { passive: true });

  /* Scrolls to an element with header offset */
  const scrollto = (el) => {
    if (!DOM.header) return;
    
    let offset = DOM.header.offsetHeight;
    if (!DOM.header.classList.contains('header-scrolled')) {
      offset -= 8;
    }
    
    const elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    });
  };

  /* Mobile nav toggle */
  on('click', '.mobile-nav-toggle', function(e) {
    DOM.body.classList.toggle('mobile-nav-active');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /* Close mobile nav when clicking scrollto links */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault();
      
      if (DOM.body.classList.contains('mobile-nav-active')) {
        DOM.body.classList.remove('mobile-nav-active');
        let navbarToggle = select('.mobile-nav-toggle');
        navbarToggle.classList.toggle('bi-list');
        navbarToggle.classList.toggle('bi-x');
      }
      
      scrollto(this.hash);
    }
  }, true);

  /* Preloader with better fallback */
  if (DOM.preloader) {
    const removePreloader = () => {
      DOM.preloader.remove();
    };
    
    // Add listener for DOMContentLoaded to remove preloader earlier
    document.addEventListener('DOMContentLoaded', () => {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setTimeout(removePreloader, 500);
      });
    });
    
    // Backup timeout ensures preloader removal
    setTimeout(removePreloader, 1500);
  }

  /* Back to top click handler */
  if (DOM.backtotop) {
    on('click', '.back-to-top', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Lazy-load initialization function for components
  const initializeComponentWhenVisible = (selector, initFunction) => {
    const component = select(selector);
    if (!component) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initFunction();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(component);
  };

  /* Project Documentation PDF viewer */
  const initPDFViewer = () => {
    const pdfViewerModal = select('#pdfViewerModal');
    if (!pdfViewerModal) return;
    
    const pdfFrame = select('#pdfFrame');
    const modalTitle = select('#pdfViewerModalLabel');
    
    if (typeof bootstrap !== 'undefined') {
      const pdfModal = new bootstrap.Modal(pdfViewerModal);
      
      // Add click event to all PDF links
      on('click', '.pdf-viewer', function(e) {
        e.preventDefault();
        
        // Get PDF URL and title
        const pdfUrl = this.getAttribute('href');
        const pdfTitle = this.getAttribute('data-title') || 'Document Viewer';
        
        // Set modal title and iframe source
        modalTitle.textContent = pdfTitle;
        pdfFrame.src = pdfUrl;
        
        // Show modal
        pdfModal.show();
      }, true);
      
      // Clear iframe src when modal is closed to stop PDF loading
      pdfViewerModal.addEventListener('hidden.bs.modal', function() {
        pdfFrame.src = '';
      });
    }
  };

  /* Init Isotope and Filters - Generic function to reduce code duplication */
  const initIsotope = (containerSelector, filterSelector, layoutMode = 'fitRows') => {
    const container = select(containerSelector);
    if (!container || typeof Isotope === 'undefined') return null;
    
    try {
      const isotope = new Isotope(container, {
        itemSelector: `${containerSelector.replace('.', '-').substring(1)}`,
        layoutMode: layoutMode
      });
      
      const filters = select(filterSelector, true);
      if (!filters || !filters.length) return isotope;
      
      on('click', filterSelector, function(e) {
        e.preventDefault();
        
        filters.forEach(el => el.classList.remove('filter-active'));
        this.classList.add('filter-active');
        
        isotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }, true);
      
      return isotope;
    } catch (e) {
      console.error(`Error initializing Isotope for ${containerSelector}:`, e);
      return null;
    }
  };

  /* Skills progress animation */
  const initSkills = () => {
    const skillsContent = select('#skills .skills-content');
    if (!skillsContent) return;
    
    const skillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            select('.progress .progress-bar', true).forEach(el => {
              el.style.width = el.getAttribute('aria-valuenow') + '%';
            });
            skillsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    
    skillsObserver.observe(skillsContent);
  };

  /* Initialize critical components immediately */
  window.addEventListener('DOMContentLoaded', () => {
    // Init Skills (often above the fold)
    initSkills();
    
    // Run scroll handler once to set initial states
    scrollHandler();
    
    // If hash exists in URL, scroll to it
    if (window.location.hash && select(window.location.hash)) {
      // Wait a bit for page to stabilize
      setTimeout(() => {
        scrollto(window.location.hash);
      }, 100);
    }
  });

  /* Initialize non-critical components after load */
  window.addEventListener('load', () => {
    // Lazily initialize components when they become visible
    initializeComponentWhenVisible('.typed', () => {
      const typedElement = select('.typed');
      if (!typedElement || typeof Typed === 'undefined') return;
      
      let typed_strings = typedElement.getAttribute('data-typed-items');
      if (typed_strings) {
        typed_strings = typed_strings.split(',');
        new Typed('.typed', {
          strings: typed_strings,
          loop: true,
          typeSpeed: 100,
          backSpeed: 50,
          backDelay: 2000
        });
      }
    });
    
    // Lazily initialize Isotope components
    initializeComponentWhenVisible('.projects-container', () => {
      initIsotope('.projects-container', '#projects-filters li', 'fitRows');
    });
    
    initializeComponentWhenVisible('.photography-container', () => {
      initIsotope('.photography-container', '#photography-filters li', 'masonry');
      
      // Initialize GLightbox only when photography section is visible
      if (typeof GLightbox !== 'undefined') {
        GLightbox({
          selector: '.photography-lightbox'
        });
      }
    });
    
    initializeComponentWhenVisible('.writings-container', () => {
      initIsotope('.writings-container', '#writings-filters li', 'fitRows');
    });
    
    initializeComponentWhenVisible('.docs-container', () => {
      initIsotope('.docs-container', '#docs-filters li', 'fitRows');
    });
    
    // Initialize PDF viewer
    initPDFViewer();
    
    // Initialize AOS with reduced animation duration
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600, // Reduced from 800
        easing: 'ease-in-out',
        once: true, // Changed to true to prevent re-animation
        mirror: false,
        anchorPlacement: 'top-bottom',
        disable: window.innerWidth < 768 ? true : false // Disable on mobile
      });
    }
    
    // Initialize Swipers lazily
    initializeComponentWhenVisible('.certificates-slider', () => {
      if (typeof Swiper !== 'undefined') {
        new Swiper('.certificates-slider', {
          speed: 600,
          loop: false,
          autoplay: {
            delay: 5000,
            disableOnInteraction: true
          },
          slidesPerView: 'auto',
          breakpoints: {
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30
            },
            992: {
              slidesPerView: 3,
              spaceBetween: 30
            }
          },
          pagination: {
            el: '.certificates-slider .swiper-pagination',
            clickable: true
          },
          navigation: {
            nextEl: '.certificates-slider .swiper-button-next',
            prevEl: '.certificates-slider .swiper-button-prev'
          }
        });
      }
    });
    
    initializeComponentWhenVisible('.videos-slider', () => {
      if (typeof Swiper !== 'undefined') {
        new Swiper('.videos-slider', {
          speed: 600,
          loop: false,
          autoplay: {
            delay: 6000,
            disableOnInteraction: true
          },
          slidesPerView: 'auto',
          centeredSlides: true,
          breakpoints: {
            320: {
              slidesPerView: 1,
              spaceBetween: 15
            },
            768: {
              slidesPerView: 'auto',
              spaceBetween: 20
            },
            992: {
              slidesPerView: 2,
              spaceBetween: 30
            }
          },
          pagination: {
            el: '.videos-slider .swiper-pagination',
            clickable: true
          },
          navigation: {
            nextEl: '.videos-slider .swiper-button-next',
            prevEl: '.videos-slider .swiper-button-prev'
          }
        });
      }
    });
  });

})(); // End 
