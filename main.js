
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
            ? 'M6 18L18 6M6 6l12 12'
            : 'M4 7h16M4 12h16M4 17h16');
        }
      });
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

    // ---------- Reveal on scroll ----------
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

    // ---------- Decorative root spine ----------
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
      showToast(name + ' adicionada ao carrinho!');
    }

    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.name, btn.dataset.price);
        btn.style.transform = 'scale(0.88)';
        setTimeout(() => { btn.style.transform = ''; }, 300);
      });
    });

    document.querySelectorAll('.cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const total = cart.reduce((a, i) => a + i.qty, 0);
        showToast(total === 0 ? 'O carrinho está vazio.' : total + ' item(s) no carrinho.');
      });
    });

    updateCartBadge();

    // ---------- Filter buttons ----------
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
            card.style.opacity = match ? '1' : '0';
            card.style.transform = match ? '' : 'scale(0.93)';
            card.style.pointerEvents = match ? '' : 'none';
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
        x: Math.random() * W, y: Math.random() * H,
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
          ctx.fillStyle = 'rgba(246,242,232,' + p.alpha + ')';
          ctx.fill();
          p.x += p.vx; p.y += p.vy;
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

    // ---------- WhatsApp floating button ----------
    const WA_NUMBER = '5514997762225';
    const WA_MSG = encodeURIComponent('Olá! Vi o site da Casa das Mudas e gostaria de saber mais sobre as mudas disponíveis.');

    const waStyle = document.createElement('style');
    waStyle.textContent = `
      .wa-float {
        position: fixed;
        bottom: 1.75rem;
        left: 1.5rem;
        z-index: 200;
        display: flex;
        align-items: center;
        gap: 0;
        text-decoration: none;
        filter: drop-shadow(0 8px 24px rgba(37,211,102,0.45));
        animation: waEntrance 0.7s cubic-bezier(.34,1.56,.64,1) 1.2s both;
      }
      @keyframes waEntrance {
        from { opacity: 0; transform: translateY(30px) scale(0.7); }
        to   { opacity: 1; transform: translateY(0)   scale(1);   }
      }
      .wa-float:hover .wa-label {
        max-width: 180px;
        opacity: 1;
        padding: 0 0.875rem 0 0.625rem;
      }
      .wa-float:hover .wa-btn {
        border-radius: 9999px 0 0 9999px;
      }
      .wa-btn {
        width: 3.25rem;
        height: 3.25rem;
        background: #25D366;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-radius 0.35s cubic-bezier(.22,.61,.36,1), transform 0.35s cubic-bezier(.34,1.56,.64,1);
        flex-shrink: 0;
        position: relative;
      }
      .wa-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: #25D366;
        animation: waPulse 2.5s ease-out infinite;
        z-index: -1;
      }
      @keyframes waPulse {
        0%   { transform: scale(1);   opacity: 0.6; }
        70%  { transform: scale(1.55); opacity: 0;  }
        100% { transform: scale(1.55); opacity: 0;  }
      }
      .wa-float:hover .wa-btn { transform: scale(1.08); }
      .wa-label {
        background: #25D366;
        color: #fff;
        font-family: 'Inter', system-ui, sans-serif;
        font-weight: 600;
        font-size: 0.875rem;
        white-space: nowrap;
        height: 3.25rem;
        display: flex;
        align-items: center;
        border-radius: 0 9999px 9999px 0;
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        padding: 0;
        transition: max-width 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.35s ease, padding 0.35s cubic-bezier(.22,.61,.36,1);
      }
      @media (prefers-reduced-motion: reduce) {
        .wa-float { animation: none; }
        .wa-btn::after { animation: none; }
      }
    `;
    document.head.appendChild(waStyle);

    const waLink = document.createElement('a');
    waLink.className = 'wa-float';
    waLink.href = 'https://wa.me/' + WA_NUMBER + '?text=' + WA_MSG;
    waLink.target = '_blank';
    waLink.rel = 'noopener noreferrer';
    waLink.setAttribute('aria-label', 'Falar pelo WhatsApp');
    waLink.innerHTML = `
      <span class="wa-btn" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.41A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm5.007 14.2c-.207.582-1.21 1.113-1.658 1.148-.448.036-.862.213-2.91-.606-2.46-1-4.01-3.51-4.13-3.67-.12-.16-.98-1.3-.98-2.48 0-1.18.62-1.76.84-2 .22-.24.48-.3.64-.3h.46c.15 0 .35-.06.55.42l.7 1.86c.07.18.03.38-.08.54l-.38.5c-.14.18-.29.38-.12.66.38.64.9 1.22 1.47 1.71.56.47 1.2.8 1.88.97.24.06.4 0 .54-.14l.54-.64c.14-.18.32-.22.5-.16l1.84.87c.18.08.3.22.3.4-.02.56-.2 1.1-.5 1.57Z"/>
        </svg>
      </span>
      <span class="wa-label">Fale conosco!</span>
    `;
    document.body.appendChild(waLink);

  })();
  