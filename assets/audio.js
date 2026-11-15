/* Trilhas e efeitos 100% sintetizados (Web Audio). Composições originais, sem arquivos de música.
   souls: drone sombrio + fogueira + sinos | p3: lo-fi noturno de piano elétrico | op: jiga marítima + ondas */
window.SFX = (() => {
  let ctx, master, fx, rev, started = false, on = true, theme = 'souls', scene = null;
  try { on = localStorage.getItem('fl-sound') !== 'off'; } catch (e) {}

  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  const noiseBuf = sec => {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };
  const reverb = () => {
    const len = ctx.sampleRate * 1.8, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const cv = ctx.createConvolver(); cv.buffer = b; return cv;
  };

  /* instrumentos */
  function bell(f, vol = .2, out = fx, dur = 2.5, t = ctx.currentTime) {
    [[1, 1], [2.76, .4], [5.4, .15]].forEach(([m, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * v, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur / m);
      o.connect(g).connect(out); o.start(t); o.stop(t + dur);
    });
  }
  function keys(f, vol, out, t, dur = 1.2) { // piano elétrico simples
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2; o2.detune.value = 6;
    lp.type = 'lowpass'; lp.frequency.value = 2200;
    const g2 = ctx.createGain(); g2.gain.value = .25;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); o2.connect(g2).connect(g); g.connect(lp).connect(out);
    o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur);
  }
  function pluck(f, vol, out, t, dur = .35, type = 'triangle') {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur);
  }
  function hit(out, t, { freq = 8000, vol = .08, dur = .05, type = 'highpass' } = {}) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf(dur + .02); f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(out); s.start(t);
  }
  function kick(out, t, vol = .5) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + .18);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .25);
    o.connect(g).connect(out); o.start(t); o.stop(t + .3);
  }

  /* sequenciador simples com lookahead */
  function sequencer(stepSec, onStep) {
    let next = ctx.currentTime + .15, i = 0, alive = true;
    const id = setInterval(() => {
      if (!alive) return;
      while (next < ctx.currentTime + .2) { onStep(i++, next); next += stepSec; }
    }, 40);
    return () => { alive = false; clearInterval(id); };
  }

  /* cenas */
  const SCENES = {
    souls(bus) {
      const stops = [];
      [[38, 'sine', .16], [45, 'triangle', .05], [50, 'sine', .07], [53, 'sine', .04], [57, 'sine', .025]].forEach(([n, type, g], i) => {
        [-4, 4].forEach(det => {
          const o = ctx.createOscillator(), gg = ctx.createGain(), lp = ctx.createBiquadFilter();
          o.type = type; o.frequency.value = hz(n); o.detune.value = det;
          lp.type = 'lowpass'; lp.frequency.value = 900; gg.gain.value = g;
          const lfo = ctx.createOscillator(), lg = ctx.createGain();
          lfo.frequency.value = .05 + i * .021; lg.gain.value = g * .8;
          lfo.connect(lg).connect(gg.gain); lfo.start();
          o.connect(lp).connect(gg).connect(bus); o.start();
          stops.push(() => { o.stop(); lfo.stop(); });
        });
      });
      const n = ctx.createBufferSource(); n.buffer = noiseBuf(2); n.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      const ng = ctx.createGain(); ng.gain.value = .05;
      n.connect(lp).connect(ng).connect(bus); n.start(); stops.push(() => n.stop());
      const scale = [62, 65, 67, 69, 72, 74, 77, 81];
      // estalos e sinos no sequenciador (passo de 1/8 s)
      stops.push(sequencer(.125, (i, t) => {
        if (Math.random() < .45) hit(bus, t + Math.random() * .1, { freq: 1500 + Math.random() * 3000, vol: Math.random() * .3, dur: .04 });
        if (i % 40 === 0 && Math.random() < .7) bell(hz(scale[(Math.random() * scale.length) | 0]), .05, bus, 4, t);
      }));
      return () => stops.forEach(f => f());
    },

    p3(bus) {
      // 84 bpm, colcheias. Progressão original: Fmaj7 – Em7 – Dm7 – Cmaj7(add9)
      const chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 62]];
      const bass = [41, 40, 38, 36];
      const arp = [0, 2, 1, 3, 2, 1, 3, 2];
      const lead = [76, null, 74, 72, null, 69, null, null, 72, null, 71, 67, null, null, 64, null,
                    74, null, 72, 69, null, 67, null, null, 69, null, 67, 64, null, 62, 64, null];
      const step = 60 / 84 / 2;
      return sequencer(step, (i, t) => {
        const bar = (i >> 3) % 4, s = i % 8, ch = chords[bar];
        if (s === 0) { ch.forEach(n => keys(hz(n), .045, bus, t, 2.6)); pluck(hz(bass[bar]), .22, bus, t, 1.2, 'sine'); }
        if (s === 4) pluck(hz(bass[bar] + 7), .12, bus, t, .6, 'sine');
        keys(hz(ch[arp[s]] + 12), .03, bus, t, .5);
        const L = lead[i % 32];
        if (L && (i >> 5) % 2 === 1) keys(hz(L), .05, bus, t, .9);
        if (s % 4 === 0) kick(bus, t, .25);
        if (s % 2 === 1) hit(bus, t, { freq: 9000, vol: .025, dur: .03 });
        if (s === 4) hit(bus, t, { freq: 1800, vol: .06, dur: .12, type: 'bandpass' });
      });
    },

    op(bus) {
      // jiga em ré maior, compasso 6/8 a ~112 bpm (melodia original)
      const mel = [74, 76, 78, 79, 78, 76, 74, null, 71, 73, 74, 76, 74, 73, 71, null,
                   69, 71, 73, 74, 76, 78, 79, 81, 79, 78, 76, 73, 74, null, null, null];
      const bassSeq = [50, 50, 55, 57, 50, 55, 57, 50];
      const step = 60 / 112 / 3;
      const stops = [];
      // mar: ruído filtrado subindo e descendo
      const n = ctx.createBufferSource(); n.buffer = noiseBuf(3); n.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
      const g = ctx.createGain(); g.gain.value = .03;
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .12; lg.gain.value = .028;
      lfo.connect(lg).connect(g.gain); lfo.start();
      n.connect(lp).connect(g).connect(bus); n.start();
      stops.push(() => { n.stop(); lfo.stop(); });
      stops.push(sequencer(step, (i, t) => {
        const s = i % 6, bar = (i / 6 | 0) % 8;
        const m = mel[i % 32];
        if (m && (i / 32 | 0) % 3 !== 2) pluck(hz(m), .09, bus, t, .3, 'square');
        if (m && (i / 32 | 0) % 3 !== 2) pluck(hz(m), .06, bus, t, .4);
        if (s === 0) { pluck(hz(bassSeq[bar] - 12), .22, bus, t, .5); kick(bus, t, .2); }
        if (s === 3) { pluck(hz(bassSeq[bar] - 5), .14, bus, t, .4); hit(bus, t, { freq: 2500, vol: .05, dur: .08, type: 'bandpass' }); }
        if (s === 2 || s === 5) [0, 4, 7].forEach(o => pluck(hz(bassSeq[bar] + o), .03, bus, t, .2));
      }));
      return () => stops.forEach(f => f());
    }
  };

  function playScene(name) {
    if (!ctx) return;
    const old = scene;
    if (old) {
      old.bus.gain.setTargetAtTime(0, ctx.currentTime, .3);
      setTimeout(() => { old.stop(); old.bus.disconnect(); }, 1600);
    }
    const bus = ctx.createGain(); bus.gain.value = 0;
    bus.connect(master); bus.connect(rev);
    bus.gain.setTargetAtTime(name === 'souls' ? .5 : .42, ctx.currentTime + .2, 1.2);
    scene = { bus, stop: SCENES[name](bus) };
  }

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = on ? .8 : 0; master.connect(ctx.destination);
    rev = reverb(); const revG = ctx.createGain(); revG.gain.value = .45; rev.connect(revG).connect(master);
    fx = ctx.createGain(); fx.gain.value = .7; fx.connect(master); fx.connect(rev);
    playScene(theme);
  }

  const notes = { souls: [50, 57, 62], p3: [64, 71, 76], op: [62, 66, 69] };
  const api = {
    start() { if (started) { ctx && ctx.resume(); return; } started = true; try { init(); } catch (e) {} },
    get on() { return on; },
    toggle() {
      on = !on;
      try { localStorage.setItem('fl-sound', on ? 'on' : 'off'); } catch (e) {}
      if (!started) api.start();
      if (ctx) { ctx.resume(); master.gain.setTargetAtTime(on ? .8 : 0, ctx.currentTime, .2); }
      return on;
    },
    setTheme(t) { if (t === theme) return; theme = t; playScene(t); if (ctx) api.enter(); },
    enter() { if (!ctx) return; const n = notes[theme]; n.forEach((x, i) => setTimeout(() => bell(hz(x), .18 - i * .03, fx, 4), i * 150)); },
    tick() { if (ctx) bell(hz(theme === 'p3' ? 88 : 86), .03, fx, .4); },
    rate() { if (!ctx) return; const n = notes[theme]; bell(hz(n[2] + 12), .12); setTimeout(() => bell(hz(n[2] + 19), .1), 90); },
    travel() { if (!ctx) return; notes[theme].forEach((x, i) => setTimeout(() => bell(hz(x + 12), .1), i * 70)); },
    died() {
      if (!ctx) return;
      const t = ctx.currentTime;
      if (scene) { scene.bus.gain.setTargetAtTime(.04, t, .3); scene.bus.gain.setTargetAtTime(.45, t + 4.5, 1.5); }
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(theme === 'op' ? 220 : 110, t); o.frequency.exponentialRampToValueAtTime(30, t + 2.5);
      lp.type = 'lowpass'; lp.frequency.value = 400;
      g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + 3);
      o.connect(lp).connect(g).connect(fx); o.start(t); o.stop(t + 3);
      [38, 41, 44].forEach((n, i) => setTimeout(() => bell(hz(n + (theme === 'souls' ? 0 : 12)), .28, fx, 6), 300 + i * 450));
    },
    won() {
      if (!ctx) return;
      const base = { souls: 50, p3: 52, op: 50 }[theme];
      [0, 7, 12, 16, 19, 24].forEach((n, i) => setTimeout(() => bell(hz(base + n), .16, fx, 5), i * 140));
    }
  };
  return api;
})();
