/* ===========================================================================
   Anomaly (ANM) — Advertorial LP
   1) Load editable links from data/links.json and wire them onto the page
   2) FAQ accordion (accessible, keyboard-operable)
   3) GSAP scroll reveals + stat count-up (reduced-motion aware)
   =========================================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year (runs regardless of motion preference) */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------------------
     1) LINKS — data/links.json drives every CTA & legal link.
        Elements opt in with:
          data-link="a.b.c"        -> sets href from that path in the JSON
          data-link-label="a.b.c"  -> sets the element's text from that path
     ------------------------------------------------------------------------- */
  function resolve(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] != null ? acc[key] : undefined;
    }, obj);
  }

  /* Forward UTMs from this landing page's URL onto outbound checkout links,
     so GA4 on tryanomalyhealth.com can attribute the sale to the same
     campaign that drove the visit here. Pricing CTAs additionally get a
     utm_content identifying which plan was clicked (twelve_week/adults/family),
     since all three share the same incoming utm_campaign. */
  var TRACKED_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign'];

  function withForwardedParams(url, planContent) {
    var incoming = new URLSearchParams(window.location.search);
    var extra = TRACKED_PARAMS.filter(function (key) { return incoming.has(key); });
    if (!extra.length && !planContent) return url;

    var target;
    try {
      target = new URL(url, window.location.href);
    } catch (e) {
      return url;
    }
    extra.forEach(function (key) { target.searchParams.set(key, incoming.get(key)); });
    if (planContent && extra.length) target.searchParams.set('utm_content', planContent);
    return target.href;
  }

  function planContentFor(linkPath) {
    var match = /^plans\.([^.]+)\.url$/.exec(linkPath || '');
    return match ? match[1] : null;
  }

  function applyLinks(data) {
    document.querySelectorAll('[data-link]').forEach(function (el) {
      var linkPath = el.getAttribute('data-link');
      var url = resolve(data, linkPath);
      if (typeof url === 'string' && url.length) {
        el.setAttribute('href', withForwardedParams(url, planContentFor(linkPath)));
      }
    });
    document.querySelectorAll('[data-link-label]').forEach(function (el) {
      var label = resolve(data, el.getAttribute('data-link-label'));
      if (typeof label === 'string' && label.length) el.textContent = label;
    });
  }

  fetch('data/links.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(applyLinks)
    .catch(function () {
      /* file:// blocks fetch — CTAs keep their fallback href="#". See README. */
      console.info('[anomaly] links.json not loaded (serve over http to enable). Using fallbacks.');
    });

  /* ---------------------------------------------------------------------------
     2) FAQ ACCORDION
     ------------------------------------------------------------------------- */
  document.querySelectorAll('[data-accordion] .accordion__trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Keep an open panel sized correctly on resize (e.g. rotate/text reflow)
    window.addEventListener('resize', function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------------------------------------------------------------------------
     3) MOTION — reveals + count-up
     ------------------------------------------------------------------------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-countup]'));

  // Reduced motion (or no GSAP): show everything immediately, no animation.
  if (prefersReduced || !window.gsap) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Group reveals by their nearest section so siblings stagger together.
  var groups = new Map();
  reveals.forEach(function (el) {
    var section = el.closest('section') || document.body;
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(el);
  });

  groups.forEach(function (items, section) {
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        once: true
      },
      onStart: function () { items.forEach(function (el) { el.classList.add('is-in'); }); }
    });
  });

  // Count-up for stat numbers (70% / 95%). Animates once on scroll-in.
  counters.forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var suffix = el.getAttribute('data-count-suffix') || '';
    var state = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        gsap.to(state, {
          v: target,
          duration: 1.1,
          ease: 'power1.out',
          onUpdate: function () { el.textContent = Math.round(state.v) + suffix; }
        });
      }
    });
  });
})();
