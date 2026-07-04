(function(){
    'use strict';

    /* ── Intro splash: JS-controlled fade — no CSS timing bugs ── */
    (function(){
      var intro = document.getElementById('intro');
      if (!intro) return;
      var done = false;
      function dismiss() {
        if (done) return;
        done = true;
        intro.classList.add('intro-hiding');
        var clean = function(){ if (intro.parentNode) intro.parentNode.removeChild(intro); };
        intro.addEventListener('transitionend', clean, { once: true });
        setTimeout(clean, 1200); // fallback: remove after transition should be done
      }
      // Show intro for 3.2s, then fade gracefully
      setTimeout(dismiss, 3200);
      // Also allow tapping the intro to skip it
      intro.addEventListener('click', dismiss, { once: true });
    })();

    /* ── WA button: appear after intro is gone ── */
    (function(){
      var wa = document.querySelector('.wa-float');
      if (!wa) return;
      setTimeout(function(){ wa.classList.add('wa-visible'); }, 4000);
    })();

    /* ── Navbar scroll shadow ── */
    var navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', function(){
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    /* ── Mobile menu ── */
    var menuToggle = document.getElementById('menuToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    var menuIcon   = document.getElementById('menuIconPath');
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function(){
        var open = mobileMenu.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', open);
        if (menuIcon) menuIcon.setAttribute('d', open
          ? 'M6 18L18 6M6 6l12 12'
          : 'M4 7h16M4 12h16M4 17h16');
      });
      mobileMenu.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          if (menuIcon) menuIcon.setAttribute('d', 'M4 7h16M4 12h16M4 17h16');
        });
      });
    }

    /* ── Reveal on scroll ── */
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function(el){ io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add('visible'); });
    }

    /* ── Spine scroll progress ── */
    var spinePath = document.getElementById('spinePath');
    if (spinePath) {
      var len = spinePath.getTotalLength();
      spinePath.style.strokeDasharray = len;
      spinePath.style.strokeDashoffset = len;
      window.addEventListener('scroll', function(){
        var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        spinePath.style.strokeDashoffset = len * (1 - pct);
      }, { passive: true });
    }

    /* ── Cart ── */
    var cart = [];
    try { cart = JSON.parse(localStorage.getItem('cdm_cart') || '[]'); } catch(e){}
    function updateBadge(){
      var n = cart.reduce(function(a,i){ return a + i.qty; }, 0);
      document.querySelectorAll('.cart-badge').forEach(function(el){
        el.textContent = n;
        el.classList.toggle('show', n > 0);
      });
    }
    function showToast(msg){
      var t = document.getElementById('toast');
      if (!t) return;
      t.querySelector('.toast-msg').textContent = msg;
      t.classList.add('show');
      clearTimeout(t._tid);
      t._tid = setTimeout(function(){ t.classList.remove('show'); }, 2800);
    }
    document.querySelectorAll('.add-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var n = btn.dataset.name, p = btn.dataset.price;
        var ex = cart.find(function(i){ return i.name === n; });
        if (ex) ex.qty++; else cart.push({ name: n, price: p, qty: 1 });
        try { localStorage.setItem('cdm_cart', JSON.stringify(cart)); } catch(e){}
        updateBadge();
        showToast(n + ' adicionada ao carrinho!');
        btn.style.transform = 'scale(.88)';
        setTimeout(function(){ btn.style.transform = ''; }, 300);
      });
    });
    document.querySelectorAll('.cart-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var n = cart.reduce(function(a,i){ return a + i.qty; }, 0);
        showToast(n === 0 ? 'O carrinho está vazio.' : n + ' item(s) no carrinho.');
      });
    });
    updateBadge();

    /* ── Filter buttons (catalog page) ── */
    var filterBtns   = document.querySelectorAll('.filter-btn');
    var catalogCards = document.querySelectorAll('.catalog-item');
    if (filterBtns.length && catalogCards.length) {
      filterBtns.forEach(function(btn){
        btn.addEventListener('click', function(){
          filterBtns.forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          var cat = btn.dataset.filter;
          catalogCards.forEach(function(card){
            var match = cat === 'todas' || card.dataset.cat === cat;
            card.style.transition = 'opacity .35s, transform .35s';
            card.style.opacity    = match ? '1' : '0';
            card.style.transform  = match ? '' : 'scale(.93)';
            card.style.pointerEvents = match ? '' : 'none';
          });
        });
      });
    }

    /* ── Count-up numbers ── */
    var counters = document.querySelectorAll('.count-up');
    if (counters.length && 'IntersectionObserver' in window) {
      var ioC = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (!e.isIntersecting) return;
          var el     = e.target;
          var target = parseInt(el.dataset.target, 10);
          var suffix = el.dataset.suffix || '';
          var start  = null;
          function step(ts){
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1800, 1);
            var v = Math.round((1 - Math.pow(1 - p, 3)) * target);
            el.textContent = v.toLocaleString('pt-BR') + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          ioC.unobserve(el);
        });
      }, { threshold: 0.5 });
      counters.forEach(function(el){ ioC.observe(el); });
    }

    /* ── Contact form ── */
    var form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', function(e){
        e.preventDefault();
        showToast('Mensagem enviada! Entraremos em contato em breve.');
        form.reset();
      });
    }

    /* ── Particle canvas (hero) ── */
    var canvas = document.getElementById('particleCanvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      var W = canvas.width  = window.innerWidth;
      var H = canvas.height = window.innerHeight;
      var pts = Array.from({ length: 24 }, function(){
        return {
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -Math.random() * 0.5 - 0.15,
          a: Math.random() * 0.25 + 0.05
        };
      });
      (function draw(){
        ctx.clearRect(0, 0, W, H);
        pts.forEach(function(p){
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(246,242,232,' + p.a + ')';
          ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          if (p.x < -10) p.x = W + 10;
          if (p.x > W + 10) p.x = -10;
        });
        requestAnimationFrame(draw);
      })();
      window.addEventListener('resize', function(){
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
      });
    }

    /* ── FAQ details arrow ── */
    document.querySelectorAll('details').forEach(function(d){
      d.addEventListener('toggle', function(){
        var svg = d.querySelector('summary svg');
        if (svg) svg.style.transform = d.open ? 'rotate(180deg)' : '';
      });
    });

  })();
  