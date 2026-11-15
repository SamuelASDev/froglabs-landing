(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tela de título ---------- */
  const title = $('#title'), hud = $('#hud');
  let entered = false;
  document.body.classList.add('locked');
  const sfx = window.SFX;
  sfx.setTheme(FL.theme);
  FL.on(({ theme }) => sfx.setTheme(theme));
  addEventListener('pointerdown', () => sfx.start());
  addEventListener('keydown', () => sfx.start());
  const enter = () => {
    if (entered) return;
    sfx.start(); sfx.enter();
    entered = true;
    title.classList.add('gone');
    document.body.classList.remove('locked');
    hud.classList.add('show');
    burst(innerWidth / 2, innerHeight * .55, 60);
    setTimeout(() => title.remove(), 1500);
  };
  ['keydown', 'pointerdown'].forEach(ev => addEventListener(ev, enter, { once: false }));
  // link direto para uma seção? pula o título
  if (location.hash && location.hash.length > 1) setTimeout(enter); // depois de tudo inicializado

  /* botão de som */
  const soundBtn = $('#sound');
  const paintSound = () => {
    soundBtn.classList.toggle('off', !sfx.on);
    soundBtn.setAttribute('aria-pressed', sfx.on);
    soundBtn.setAttribute('aria-label', sfx.on ? 'Som ligado' : 'Som desligado');
  };
  paintSound();
  soundBtn.addEventListener('click', () => { sfx.toggle(); paintSound(); });
  $$('.rest-menu a, .hud__nav a').forEach(a => a.addEventListener('pointerenter', () => sfx.tick()));

  /* ---------- brasas (moeda) ---------- */
  let souls = 0;
  const soulsEl = $('#souls'), soulsBox = $('.hud__souls');
  const addSouls = n => {
    const from = souls; souls += n;
    soulsBox.classList.remove('bump'); void soulsBox.offsetWidth; soulsBox.classList.add('bump');
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / 700);
      soulsEl.textContent = Math.round(from + (souls - from) * p).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- revelar ao rolar + brasas por seção ---------- */
  $$('.section__head, .panel, .msg, .closing').forEach(el => el.classList.add('reveal'));
  const seen = new Set();
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.id === 'stats') e.target.classList.add('in');
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal, #stats').forEach(el => io.observe(el));

  const navLinks = $$('.hud__nav a');
  const secIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
    if (!seen.has(id)) { seen.add(id); if (entered) addSouls(100); }
  }), { threshold: .3 });
  $$('section[id]').forEach(s => secIO.observe(s));

  $$('.travel, .warp, .code').forEach(a => a.addEventListener('click', () => { addSouls(250); sfx.travel(); }));

  /* ---------- banner grande (easter eggs) ---------- */
  const banner = $('#banner');
  let bannerTimer;
  const showBanner = (kind, text, sub) => {
    clearTimeout(bannerTimer);
    banner.className = 'banner-big ' + kind;
    $('.banner-big__text', banner).textContent = text;
    $('.banner-big__sub', banner).textContent = sub;
    banner.hidden = false;
    // reinicia as animações
    $$('*', banner).concat(banner).forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    bannerTimer = setTimeout(() => { banner.hidden = true; }, 4600);
  };

  /* baú mímico */
  const chest = $('#chest');
  chest.addEventListener('click', () => {
    document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
    const lost = souls; sfx.died();
    souls = 0; soulsEl.textContent = '0';
    const u = FL.ui();
    showBanner('died', u.died[0], lost ? u.died[1].replace('{n}', lost.toLocaleString(FL.lang === 'en' ? 'en-US' : 'pt-BR')) : u.died[2]);
    const lbl = $('span', chest);
    lbl.removeAttribute('data-k'); lbl.textContent = u.again;
  });

  /* mensagens: avaliar todas = vitória */
  const msgs = $$('.msg');
  let rated = 0, won = false;
  const paintRate = () => {
    const u = FL.ui();
    $$('.msg__rate').forEach(b => { b.children[0].textContent = u.good; b.children[1].textContent = u.bad; });
    soulsBox.title = u.cur;
    const lbl = $('.chest > span');
    if (lbl && !lbl.hasAttribute('data-k')) lbl.textContent = u.again;
  };
  msgs.forEach(m => {
    const box = document.createElement('div');
    box.className = 'msg__rate';
    box.innerHTML = '<button type="button"></button><button type="button"></button>';
    const done = document.createElement('span');
    done.className = 'msg__done';
    m.append(box, done);
    box.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || m.classList.contains('rated')) return;
      m.classList.add('rated'); b.classList.add('chosen');
      const replies = FL.ui().replies;
      done.textContent = replies[Math.floor(Math.random() * replies.length)];
      const r = m.getBoundingClientRect();
      burst(r.left + r.width / 2, r.bottom - 10, 18);
      addSouls(50); sfx.rate();
      if (++rated === msgs.length && !won) {
        won = true;
        setTimeout(() => {
          const u = FL.ui();
          showBanner('won', u.won[0], u.won[1]);
          addSouls(1000); sfx.won();
          burst(innerWidth / 2, innerHeight / 2, 120);
        }, 600);
      }
    });
  });

  paintRate();

  /* ---------- partículas (cor e jeito mudam com o tema) ---------- */
  const cv = $('#embers'), ctx = cv.getContext('2d');
  // partícula pré-desenhada uma vez só (bem mais barato que um gradiente por partícula por quadro)
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
  const FX = {
    souls: { c: ['255,220,150', '232,116,59'], speed: 1, ring: false },
    p3: { c: ['235,250,255', '90,200,255'], speed: .55, ring: true },
    op: { c: ['255,250,225', '255,205,90'], speed: .4, ring: false }
  };
  let fx = FX.souls;
  const paintSprite = () => {
    fx = FX[FL.theme] || FX.souls;
    const sc = sprite.getContext('2d');
    sc.clearRect(0, 0, 32, 32);
    const g = sc.createRadialGradient(16, 16, 0, 16, 16, 16);
    if (fx.ring) { // bolha: borda clara, centro vazio
      g.addColorStop(0, `rgba(${fx.c[1]},.05)`); g.addColorStop(.6, `rgba(${fx.c[1]},.15)`);
      g.addColorStop(.8, `rgba(${fx.c[0]},.9)`); g.addColorStop(1, `rgba(${fx.c[1]},0)`);
    } else {
      g.addColorStop(0, `rgba(${fx.c[0]},1)`); g.addColorStop(.35, `rgba(${fx.c[1]},.6)`); g.addColorStop(1, `rgba(${fx.c[1]},0)`);
    }
    sc.fillStyle = g; sc.fillRect(0, 0, 32, 32);
  };
  paintSprite();
  FL.on(() => { paintSprite(); paintRate(); });
  let W, H, dpr, parts = [];
  const resize = () => {
    dpr = 1; // partículas são borradas, não precisam de resolução alta
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
  };
  resize(); addEventListener('resize', resize);
  const base = innerWidth < 600 ? 14 : 30;

  /* vídeo da fogueira só roda quando está na tela */
  const vid = $('.fire__img');
  if (vid && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? vid.play().catch(() => {}) : vid.pause(); }).observe(vid);
  }
  const spawn = (x, y, burstMode) => ({
    x: x ?? Math.random() * W, y: y ?? H + Math.random() * H * .3,
    vx: burstMode ? (Math.random() - .5) * 4 * dpr : (Math.random() - .5) * .3 * dpr,
    vy: burstMode ? -(Math.random() * 4 + 1) * dpr : -(Math.random() * .7 + .25) * dpr,
    r: (Math.random() * 1.8 + .6) * dpr, life: 1, decay: burstMode ? .012 + Math.random() * .015 : 0,
    wob: Math.random() * 6.28, burst: burstMode
  });
  for (let i = 0; i < base; i++) { const p = spawn(); p.y = Math.random() * H; parts.push(p); }
  function burst(x, y, n) {
    if (reduced) return;
    for (let i = 0; i < n; i++) parts.push(spawn(x * dpr, y * dpr, true));
  }
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    parts = parts.filter(p => {
      p.wob += .03; p.x += p.vx + Math.sin(p.wob) * .25 * dpr; p.y += p.burst ? p.vy : p.vy * fx.speed;
      if (p.burst) { p.vy += .03 * dpr; p.vx *= .98; p.life -= p.decay; }
      if (p.life <= 0) return false;
      if (!p.burst && p.y < -20) { Object.assign(p, spawn()); }
      ctx.globalAlpha = p.burst ? p.life : Math.min(1, p.y / H + .2);
      const s = p.r * 8;
      ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      return true;
    });
    if (!document.hidden) requestAnimationFrame(tick);
  };
  if (!reduced) {
    requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(tick); });
  }
})();
