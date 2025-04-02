/**
* Template Name: Spectra Virtual Labs Enhanced - main.js v1.2 (Inc Video Swiper)
* Based on DevFolio, Modified by Kelvin Mafurendi & AI Assistant
*/
(function() {
  "use strict";

  /* Helper Functions (select, on, onscroll) */
  const select=(el,all=!1)=>{if(el=el.trim(),all)return[...document.querySelectorAll(el)];const t=document.querySelector(el);return t?t:null},on=(t,e,i,l=!1)=>{let s=select(e,l);s&&(l?s.forEach(l=>l.addEventListener(t,i)):s.addEventListener(t,i))},onscroll=(t,e)=>{t.addEventListener("scroll",e)};

  /* Navbar links active state on scroll */
  let navbarlinks=select("#navbar .scrollto",!0),navbarlinksActive=()=>{let t=window.scrollY+200;navbarlinks.forEach(e=>{if(!e.hash)return;let i=select(e.hash);i&&(t>=i.offsetTop&&t<=i.offsetTop+i.offsetHeight?e.classList.add("active"):e.classList.remove("active"))})};window.addEventListener("load",navbarlinksActive),onscroll(document,navbarlinksActive);

  /* Scrolls to an element with header offset */
  const scrollto=t=>{let e=select("#header");if(!e)return;let i=e.offsetHeight;e.classList.contains("header-scrolled")||(i-=8);let l=select(t);l?(window.scrollTo({top:l.offsetTop-i,behavior:"smooth"}),console.log(`Scrolling to ${t}`)):console.warn(`Element ${t} not found for scrollto`)};

  /* Toggle .header-scrolled class */
  let selectHeader=select("#header");selectHeader&&(headerScrolled=()=>{window.scrollY>100?selectHeader.classList.add("header-scrolled"):selectHeader.classList.remove("header-scrolled")},window.addEventListener("load",headerScrolled),onscroll(document,headerScrolled));

  /* Back to top button */
  let backtotop=select(".back-to-top");backtotop&&(toggleBacktotop=()=>{window.scrollY>100?backtotop.classList.add("active"):backtotop.classList.remove("active")},window.addEventListener("load",toggleBacktotop),onscroll(document,toggleBacktotop),on("click",".back-to-top",function(t){t.preventDefault(),window.scrollTo({top:0,behavior:"smooth"})}));

  /* Mobile nav toggle */
  on("click",".mobile-nav-toggle",function(t){select("body").classList.toggle("mobile-nav-active"),this.classList.toggle("bi-list"),this.classList.toggle("bi-x")});

  /* Close mobile nav on scrollto link click */
  on("click",".scrollto",function(t){if(select(this.hash)){t.preventDefault();let e=select("body");if(e.classList.contains("mobile-nav-active")){e.classList.remove("mobile-nav-active");let i=select(".mobile-nav-toggle");i.classList.toggle("bi-list"),i.classList.toggle("bi-x")}scrollto(this.hash)}},!0);

  /* Preloader */
  let preloader=select("#preloader");preloader?(window.addEventListener("load",()=>{console.log("Window fully loaded. Removing preloader."),preloader.remove()}),console.log("Preloader setup complete.")):console.warn("Preloader element not found.");

  /* --- Functions to run AFTER window load --- */
  window.addEventListener("load",()=>{
      console.log("Executing functions inside window.load...");

      /* Scroll to hash if exists */
      if(window.location.hash){let t=select(window.location.hash);t?(console.log(`Scrolling to hash: ${window.location.hash}`),setTimeout(()=>{scrollto(window.location.hash)},100)):console.warn(`Hash element ${window.location.hash} not found on load`)} /* Add short delay for scroll on load */

      /* Hero type effect Debug */
      const t=select(".typed");console.log("Typed Element Selected:",t),t?(()=>{let e=t.getAttribute("data-typed-items");if(console.log("Typed Items Attribute:",e),e)try{if("undefined"==typeof Typed)return void console.error("Typed.js library is NOT loaded.");console.log("Typed.js library is loaded. Initializing..."),e=e.split(","),console.log("Typed Strings Array:",e),new Typed(".typed",{strings:e,loop:!0,typeSpeed:100,backSpeed:50,backDelay:2e3}),console.log("Typed.js Initialized Successfully.")}catch(t){console.error("Error during Typed.js initialization:",t)}else console.warn("Typed element found, but 'data-typed-items' attribute is missing or empty.")})():console.warn("Typed element '.typed' not found.");

      /* Init Isotope Projects */
      let e=select(".projects-container");e&&(()=>{try{let t=new Isotope(e,{itemSelector:".projects-item",layoutMode:"fitRows"}),i=select("#projects-filters li",!0);on("click","#projects-filters li",function(e){e.preventDefault(),i.forEach(t=>t.classList.remove("filter-active")),this.classList.add("filter-active"),t.arrange({filter:this.getAttribute("data-filter")}),"undefined"!=typeof AOS&&AOS.refresh()},!0)}catch(t){console.error("Error initializing Projects Isotope:",t)}})();

      /* Init Isotope Photography */
      let i=select(".photography-container");i&&(()=>{try{let t=new Isotope(i,{itemSelector:".photography-item",layoutMode:"masonry"}),e=select("#photography-filters li",!0);on("click","#photography-filters li",function(i){i.preventDefault(),e.forEach(t=>t.classList.remove("filter-active")),this.classList.add("filter-active"),t.arrange({filter:this.getAttribute("data-filter")}),"undefined"!=typeof AOS&&AOS.refresh()},!0)}catch(t){console.error("Error initializing Photography Isotope:",t)}})();

      /* Init Isotope Writings */
      let l=select(".writings-container");l&&(()=>{try{let t=new Isotope(l,{itemSelector:".writings-item",layoutMode:"fitRows"}),e=select("#writings-filters li",!0);on("click","#writings-filters li",function(i){i.preventDefault(),e.forEach(t=>t.classList.remove("filter-active")),this.classList.add("filter-active"),t.arrange({filter:this.getAttribute("data-filter")}),"undefined"!=typeof AOS&&AOS.refresh()},!0)}catch(t){console.error("Error initializing Writings Isotope:",t)}})();

      /* Init GLightbox */
      try{"undefined"!=typeof GLightbox?GLightbox({selector:".photography-lightbox"}):console.error("GLightbox library is not loaded.")}catch(t){console.error("Error initializing GLightbox:",t)}

      /* Init AOS */
      try{"undefined"!=typeof AOS?(AOS.init({duration:800,easing:"ease-in-out",once:!1,mirror:!1,anchorPlacement:"top-bottom"}),console.log("AOS Initialized (once: false).")):console.warn("AOS library is not loaded.")}catch(t){console.error("Error initializing AOS:",t)}

      /* Init Swiper Certificates */
       try{"undefined"!=typeof Swiper?new Swiper(".certificates-slider",{speed:600,loop:!1,autoplay:{delay:5e3,disableOnInteraction:!0},slidesPerView:"auto",breakpoints:{320:{slidesPerView:1,spaceBetween:20},768:{slidesPerView:2,spaceBetween:30},992:{slidesPerView:3,spaceBetween:30}},pagination:{el:".certificates-slider .swiper-pagination",clickable:!0},navigation:{nextEl:".certificates-slider .swiper-button-next",prevEl:".certificates-slider .swiper-button-prev"}}):console.error("Swiper library is not loaded.")}catch(t){console.error("Error initializing Certificates Swiper:",t)}

      /* Init Swiper Videos <<< NEW */
      try{"undefined"!=typeof Swiper?new Swiper(".videos-slider",{speed:600,loop:!1,autoplay:{delay:6e3,disableOnInteraction:!0},slidesPerView:"auto",centeredSlides:!0, /* Center active slide */ breakpoints:{320:{slidesPerView:1,spaceBetween:15},768:{slidesPerView:"auto", /* Allow slight overhang */ spaceBetween:20},992:{slidesPerView:2,spaceBetween:30}},pagination:{el:".videos-slider .swiper-pagination",clickable:!0},navigation:{nextEl:".videos-slider .swiper-button-next",prevEl:".videos-slider .swiper-button-prev"}}):console.error("Swiper library is not loaded.")}catch(t){console.error("Error initializing Videos Swiper:",t)}

      console.log("Window.load functions complete."); // Debug log
  });

  /* Skills observer */
  const s=select("#skills .skills-content");s&&(()=>{const t=new IntersectionObserver((t,e)=>{t.forEach(t=>{t.isIntersecting&&(select(".progress .progress-bar",!0).forEach(t=>{t.style.width=t.getAttribute("aria-valuenow")+"%"}),e.unobserve(t.target))})},{threshold:.3});t.observe(s)})();

})(); // End IIFE
