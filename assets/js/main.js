/**
* Template Name: Spectra Virtual Labs Enhanced - main.js v1.4 (Preloader Fix)
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
  
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };

  /* Navbar links active state on scroll */
  let navbarlinks = select('#navbar .scrollto', true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    });
  };
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /* Scrolls to an element with header offset */
  const scrollto = (el) => {
    let header = select('#header');
    if (!header) return;
    let offset = header.offsetHeight;
    if (!header.classList.contains('header-scrolled')) {
      offset -= 8;
    }
    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    });
  };

  /* Toggle .header-scrolled class */
  let selectHeader = select('#header');
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('load', headerScrolled);
    onscroll(document, headerScrolled);
  }

  /* Back to top button */
  let backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
    
    on('click', '.back-to-top', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* Mobile nav toggle */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /* Close mobile nav when clicking scrollto links */
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

  /* Preloader */
  let preloader = select('#preloader');
  if (preloader) {
    // Define the function to remove preloader
    const removePreloader = () => {
      preloader.remove();
      console.log("Preloader removed successfully");
    };
    
    // Add direct event listener to window load
    window.addEventListener('load', removePreloader);
    
    // Backup timeout to ensure it gets removed even if load event issues
    setTimeout(() => {
      if (document.getElementById('preloader')) {
        removePreloader();
      }
    }, 1000);
  }

  /* --- Functions to run AFTER window load --- */
  window.addEventListener('load', () => {
    console.log("Window load event triggered");
    
    /* Scroll to hash if exists */
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }

    /* Hero type effect */
    const typedElement = select('.typed');
    if (typedElement) {
      let typed_strings = typedElement.getAttribute('data-typed-items');
      if (typed_strings) {
        typed_strings = typed_strings.split(',');
        try {
          if (typeof Typed !== 'undefined') {
            new Typed('.typed', {
              strings: typed_strings,
              loop: true,
              typeSpeed: 100,
              backSpeed: 50,
              backDelay: 2000
            });
            console.log("Typed.js initialized successfully");
          } else {
            console.error("Typed.js library is not loaded");
          }
        } catch (e) {
          console.error("Error initializing Typed.js:", e);
        }
      }
    }

    /* Init Isotope Projects */
    let projectsContainer = select('.projects-container');
    if (projectsContainer) {
      try {
        if (typeof Isotope !== 'undefined') {
          let projectsIsotope = new Isotope(projectsContainer, {
            itemSelector: '.projects-item',
            layoutMode: 'fitRows'
          });
          
          let projectsFilters = select('#projects-filters li', true);
          on('click', '#projects-filters li', function(e) {
            e.preventDefault();
            projectsFilters.forEach(function(el) {
              el.classList.remove('filter-active');
            });
            this.classList.add('filter-active');
            
            projectsIsotope.arrange({
              filter: this.getAttribute('data-filter')
            });
            if (typeof AOS !== 'undefined') {
              AOS.refresh();
            }
          }, true);
        } else {
          console.error("Isotope library is not loaded");
        }
      } catch (e) {
        console.error("Error initializing Projects Isotope:", e);
      }
    }

    /* Init Isotope Photography */
    let photographyContainer = select('.photography-container');
    if (photographyContainer) {
      try {
        if (typeof Isotope !== 'undefined') {
          let photographyIsotope = new Isotope(photographyContainer, {
            itemSelector: '.photography-item',
            layoutMode: 'masonry'
          });
          
          let photographyFilters = select('#photography-filters li', true);
          on('click', '#photography-filters li', function(e) {
            e.preventDefault();
            photographyFilters.forEach(function(el) {
              el.classList.remove('filter-active');
            });
            this.classList.add('filter-active');
            
            photographyIsotope.arrange({
              filter: this.getAttribute('data-filter')
            });
            if (typeof AOS !== 'undefined') {
              AOS.refresh();
            }
          }, true);
        } else {
          console.error("Isotope library is not loaded");
        }
      } catch (e) {
        console.error("Error initializing Photography Isotope:", e);
      }
    }

    /* Init Isotope Writings */
    let writingsContainer = select('.writings-container');
    if (writingsContainer) {
      try {
        if (typeof Isotope !== 'undefined') {
          let writingsIsotope = new Isotope(writingsContainer, {
            itemSelector: '.writings-item',
            layoutMode: 'fitRows'
          });
          
          let writingsFilters = select('#writings-filters li', true);
          on('click', '#writings-filters li', function(e) {
            e.preventDefault();
            writingsFilters.forEach(function(el) {
              el.classList.remove('filter-active');
            });
            this.classList.add('filter-active');
            
            writingsIsotope.arrange({
              filter: this.getAttribute('data-filter')
            });
            if (typeof AOS !== 'undefined') {
              AOS.refresh();
            }
          }, true);
        } else {
          console.error("Isotope library is not loaded");
        }
      } catch (e) {
        console.error("Error initializing Writings Isotope:", e);
      }
    }

    /* Init GLightbox */
    try {
      if (typeof GLightbox !== 'undefined') {
        GLightbox({
          selector: '.photography-lightbox'
        });
      } else {
        console.error("GLightbox library is not loaded");
      }
    } catch (e) {
      console.error("Error initializing GLightbox:", e);
    }

    /* Init AOS */
    try {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800,
          easing: 'ease-in-out',
          once: false,
          mirror: false,
          anchorPlacement: 'top-bottom'
        });
      } else {
        console.warn("AOS library is not loaded");
      }
    } catch (e) {
      console.error("Error initializing AOS:", e);
    }

    /* Init Swiper Certificates */
    try {
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
      } else {
        console.error("Swiper library is not loaded");
      }
    } catch (e) {
      console.error("Error initializing Certificates Swiper:", e);
    }

    /* Init Swiper Videos */
    try {
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
      } else {
        console.error("Swiper library is not loaded");
      }
    } catch (e) {
      console.error("Error initializing Videos Swiper:", e);
    }
  });

  /* Skills observer */
  const skillsContent = select('#skills .skills-content');
  if (skillsContent) {
    const skillsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            select('.progress .progress-bar', true).forEach(el => {
              el.style.width = el.getAttribute('aria-valuenow') + '%';
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    skillsObserver.observe(skillsContent);
  }

})(); // End IIFE
