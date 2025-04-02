/**
* Template Name: Spectra Virtual Labs Enhanced - main.js v1.1
* Based on DevFolio, Modified by Kelvin Mafurendi & AI Assistant
* License: --- (Update if you have one)
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header');
    let offset = header.offsetHeight;
     if (!header.classList.contains('header-scrolled')) {
        offset -= 8; // Adjust as needed
     }
    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    });
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header');
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    }
    window.addEventListener('load', headerScrolled);
    onscroll(document, headerScrolled);
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    }
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
    on('click', '.back-to-top', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /**
   * Scroll with offset on links with a class name .scrollto + Close mobile nav
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault();
      let body = select('body');
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active');
        let navbarToggle = select('.mobile-nav-toggle');
        navbarToggle.classList.toggle('bi-list');
        navbarToggle.classList.toggle('bi-x');
      }
      scrollto(this.hash);
    }
  }, true);

   // ----------------------------------------------------------
   // ------------- PRELOADER REMOVAL -------------
   // ----------------------------------------------------------
   let preloader = select('#preloader');
   if (preloader) {
       window.addEventListener('load', () => {
           console.log("Window fully loaded. Removing preloader."); // Debug log
           preloader.remove();
       });
   } else {
       console.warn("Preloader element not found.");
   }
   // ----------------------------------------------------------


  /**
   * Run functions after window is fully loaded
   */
  window.addEventListener('load', () => {
     console.log("Executing functions inside window.load..."); // Debug log

    /**
     * Handle hash links on page load
     */
    if (window.location.hash) {
        if (select(window.location.hash)) {
            console.log(`Scrolling to hash: ${window.location.hash}`); // Debug log
            scrollto(window.location.hash);
        }
    }

    /**
     * Hero type effect Debugging
     */
    const typedElement = select('.typed');
    console.log("Typed Element Selected:", typedElement); // Debug log
    if (typedElement) {
      let typed_strings = typedElement.getAttribute('data-typed-items');
      console.log("Typed Items Attribute:", typed_strings); // Debug log
      if (typed_strings) {
         typed_strings = typed_strings.split(',');
         console.log("Typed Strings Array:", typed_strings); // Debug log
         try {
            if (typeof Typed === 'undefined') {
                console.error('Typed.js library is NOT loaded.');
            } else {
                console.log('Typed.js library is loaded. Initializing...'); // Debug log
                new Typed('.typed', {
                  strings: typed_strings,
                  loop: true,
                  typeSpeed: 100,
                  backSpeed: 50,
                  backDelay: 2000
                });
                console.log("Typed.js Initialized Successfully."); // Debug log
            }
         } catch (e) {
            console.error("Error during Typed.js initialization:", e);
         }
      } else {
          console.warn("Typed element found, but 'data-typed-items' attribute is missing or empty.");
      }
    } // End if(typedElement)

    /** Initialize Isotope for Projects */
    let projectsContainer = select('.projects-container');
    if (projectsContainer) { /* ... Isotope code from previous response ... */ try { let projectsIsotope = new Isotope(projectsContainer, { itemSelector: '.projects-item', layoutMode: 'fitRows' }); let projectsFilters = select('#projects-filters li', true); on('click', '#projects-filters li', function(e) { e.preventDefault(); projectsFilters.forEach(el => el.classList.remove('filter-active')); this.classList.add('filter-active'); projectsIsotope.arrange({ filter: this.getAttribute('data-filter') }); if (typeof AOS !== 'undefined') AOS.refresh(); }, true); } catch (e) { console.error("Error initializing Projects Isotope:", e); } }
    /** Initialize Isotope for Photography */
    let photographyContainer = select('.photography-container');
    if (photographyContainer) { /* ... Isotope code from previous response ... */ try { let photographyIsotope = new Isotope(photographyContainer, { itemSelector: '.photography-item', layoutMode: 'masonry' }); let photographyFilters = select('#photography-filters li', true); on('click', '#photography-filters li', function(e) { e.preventDefault(); photographyFilters.forEach(el => el.classList.remove('filter-active')); this.classList.add('filter-active'); photographyIsotope.arrange({ filter: this.getAttribute('data-filter') }); if (typeof AOS !== 'undefined') AOS.refresh(); }, true); } catch (e) { console.error("Error initializing Photography Isotope:", e); } }
    /** Initialize Isotope for Writings */
    let writingsContainer = select('.writings-container');
    if (writingsContainer) { /* ... Isotope code from previous response ... */ try { let writingsIsotope = new Isotope(writingsContainer, { itemSelector: '.writings-item', layoutMode: 'fitRows' }); let writingsFilters = select('#writings-filters li', true); on('click', '#writings-filters li', function (e) { e.preventDefault(); writingsFilters.forEach(el => el.classList.remove('filter-active')); this.classList.add('filter-active'); writingsIsotope.arrange({ filter: this.getAttribute('data-filter') }); if (typeof AOS !== 'undefined') AOS.refresh(); }, true); } catch(e) { console.error("Error initializing Writings Isotope:", e); } }

    /** Initialize GLightbox */
    try { if (typeof GLightbox === 'undefined') { console.error('GLightbox library is not loaded.'); } else { const photographyLightboxInstance = GLightbox({ selector: '.photography-lightbox' }); } } catch (e) { console.error("Error initializing GLightbox:", e); }

    /** Initialize AOS */
    if (typeof AOS !== 'undefined') {
       try {
          AOS.init({
             duration: 800,
             easing: 'ease-in-out',
             once: false, // <<< CHANGED TO false to allow repeat animations
             mirror: false,
             anchorPlacement: 'top-bottom'
           });
           console.log("AOS Initialized (once: false)."); // Debug log
       } catch (e) {
           console.error("Error initializing AOS:", e);
       }
    } else {
       console.warn("AOS library is not loaded.");
    }

    /** Initialize Swiper for Certificates - NEW */
    try {
        if (typeof Swiper === 'undefined') {
            console.error('Swiper library is not loaded.');
        } else {
            new Swiper('.certificates-slider', { // Use the new class we'll add to HTML
                speed: 600,
                loop: false, // Usually false for content carousels unless very few items
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: true, // Stop autoplay if user interacts
                },
                slidesPerView: 'auto', // Let CSS/breakpoints determine slides per view
                // Responsive breakpoints
                breakpoints: {
                  // when window width is >= 320px
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 20
                  },
                  // when window width is >= 768px
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                  },
                  // when window width is >= 992px
                  992: {
                    slidesPerView: 3,
                    spaceBetween: 30
                  }
                },
                // Optional: Add pagination and navigation
                 pagination: {
                   el: '.swiper-pagination',
                   clickable: true,
                 },
                 navigation: {
                   nextEl: '.swiper-button-next',
                   prevEl: '.swiper-button-prev',
                 },
            });
            console.log("Swiper Initialized for Certificates.");
        }
    } catch (e) {
        console.error("Error initializing Swiper:", e);
    }


  }); // <<<--- END OF THE window.load LISTENER BLOCK


  /** Skills animation using Intersection Observer (Fine outside window.load) */
  const skillsContent = select('#skills .skills-content');
  if (skillsContent) { /* ... Skills observer code ... */ const skillsObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { select('.progress .progress-bar', true).forEach(bar => { bar.style.width = bar.getAttribute('aria-valuenow') + '%'; }); observer.unobserve(entry.target); } }); }, { threshold: 0.3 }); skillsObserver.observe(skillsContent); }


})() // End of IIFE
