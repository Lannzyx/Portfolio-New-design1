/* ==========================================================================
   Ikhsan Nur Pratama — Portfolio
   Motion, filters, lightbox, cursor
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------
     Header: solid on scroll
     --------------------------------------------------------------- */
  var header = document.getElementById('header');

  function onScrollHeader() {
    header.classList.toggle('is-solid', window.scrollY > 40);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------- */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);

    if (open) {
      var firstLink = mobileMenu.querySelector('a');
      if (firstLink) window.setTimeout(function () { firstLink.focus(); }, 380);
    } else {
      menuBtn.focus();
    }
  }

  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  /* ---------------------------------------------------------------
     Reveal on enter (mask / clip / fade)
     Robust version: reveals anything already in or near the viewport on
     load, animates the rest as they scroll in, and never leaves an
     element invisible if the observer misbehaves.
     --------------------------------------------------------------- */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll('.mask, .clip-reveal, .reveal')
  );

  function show(el) { el.classList.add('is-in'); }

  var revealObserver = null;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

    revealObserver = io;
    revealTargets.forEach(function (el) { io.observe(el); });

    // Items already on screen at load animate in sequence, not abruptly.
    window.requestAnimationFrame(function () {
      var vh = window.innerHeight;
      var heroItems = document.querySelectorAll('.hero .mask, .hero .clip-reveal, .hero .reveal');

      heroItems.forEach(function (el) {
        el.classList.add('is-in');
        io.unobserve(el);
      });

      // Anything else visible in the first viewport is revealed right away
      // instead of waiting for the observer's first callback.
      revealTargets.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.9) {
          show(el);
          io.unobserve(el);
        }
      });
    });

    // Safety net: whatever is still hidden after load must not stay hidden.
    window.setTimeout(function () {
      revealTargets.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) show(el);
      });
    }, 1200);
  } else {
    revealTargets.forEach(show);
  }

  /* ---------------------------------------------------------------
     Hero slideshow — portrait rotates every few seconds
     --------------------------------------------------------------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('#hero-slides img'));
  var slideIndex = 0;

  if (slides.length > 1 && !reduceMotion) {
    var slideTimer = null;
    var slideDelay = 4200;

    function nextSlide() {
      slides[slideIndex].classList.remove('is-active');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add('is-active');
    }

    function startSlides() {
      if (slideTimer) return;
      slideTimer = window.setInterval(nextSlide, slideDelay);
    }

    function stopSlides() {
      if (!slideTimer) return;
      window.clearInterval(slideTimer);
      slideTimer = null;
    }

    startSlides();

    // Pause when the tab is hidden or the user prefers less motion
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopSlides();
      else startSlides();
    });

    // Pause while the pointer is over the portrait so it can be looked at
    var heroFig = slides[0].closest('.hero-media');
    if (heroFig) {
      heroFig.addEventListener('mouseenter', stopSlides);
      heroFig.addEventListener('mouseleave', startSlides);
    }
  }

  /* ---------------------------------------------------------------
     Parallax (subtle, transform only)
     Only applied to elements that are NOT clip-reveal wrappers, so the
     reveal animation owns its own transform/clip-path and never snaps in.
     --------------------------------------------------------------- */
  var parallaxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'))
    .filter(function (el) { return !el.classList.contains('clip-reveal'); });

  if (!reduceMotion && parallaxItems.length) {
    var ticking = false;

    function applyParallax() {
      var vh = window.innerHeight;

      parallaxItems.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;

        var strength = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var center = rect.top + rect.height / 2 - vh / 2;
        var shift = -center * strength;

        // Parallax the media box, never the individual slide images: each
        // slide owns its own opacity/scale, and a second transform on the
        // same element would fight the crossfade.
        var target = el.querySelector('.hero-slides') || el.querySelector('img');
        if (!target) return;

        // If the target is inside a clip-reveal that has not entered yet,
        // let the reveal run first; parallax takes over afterwards.
        var wrapper = target.closest && target.closest('.clip-reveal');
        if (wrapper && !wrapper.classList.contains('is-in')) return;

        target.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0)';
      });

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyParallax);
      }
    }, { passive: true });

    window.addEventListener('resize', applyParallax, { passive: true });
    applyParallax();
  }

  /* ---------------------------------------------------------------
     Work grid - static markup in index.html
     Cards already exist in the page, so JS only handles filter + lightbox.
     --------------------------------------------------------------- */
  var grid = document.getElementById('grid');

  /* ---------------------------------------------------------------
     Work filters (delegated, so they work on rendered cards)
     --------------------------------------------------------------- */
  var currentFilter = 'all';

  function applyFilter(cat) {
    currentFilter = cat;
    if (!grid) return;

    var cards = grid.querySelectorAll('.card');
    cards.forEach(function (card) {
      var show = cat === 'all' || card.getAttribute('data-cat') === cat;
      card.hidden = !show;
      if (show) {
        card.classList.remove('is-in');
        void card.offsetWidth;
        card.classList.add('is-in');
      }
    });
  }

  document.querySelectorAll('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter').forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* ---------------------------------------------------------------
     Lightbox
     --------------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  var lbMedia = document.getElementById('lb-media');
  var lbTitle = document.getElementById('lb-title');
  var lbDesc = document.getElementById('lb-desc');
  var lbMeta = document.getElementById('lb-meta');
  var lbClose = lightbox.querySelector('.lb-close');
  var lastFocus = null;
  var currentVideo = null;

  function openLightbox(data) {
    lastFocus = document.activeElement;

    lbMeta.innerHTML = data.meta || '';
    lbTitle.textContent = data.title || '';
    lbDesc.textContent = data.desc || '';
    lbMedia.innerHTML = '';

    if (data.type === 'video') {
      var video = document.createElement('video');
      video.src = data.src;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', data.title || 'Video');
      if (data.poster) video.poster = data.poster;
      lbMedia.appendChild(video);
      currentVideo = video;
    } else {
      var img = document.createElement('img');
      img.src = data.src;
      img.alt = data.title || 'Karya';
      lbMedia.appendChild(img);
    }

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    window.setTimeout(function () { lbClose.focus(); }, 60);
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('is-open')) return;

    if (currentVideo) {
      currentVideo.pause();
      currentVideo.removeAttribute('src');
      currentVideo.load();
      currentVideo = null;
    }

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');

    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  // Delegated: cards are rendered after load, so bind on the container.
  if (grid) {
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.card');
      if (!card) return;

      openLightbox({
        type: card.getAttribute('data-type'),
        src: card.getAttribute('data-src'),
        title: card.getAttribute('data-title'),
        desc: card.getAttribute('data-desc'),
        meta: card.getAttribute('data-meta'),
        poster: card.querySelector('img') ? card.querySelector('img').src : ''
      });
    });
  }

  var featuredBtn = document.querySelector('[data-open="featured-video"]');
  if (featuredBtn) {
    featuredBtn.addEventListener('click', function () {
      openLightbox({
        type: 'video',
        src: 'assets/video/jesralll-done.mp4',
        poster: 'assets/video/jesralll.jpg',
        title: 'Cinematic Edit + Visual FX',
        meta: 'Video · Cinematic · VFX',
        desc: 'Editing visual cinematic yang dipadukan dengan visual effect untuk media otomotif. Tujuan utamanya menaikkan engagement konten.'
      });
    });
  }

  lbClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }

    if (e.key === 'Tab' && lightbox.classList.contains('is-open')) {
      var focusables = lightbox.querySelectorAll('button, a, video, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------------------------------------------------------------
     Custom cursor (desktop)
     --------------------------------------------------------------- */
  if (canHover && !reduceMotion) {
    var cursor = document.querySelector('.cursor');
    var dot = cursor.querySelector('.cursor-dot');
    var ring = cursor.querySelector('.cursor-ring');

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;
    var started = false;

    document.body.classList.add('has-cursor');

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate3d(' + mouseX + 'px,' + mouseY + 'px,0)';

      if (!started) {
        started = true;
        ringX = mouseX;
        ringY = mouseY;
      }
    }, { passive: true });

    (function loop() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = 'translate3d(' + ringX.toFixed(2) + 'px,' + ringY.toFixed(2) + 'px,0)';
      window.requestAnimationFrame(loop);
    })();

    var hoverables = 'a, button, .card, .skill, .filter, .contact-list a';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverables)) cursor.classList.remove('is-hover');
    });

    // Invert cursor on dark sections
    var darkSections = document.querySelectorAll('.hero, .skills, .featured, .site-footer, .lightbox');
    document.addEventListener('mousemove', function (e) {
      var isDark = false;
      darkSections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right) {
          isDark = true;
        }
      });
      cursor.classList.toggle('is-dark', isDark);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     Active nav link while scrolling
     --------------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav a');

  if ('IntersectionObserver' in window && navLinks.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.style.color = link.getAttribute('href') === '#' + id ? 'var(--amber)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------------------------------------------------------------
     Brand click — replay the whole entrance animation
     Same sequence a first-time visitor sees on page load.
     --------------------------------------------------------------- */
  var brand = document.querySelector('.brand');

  function replayIntro() {
    if (reduceMotion) return;

    // Drop every reveal class and re-arm the scroll observer, so sections
    // below the hero animate again instead of staying hidden.
    revealTargets.forEach(function (el) { el.classList.remove('is-in'); });

    if (typeof io === 'object' && io && typeof io.observe === 'function') {
      revealTargets.forEach(function (el) { io.observe(el); });
    }

    // Restart the hero marquee and slideshow from the first frame.
    var track = document.querySelector('.marquee-track');
    if (track) {
      track.style.animation = 'none';
      void track.offsetWidth;
      track.style.animation = '';
    }

    if (slides.length > 1) {
      slides.forEach(function (img, i) { img.classList.toggle('is-active', i === 0); });
      slideIndex = 0;
      startSlides();
    }

    window.setTimeout(function () {
      var heroItems = document.querySelectorAll('.hero .mask, .hero .clip-reveal, .hero .reveal');
      heroItems.forEach(function (el) { el.classList.add('is-in'); });
    }, 60);
  }

  if (brand) {
    brand.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

      // Wait for the scroll to land before replaying, otherwise the reset
      // happens off-screen and the user only catches the tail of it.
      window.setTimeout(replayIntro, reduceMotion ? 0 : 520);
    });
  }

})();
