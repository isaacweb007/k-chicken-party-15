(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- nav scroll state ----- */
  var nav = document.getElementById('nav');
  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ----- mobile menu ----- */
  var burger = document.getElementById('burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav__mobile a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ----- reveal on scroll ----- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ----- hero parallax (transform-only, rAF-throttled) ----- */
  var heroMedia = document.getElementById('heroMedia');
  if (heroMedia && !prefersReduced) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroMedia.style.transform = 'translateY(' + y * 0.28 + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ----- hero video: graceful fallback to poster ----- */
  var video = document.getElementById('heroVideo');
  if (video) {
    if (prefersReduced) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      var p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { /* autoplay blocked: poster remains */ });
      }
      // save bandwidth: pause when hero is off-screen
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { video.play().catch(function () {}); }
            else { video.pause(); }
          });
        }, { threshold: 0.05 }).observe(video);
      }
    }
  }
})();
