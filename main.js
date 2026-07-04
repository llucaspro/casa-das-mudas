
  /* ======================================================
     Casa das Mudas — main.js
     Shared interactive logic for all pages
  ====================================================== */

  (function () {
    'use strict';

    // ---------- Navbar scroll shadow ----------
    const navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    // ---------- Mobile menu toggle ----------
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIconPath');
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        if (menuIcon) {
          menuIcon.setAttribute('d', isOpen
            ? 'M6 18L18 6M6 6l12 12'   // X
            : 'M4 7h16M4 12h16M4 17h16'); // hamburger
        }
      });
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          if (menuIcon) menuIcon.setAttribute('d', 'M4 7h16M4 12h16M4 17h16');
        });
      });
    }

    // ---------- Active nav link ----------
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    // ---------- Reveal on scroll (IntersectionObserver) ----------
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(el => io.observe(el));
    }

    // ---------- Decorative root spine (scroll progress) ----------
    const spinePath = document.getElementById('spinePath');
    if (spinePath) {
      const len = spinePath.getTotalLength();
      spinePath.style.strokeDasharray = len;
      spinePath.style.strokeDashoffset = len;
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        spinePath.style.strokeDashoffset = len * (1 - scrolled);
      }, { passive: true });
    }

    // ---------- Cart state ----------
    let cart = JSON.parse(localStorage.getItem('cdm_cart') || '[]');

    function updateCartBadge() {
      const count = cart.reduce((a, i) => a + i.qty, 0);
      document.querySelectorAll('.cart-badge').forEach(el => {
        el.textContent = count;
        el.classList.toggle('show', count > 0);
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.querySelector('.toast-msg').textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }

    function addToCart(name, price) {
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty++;
      else cart.push({ name, price, qty: 1 });
      localStorage.setItem('cdm_cart', JSON.stringify(cart));
      updateCartBadge();
      showToast(`${name} adicionada ao carrinho!`);
    }

    // Add-to-cart buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        addToCart(name, price);
        // micro-animation
        btn.style.transform = 'scale(0.88)';
        setTimeout(() => { btn.style.transform = ''; }, 300);
      });
    });

    // Cart drawer open (simple scroll-to placeholder)
    document.querySelectorAll('.cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (cart.length === 0) {
          showToast('O carrinho está vazio.');
        } else {
          showToast(`${cart.reduce((a,i)=>a+i.qty,0)} item(s) no carrinho.`);
        }
      });
    });

    updateCartBadge();

    // ---------- Filter buttons (catalog page) ----------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const catalogCards = document.querySelectorAll('.catalog-item');
    if (filterBtns.length && catalogCards.length) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.filter;
          catalogCards.forEach(card => {
            const match = cat === 'todas' || card.dataset.cat === cat;
            card.style.transition = 'opacity 0.35s, transform 0.35s';
            if (match) {
              card.style.opacity = '1';
              card.style.transform = '';
              card.style.pointerEvents = '';
              card.style.position = '';
            } else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.93)';
              card.style.pointerEvents = 'none';
            }
          });
        });
      });
    }

    // ---------- Counter animation ----------
    const counters = document.querySelectorAll('.count-up');
    if (counters.length) {
      const ioCounter = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          let start = 0;
          const duration = 1800;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target).toLocaleString('pt-BR') + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          ioCounter.unobserve(el);
        });
      }, { threshold: 0.5 });
      counters.forEach(el => ioCounter.observe(el));
    }

    // ---------- Contact form ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        showToast('Mensagem enviada! Entraremos em contato em breve.');
        contactForm.reset();
      });
    }

    // ---------- Floating particles (hero only) ----------
    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas) {
      const ctx = particleCanvas.getContext('2d');
      let W = particleCanvas.width = window.innerWidth;
      let H = particleCanvas.height = window.innerHeight;
      const particles = Array.from({ length: 28 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        alpha: Math.random() * 0.35 + 0.05,
      }));
      function drawParticles() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(246,242,232,${p.alpha})`;
          ctx.fill();
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          if (p.x < -10) p.x = W + 10;
          if (p.x > W + 10) p.x = -10;
        });
        requestAnimationFrame(drawParticles);
      }
      drawParticles();
      window.addEventListener('resize', () => {
        W = particleCanvas.width = window.innerWidth;
        H = particleCanvas.height = window.innerHeight;
      });
    }

  })();
  