/* Idiomas (pt / en). O português é o texto que já está no HTML; aqui fica só o inglês. */
window.FL = (() => {
  const EN = {
    'title.pre': 'a laboratory by', 'title.key': 'Press any key', 'title.touch': 'Tap the screen',
    'title.sound': '♪ with sound · mute it at the top', 'title.foot': '© froglabs.site · no frogs were harmed',
    nav1: 'Sheet', nav2: 'Areas', nav3: 'Messages', nav4: 'Travel',
    'hero.eyebrow': 'Bonfire lit', 'hero.place': 'froglabs.site Clearing',
    menu1: 'Traveler sheet', menu2: 'Discovered areas', menu3: 'Messages on the ground', menu4: 'Travel',
    'hero.hint': 'Rest for a while. The enemies won’t respawn (promise).',
    'ficha.eyebrow': 'Status', 'ficha.h2': 'Traveler sheet', class: 'Back-end Developer · PHP &amp; Laravel',
    m0: 'Origin', v0: 'Systems Analysis · IFMS', m1: 'Main weapon', m2: 'Catalyst', m3: 'Covenant', v3: 'Those who die and try again', m4: 'Status', v4: 'Open to new journeys',
    attr: 'Attributes', lore: 'Lore',
    s0: 'Vigor', s1: 'Dexterity', s2: 'Endurance', s3: 'Agility', s4: 'Intelligence', s5: 'Faith', s6: 'Arcane', s5w: 'AI · Claude, Codex',
    lore1: 'A Systems Analysis and Development graduate from IFMS (Brazil), this traveler walks the <em>back-end</em> path: PHP and Laravel in the main hand, Node.js and Python in the off-hand, and AI as a support spell. Loves exploring new languages and forging his own solutions.',
    lore2: 'Away from code, he dies over and over in <em>souls-likes</em>, and enjoys it. He also makes games: he has worked with Unity and Godot, and even built a death counter for the Lands Between.',
    'areas.eyebrow': 'Map', 'areas.h2': 'Discovered areas', 'area.tag': 'Area discovered',
    a0: 'Garimpo Mines', a1: 'Tower of a Thousand Episodes', a2: 'Arena of the Ranked', a3: 'Vértice Citadel',
    a0d: 'A Brazilian IT job aggregator that digs the web for opportunities. Deep in the mine, an AI forge sharpens your ATS résumé for every job.',
    a1d: 'Here travelers organize anime, plan their episode routine and share stories with the community. The tower’s rule: one episode at a time.',
    a2d: 'Headquarters for multiple League of Legends accounts: it records every Solo/Duo ranked battle and shows who is climbing and who is falling.',
    a3d: 'A citadel where every traveler raises their own trophy hall: create, customize and publish a professional portfolio. Your work, in perspective.',
    l0: 'Loot: <span>IT jobs</span><span>ATS résumé</span><span>AI</span>',
    l1: 'Loot: <span>calendar</span><span>progress</span><span>community</span>',
    l2: 'Loot: <span>multi-account</span><span>Solo/Duo</span><span>stats</span>',
    l3: 'Loot: <span>portfolios</span><span>editor</span><span>publishing</span>',
    travel: 'Travel', code: 'view code',
    'chest.tag': 'Item on the ground', 'chest.h3': 'Suspiciously lonely chest', 'chest.p': 'It sits in a corner, no enemies around. It shines a little too much.', 'chest.btn': 'Open the chest',
    'msgs.eyebrow': 'Written on the ground', 'msgs.h2': 'Messages from other travelers', 'msgs.note': 'Rate them all. Something might happen.',
    msg0: '“Coffee ahead.”', msg1: '“Try deploy, but Friday.”', msg2: '“Beware: bug to the left.”', msg3: '“If only I had written tests…”', msg4: '“Visions of pull request… therefore, breathe.”', msg5: '“Frog ahead.”',
    'go.eyebrow': 'Fast travel', 'go.h2': 'Where to now?', w0t: 'Portfolio',
    w0: 'The full grimoire: projects, tech and résumé.', w1: 'The arsenal: source code of projects and experiments.',
    also: 'Also on', closing: 'Got an idea, a project or a game to build together? Summon this traveler through the portfolio. He is open to new journeys.',
    foot: 'FrogLabs · made with PHP in the heart and plain HTML in the hands',
    fan: 'Fan-made, with original artwork. Not affiliated with FromSoftware.'
  };

  /* textos usados pelo JS (botões, banners) */
  const UI = {
    pt: { good: 'Bom!', bad: 'Ruim…', replies: ['Sua avaliação aqueceu alguém.', 'Um viajante sorriu em outro mundo.', 'Recebido. Siga em frente.'],
      died: ['YOU DIED', 'Era um mímico. {n} brasas ficaram para trás.', 'Era um mímico. Pelo menos você não tinha brasas.'], again: 'Abrir de novo?',
      won: ['VICTORY ACHIEVED', 'Todas as mensagens avaliadas. O sapo está orgulhoso.'], cur: 'brasas' },
    en: { good: 'Good!', bad: 'Poor…', replies: ['Your rating warmed someone.', 'A traveler smiled in another world.', 'Received. Carry on.'],
      died: ['YOU DIED', 'It was a mimic. {n} embers were left behind.', 'It was a mimic. At least you had no embers.'], again: 'Open again?',
      won: ['VICTORY ACHIEVED', 'All messages rated. The frog is proud.'], cur: 'embers' }
  };

  const root = document.documentElement;
  const nodes = [...document.querySelectorAll('[data-k]')];
  const base = {};
  nodes.forEach(n => { if (!(n.dataset.k in base)) base[n.dataset.k] = n.innerHTML.trim(); });
  let lang = root.dataset.lang === 'en' ? 'en' : 'pt';

  function render() {
    nodes.forEach(n => {
      const v = lang === 'en' && n.dataset.k in EN ? EN[n.dataset.k] : base[n.dataset.k];
      if (v != null) n.innerHTML = v;
    });
    root.lang = lang === 'en' ? 'en' : 'pt-BR';
    const lb = document.getElementById('lang');
    if (lb) lb.dataset.on = lang;
  }

  const listeners = [];
  function setLang(l) {
    lang = l; render();
    try { localStorage.setItem('fl-lang', lang); } catch (e) {}
    listeners.forEach(f => f({ theme: 'souls', lang }));
  }

  render();
  const lb = document.getElementById('lang');
  lb && lb.addEventListener('click', () => setLang(lang === 'pt' ? 'en' : 'pt'));

  return { theme: 'souls', get lang() { return lang; }, ui: () => UI[lang], on: f => listeners.push(f), setLang };
})();
