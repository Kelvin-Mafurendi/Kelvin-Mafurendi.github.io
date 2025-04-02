/**
* Template Name: Spectra Virtual Labs Enhanced - main.js
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
  // Run on load and scroll
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header');
    let offset = header.offsetHeight;

     // Adjust offset calculation if header height changes on scroll
     if (!header.classList.contains('header-scrolled')) {
        // Example: Adjust by difference in padding/height
        // Check your CSS for exact values if needed. Let's assume 8px difference.
        offset -= 8;
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
    // Scroll to top when clicked
    on('click', '.back-to-top', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Mobile nav toggle - Use body class for overlay effect
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /**
   * Scrool with ofset on links with a class name .scrollto
   * Close mobile nav on click
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

  /**
   * Scroll with ofset on page load with hash links in the url
   */
   window.addEventListener('load', () => { // Needs to run after scrollto function is defined
       if (window.location.hash) {
           if (select(window.location.hash)) {
               scrollto(window.location.hash);
           }
       }
   });

   // ----------------------------------------------------------
   // ------------- PRELOADER REMOVAL (IMPORTANT) -------------
   // ----------------------------------------------------------
   let preloader = select('#preloader');
   if (preloader) {
       window.addEventListener('load', () => {
           preloader.remove();
       });
   }
   // ----------------------------------------------------------


  /**
   * ALL LIBRARY INITIALIZATIONS THAT DEPEND ON DOM/ASSETS BEING READY
   * Place inside window.load listener
   */
  window.addEventListener('load', () => {

    /**
     * Hero type effect (Initialize after window load)
     */
    const typedElement = select('.typed'); // Get the element
    if (typedElement) {
      let typed_strings = typedElement.getAttribute('data-typed-items');
      if (typed_strings) { // Check if the attribute exists and is not empty
         typed_strings = typed_strings.split(','); // Split into an array
         try {
            // Check if Typed constructor is available
            if (typeof Typed === 'undefined') {
                console.error('Typed.js library is not loaded.');
            } else {
                new Typed('.typed', { // Use the selector string for Typed constructor
                  strings: typed_strings,
                  loop: true,
                  typeSpeed: 100,
                  backSpeed: 50,
                  backDelay: 2000
                });
            }
         } catch (e) {
            console.error("Error initializing Typed.js:", e);
         }
      } else {
          console.warn("Typed element found, but 'data-typed-items' attribute is missing or empty.");
      }
    } // End if(typedElement)

    /**
     * Initialize Isotope for Projects
     */
    let projectsContainer = select('.projects-container');
    if (projectsContainer) {
      try {
          let projectsIsotope = new Isotope(projectsContainer, {
            itemSelector: '.projects-item',
            layoutMode: 'fitRows' // or 'masonry'
          });
          let projectsFilters = select('#projects-filters li', true);
          on('click', '#projects-filters li', function(e) {
            e.preventDefault();
            projectsFilters.forEach(el => el.classList.remove('filter-active'));
            this.classList.add('filter-active');
            projectsIsotope.arrange({ filter: this.getAttribute('data-filter') });
            if (typeof AOS !== 'undefined') AOS.refresh(); // Refresh AOS
          }, true);
      } catch (e) {
          console.error("Error initializing Projects Isotope:", e);
      }
    } // End if(projectsContainer)

    /**
     * Initialize Isotope for Photography
     */
    let photographyContainer = select('.photography-container');
    if (photographyContainer) {
       try {
          let photographyIsotope = new Isotope(photographyContainer, {
            itemSelector: '.photography-item',
            layoutMode: 'masonry' // Masonry often better for images
          });
          let photographyFilters = select('#photography-filters li', true);
          on('click', '#photography-filters li', function(e) {
            e.preventDefault();
            photographyFilters.forEach(el => el.classList.remove('filter-active'));
            this.classList.add('filter-active');
            photographyIsotope.arrange({ filter: this.getAttribute('data-filter') });
            if (typeof AOS !== 'undefined') AOS.refresh();
          }, true);
       } catch (e) {
          console.error("Error initializing Photography Isotope:", e);
       }
    } // End if(photographyContainer)

    /**
     * Initialize Isotope for Writings
     */
    let writingsContainer = select('.writings-container');
    if (writingsContainer) {
        try {
            let writingsIsotope = new Isotope(writingsContainer, {
                itemSelector: '.writings-item',
                layoutMode: 'fitRows'
            });
            let writingsFilters = select('#writings-filters li', true);
            on('click', '#writings-filters li', function (e) {
                e.preventDefault();
                writingsFilters.forEach(el => el.classList.remove('filter-active'));
                this.classList.add('filter-active');
                writingsIsotope.arrange({ filter: this.getAttribute('data-filter') });
                if (typeof AOS !== 'undefined') AOS.refresh();
            }, true);
        } catch(e) {
            console.error("Error initializing Writings Isotope:", e);
        }
    } // End if(writingsContainer)

    /**
     * Initialize GLightbox
     */
     try {
         if (typeof GLightbox === 'undefined') {
             console.error('GLightbox library is not loaded.');
         } else {
            const photographyLightboxInstance = GLightbox({
                 selector: '.photography-lightbox'
            });
         }
     } catch (e) {
         console.error("Error initializing GLightbox:", e);
     }

    /**
     * Initialize AOS (Animation on Scroll)
     */
    if (typeof AOS !== 'undefined') {
       try {
          AOS.init({
             duration: 800,
             easing: 'ease-in-out',
             once: true,
             mirror: false,
             anchorPlacement: 'top-bottom'
           });
           console.log("AOS Initialized"); // Add console log for confirmation
       } catch (e) {
           console.error("Error initializing AOS:", e);
       }
    } else {
       console.warn("AOS library is not loaded or initialized before this script ran inside window.load.");
    }

  }); // <<<--- END OF THE window.load LISTENER BLOCK


  /**
   * Skills animation using Intersection Observer
   * (This logic is fine outside window.load)
   */
  const skillsContent = select('#skills .skills-content');
  if (skillsContent) {
      const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              select('.progress .progress-bar', true).forEach(bar => {
                    bar.style.width = bar.getAttribute('aria-valuenow') + '%';
                });
              observer.unobserve(entry.target); // Animate only once
          }
      });
      }, { threshold: 0.3 }); // Trigger when 30% visible

      skillsObserver.observe(skillsContent);
  }

  // REMOVED: Swiper initializations (testimonials, portfolio-details) - Not in your HTML
  // REMOVED: PureCounter() initialization - Replaced by IntersectionObserver logic

})() // End of IIFE
