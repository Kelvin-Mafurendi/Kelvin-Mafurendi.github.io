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
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

     // Your offset calculation from DevFolio (adjust if needed for your header height diff)
     if (!header.classList.contains('header-scrolled')) {
      // Check current padding/height vs scrolled padding/height if precision needed
      // Let's use a fixed reasonable offset adjustment
       offset -= 8 // Might need tweaking based on actual padding diff
     }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
    // Scroll to top when clicked - Add this part if missing
    on('click', '.back-to-top', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Mobile nav toggle - Use body class for overlay effect
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active') // Use body class
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   * Close mobile nav on click
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body') // Check body class
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Hero type effect (Kept from your code)
   */
  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Preloader (Kept from your code - Crucial!)
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Initiate Isotope filtering for Projects, Photography, and Writings
   * Place inside window.load to ensure images are loaded for layout
   */
  window.addEventListener('load', () => {
    // Isotope for Projects
    let projectsContainer = select('.projects-container');
    if (projectsContainer) {
      let projectsIsotope = new Isotope(projectsContainer, {
        itemSelector: '.projects-item',
        layoutMode: 'fitRows'
      });
      let projectsFilters = select('#projects-filters li', true);
      on('click', '#projects-filters li', function(e) {
        e.preventDefault();
        projectsFilters.forEach(el => el.classList.remove('filter-active'));
        this.classList.add('filter-active');
        projectsIsotope.arrange({ filter: this.getAttribute('data-filter') });
        if (typeof AOS !== 'undefined') AOS.refresh(); // Refresh AOS after filtering
      }, true);
    }

    // Isotope for Photography
    let photographyContainer = select('.photography-container');
    if (photographyContainer) {
      let photographyIsotope = new Isotope(photographyContainer, {
        itemSelector: '.photography-item',
        layoutMode: 'masonry' // Masonry often looks better for varying image heights
      });
      let photographyFilters = select('#photography-filters li', true);
      on('click', '#photography-filters li', function(e) {
        e.preventDefault();
        photographyFilters.forEach(el => el.classList.remove('filter-active'));
        this.classList.add('filter-active');
        photographyIsotope.arrange({ filter: this.getAttribute('data-filter') });
         if (typeof AOS !== 'undefined') AOS.refresh();
      }, true);
    }

    // Isotope for Writings
    let writingsContainer = select('.writings-container');
    if (writingsContainer) {
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
    }
  }); // End window.load for Isotope

  /**
   * Initiate GLightbox (Using CORRECT selector from your HTML)
   */
  const photographyLightbox = GLightbox({
    selector: '.photography-lightbox' // Correct selector for photography links
  });


  /**
   * Skills animation using Intersection Observer
   * (Replaces PureCounter and external DOMContentLoaded listener from your original files)
   */
  const skillsContent = select('#skills .skills-content');
  if (skillsContent) {
      const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          // When the skill section is 50% visible
          if (entry.isIntersecting) {
              // Select all progress bars within the visible section
              select('.progress .progress-bar', true).forEach(bar => {
                    // Set the width based on the aria-valuenow attribute
                    bar.style.width = bar.getAttribute('aria-valuenow') + '%';
                    // Optional: Add text inside the bar if desired (ensure CSS contrast)
                    // bar.textContent = bar.getAttribute('aria-valuenow') + '%';
                });
              // Stop observing once animation is done for this section
              observer.unobserve(entry.target);
          }
      });
      }, { threshold: 0.3 }); // Trigger when 30% of the element is visible

      // Observe the container of the skills section
      skillsObserver.observe(skillsContent);
  }

  /**
   * Initiate AOS (Animation on Scroll)
   * Call init on load AFTER potential Isotope rearrangement
   */
  window.addEventListener('load', () => {
    if (typeof AOS !== 'undefined') { // Check if AOS is loaded
       AOS.init({
         duration: 800,
         easing: 'ease-in-out',
         once: true,
         mirror: false,
         anchorPlacement: 'top-bottom'
       });
    }
  });

  // REMOVED: Swiper initializations (testimonials, portfolio-details) - Not in your HTML
  // REMOVED: PureCounter() initialization - Replaced by IntersectionObserver logic


})() // End of IIFE
