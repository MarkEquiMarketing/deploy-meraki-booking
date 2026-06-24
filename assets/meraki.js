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

    /* floating embers */
    var eb = document.getElementById('embers');
    if (eb && !reduce) {
      for (var i = 0; i < 16; i++) {
        var s = document.createElement('i'), dur = 6 + Math.random() * 7;
        s.style.left = (Math.random() * 100) + '%';
        s.style.animationDuration = dur + 's';
        s.style.animationDelay = (-Math.random() * dur) + 's';
        s.style.transform = 'scale(' + (.6 + Math.random() * 1.4) + ')';
        eb.appendChild(s);
      }
    }

    /* fire cursor — embers trail the pointer and rise */
    var fire = document.getElementById('fire');
    if (fire && fine && !reduce) {
      var last = 0;
      addEventListener('pointermove', function (e) {
        var now = performance.now();
        if (now - last < 26) return;
        last = now;
        var sp = document.createElement('span');
        sp.className = 'spark';
        var sz = 3 + Math.random() * 6;
        sp.style.left = e.clientX + 'px'; sp.style.top = e.clientY + 'px';
        sp.style.width = sz + 'px'; sp.style.height = sz + 'px';
        sp.style.setProperty('--dx', ((Math.random() - .5) * 46) + 'px');
        fire.appendChild(sp);
        setTimeout(function () { sp.remove(); }, 900);
      }, { passive: true });
    }

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
      var lbClose = document.getElementById('lbClose');
      if (lbClose) lbClose.addEventListener('click', close);
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
