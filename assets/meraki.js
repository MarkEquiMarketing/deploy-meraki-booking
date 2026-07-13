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

    /* ticketing: choose-your-night toggle (lazy-loads inactive shop, keeps state when switching) */
    var nightBtns = document.querySelectorAll('.nights [data-pane]');
    if (nightBtns.length) {
      var checkoutTracked = false;
      nightBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          nightBtns.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
          document.querySelectorAll('.shop-frame .pane').forEach(function (p) {
            var active = p.id === btn.dataset.pane;
            p.hidden = !active;
            if (active) {
              var f = p.querySelector('iframe[data-src]');
              if (f) { f.src = f.dataset.src; f.removeAttribute('data-src'); }
            }
          });
          if (!checkoutTracked && window.fbq) { fbq('track', 'InitiateCheckout'); checkoutTracked = true; }
        });
      });
    }

    /* countdown — <div class="count" data-until="2026-10-02"> */
    var cd = document.querySelector('.count[data-until]');
    if (cd) {
      var units = ['days', 'hours', 'mins'];
      var tick = function () {
        var diff = new Date(cd.dataset.until + 'T00:00:00') - new Date();
        if (diff < 0) diff = 0;
        var d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5), m = Math.floor(diff % 36e5 / 6e4);
        var vals = { days: d, hours: h, mins: m };
        units.forEach(function (u) {
          var el = cd.querySelector('[data-u="' + u + '"]');
          if (el) el.textContent = String(vals[u]).padStart(2, '0');
        });
      };
      tick();
      setInterval(tick, 30000);
    }

    /* honest FOMO toasts — reads window.merakiToasts (array of strings) set by the page.
       LEGAL NOTE (NL/BE misleading-practices rules): only verifiable/true messages, or REAL
       anonymised purchase data. Never invent names or purchases. */
    var toastMsgs = window.merakiToasts;
    var toastEl = document.getElementById('fomoToast');
    if (toastEl && Array.isArray(toastMsgs) && toastMsgs.length && !reduce) {
      var ti = 0, shown = 0, MAX = 3;
      var toastP = toastEl.querySelector('p');
      var hideToast = function () { toastEl.classList.remove('show'); };
      var showToast = function () {
        if (shown >= MAX || ti >= toastMsgs.length) return;
        toastP.textContent = toastMsgs[ti++]; shown++;
        toastEl.classList.add('show');
        setTimeout(hideToast, 7000);
        if (shown < MAX && ti < toastMsgs.length) setTimeout(showToast, 26000);
      };
      var tc = toastEl.querySelector('.close');
      if (tc) tc.addEventListener('click', function () { hideToast(); shown = MAX; });
      setTimeout(showToast, 9000);
    }

    /* mobile buy-bar — hide while the shop (or footer) is on screen */
    var bb = document.querySelector('.buybar');
    if (bb && 'IntersectionObserver' in window) {
      var watch = document.querySelectorAll('#tickets, .foot');
      if (watch.length) {
        var visible = new Set();
        var bio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
          bb.classList.toggle('hide', visible.size > 0);
        }, { threshold: .08 });
        watch.forEach(function (el) { bio.observe(el); });
      }
    }

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
