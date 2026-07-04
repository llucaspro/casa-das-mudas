
  (function(){
    'use strict';

    // Navbar scroll
    const navbar=document.getElementById('navbar');
    if(navbar) window.addEventListener('scroll',()=>navbar.classList.toggle('scrolled',scrollY>20),{passive:true});

    // Mobile menu
    const menuToggle=document.getElementById('menuToggle');
    const mobileMenu=document.getElementById('mobileMenu');
    const menuIcon=document.getElementById('menuIconPath');
    if(menuToggle&&mobileMenu){
      menuToggle.addEventListener('click',()=>{
        const open=mobileMenu.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded',open);
        if(menuIcon) menuIcon.setAttribute('d',open?'M6 18L18 6M6 6l12 12':'M4 7h16M4 12h16M4 17h16');
      });
      mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
        mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded','false');
        if(menuIcon) menuIcon.setAttribute('d','M4 7h16M4 12h16M4 17h16');
      }));
    }

    // Reveal on scroll
    const revealEls=document.querySelectorAll('.reveal');
    if(revealEls.length){
      const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -40px 0px'});
      revealEls.forEach(el=>io.observe(el));
    }

    // Spine scroll progress
    const spinePath=document.getElementById('spinePath');
    if(spinePath){
      const len=spinePath.getTotalLength();
      spinePath.style.strokeDasharray=len;
      spinePath.style.strokeDashoffset=len;
      window.addEventListener('scroll',()=>{
        const pct=scrollY/(document.body.scrollHeight-innerHeight);
        spinePath.style.strokeDashoffset=len*(1-pct);
      },{passive:true});
    }

    // Cart
    let cart=JSON.parse(localStorage.getItem('cdm_cart')||'[]');
    function updateBadge(){
      const n=cart.reduce((a,i)=>a+i.qty,0);
      document.querySelectorAll('.cart-badge').forEach(el=>{el.textContent=n;el.classList.toggle('show',n>0)});
    }
    function showToast(msg){
      const t=document.getElementById('toast');
      if(!t) return;
      t.querySelector('.toast-msg').textContent=msg;
      t.classList.add('show');
      setTimeout(()=>t.classList.remove('show'),2800);
    }
    document.querySelectorAll('.add-btn').forEach(btn=>btn.addEventListener('click',()=>{
      const n=btn.dataset.name,p=btn.dataset.price;
      const ex=cart.find(i=>i.name===n);
      if(ex) ex.qty++; else cart.push({name:n,price:p,qty:1});
      localStorage.setItem('cdm_cart',JSON.stringify(cart));
      updateBadge();
      showToast(n+' adicionada ao carrinho!');
      btn.style.transform='scale(.88)';
      setTimeout(()=>btn.style.transform='',300);
    }));
    document.querySelectorAll('.cart-btn').forEach(btn=>btn.addEventListener('click',()=>{
      const n=cart.reduce((a,i)=>a+i.qty,0);
      showToast(n===0?'O carrinho está vazio.':n+' item(s) no carrinho.');
    }));
    updateBadge();

    // Filter buttons
    const filterBtns=document.querySelectorAll('.filter-btn');
    const catalogCards=document.querySelectorAll('.catalog-item');
    if(filterBtns.length&&catalogCards.length){
      filterBtns.forEach(btn=>btn.addEventListener('click',()=>{
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const cat=btn.dataset.filter;
        catalogCards.forEach(card=>{
          const match=cat==='todas'||card.dataset.cat===cat;
          card.style.transition='opacity .35s,transform .35s';
          card.style.opacity=match?'1':'0';
          card.style.transform=match?'':'scale(.93)';
          card.style.pointerEvents=match?'':'none';
        });
      }));
    }

    // Count-up
    const counters=document.querySelectorAll('.count-up');
    if(counters.length){
      const ioC=new IntersectionObserver(entries=>entries.forEach(e=>{
        if(!e.isIntersecting) return;
        const el=e.target,target=parseInt(el.dataset.target),suffix=el.dataset.suffix||'';
        let start=0;
        const step=ts=>{
          if(!start) start=ts;
          const p=Math.min((ts-start)/1800,1);
          el.textContent=Math.round((1-Math.pow(1-p,3))*target).toLocaleString('pt-BR')+suffix;
          if(p<1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        ioC.unobserve(el);
      }),{threshold:.5});
      counters.forEach(el=>ioC.observe(el));
    }

    // Contact form
    const form=document.getElementById('contactForm');
    if(form) form.addEventListener('submit',e=>{e.preventDefault();showToast('Mensagem enviada! Entraremos em contato em breve.');form.reset()});

    // Floating particles (hero only)
    const canvas=document.getElementById('particleCanvas');
    if(canvas){
      const ctx=canvas.getContext('2d');
      let W=canvas.width=innerWidth,H=canvas.height=innerHeight;
      const pts=Array.from({length:28},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2.5+.5,vx:(Math.random()-.5)*.4,vy:-Math.random()*.6-.2,a:Math.random()*.35+.05}));
      (function draw(){
        ctx.clearRect(0,0,W,H);
        pts.forEach(p=>{
          ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle='rgba(246,242,232,'+p.a+')';ctx.fill();
          p.x+=p.vx;p.y+=p.vy;
          if(p.y<-10){p.y=H+10;p.x=Math.random()*W}
          if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;
        });
        requestAnimationFrame(draw);
      })();
      window.addEventListener('resize',()=>{W=canvas.width=innerWidth;H=canvas.height=innerHeight});
    }

    // Remove intro overlay after animation ends
    const intro=document.getElementById('intro');
    if(intro){
      intro.addEventListener('animationend',()=>{intro.style.display='none'},{once:true});
    }

    // details FAQ arrow
    document.querySelectorAll('details').forEach(d=>{
      d.addEventListener('toggle',()=>{
        const svg=d.querySelector('summary svg');
        if(svg) svg.style.transform=d.open?'rotate(180deg)':'';
      });
    });

  })();
  