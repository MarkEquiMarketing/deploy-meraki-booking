/* ============================================================
   MERAKI — SHARED BEHAVIOURS  (meraki.js)
   Pair with /assets/meraki.css. Every block is defensive: if a
   page doesn't use a component, that block simply does nothing.
   Honours prefers-reduced-motion and (hover:hover) where it matters.
   ============================================================ */
(function () {
  function init() {
    var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

    /* icons (Lucide via CDN, loaded with defer) */
    if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();

    /* reveal on scroll */
    var rvs = document.querySelectorAll('.rv');
    if (rvs.length) {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { threshold: .16 });
        rvs.forEach(function (el) { io.observe(el); });
      } else {
        rvs.forEach(function (el) { el.classList.add('in'); });
      }
    }

    /* sticky top bar + scroll progress */
    var tb = document.getElementById('topbar'), pr = document.getElementById('progress');
    if (tb || pr) {
      var onScroll = function () {
        if (tb) tb.classList.toggle('scrolled', scrollY > 40);
        if (pr) {
          var h = document.documentElement.scrollHeight - innerHeight;
          pr.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
        }
      };
      onScroll();
      addEventListener('scroll', onScroll, { passive: true });
    }

    /* hero background video — force autoplay where allowed */
    var v = document.querySelector('.hero-media video');
    if (v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }

    /* 3D tilt cards + magnetic buttons (pointer-fine only) */
    if (fine && !reduce) {
      document.querySelectorAll('.tilt').forEach(function (card) {
        var glare = card.querySelector('.glare');
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.transform = 'rotateY(' + (px - .5) * 9 + 'deg) rotateX(' + (.5 - py) * 9 + 'deg)';
          if (glare) { glare.style.setProperty('--gx', px * 100 + '%'); glare.style.setProperty('--gy', py * 100 + '%'); }
        });
        card.addEventListener('pointerleave', function () { card.style.transform = ''; });
      });
      document.querySelectorAll('.mag').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .28 + 'px,' + (e.clientY - r.top - r.height / 2) * .4 + 'px)';
        });
        el.addEventListener('pointerleave', function () { el.style.transform = ''; });
      });
    }

    /* accordion / FAQ */
    document.querySelectorAll('.acc-trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.acc-item');
        if (item) item.classList.toggle('open');
      });
    });

    /* lightbox — [data-video] and [data-img] triggers */
    var lb = document.getElementById('lb'), lbc = document.getElementById('lbContent');
    if (lb && lbc) {
      var open = function (html) { lbc.innerHTML = html; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); };
      var close = function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbc.innerHTML = ''; };
      document.querySelectorAll('[data-video]').forEach(function (el) {
        var go = function () { open('<video src="' + el.dataset.video + '" controls autoplay playsinline preload="none"></video>'); };
        el.addEventListener('click', go);
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      document.querySelectorAll('[data-img]').forEach(function (el) {
        var go = function () { open('<img src="' + el.dataset.img + '" alt="' + (el.dataset.alt || '') + '">'); };
        el.addEventListener('click', go);
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      document.querySelectorAll('[data-vimeo]').forEach(function (el) {
        var go = function () { open('<iframe src="https://player.vimeo.com/video/' + el.dataset.vimeo + '?autoplay=1&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'); };
        el.addEventListener('click', go);
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      var lbClose = document.getElementById('lbClose');
      if (lbClose) lbClose.addEventListener('click', close);
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
