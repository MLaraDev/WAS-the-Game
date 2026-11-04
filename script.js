const chapters=[
{title:'Infância',place:'QUARTO DE INFÂNCIA',description:'Brinquedos, livros e fotografias guardam os primeiros vestígios de uma história esquecida.',image:'fase-1-quarto.webp'},
{title:'Adolescência',place:'ESCOLA',description:'Trabalhos antigos, mensagens e um relógio parado sugerem perguntas sobre quem Oliver queria se tornar.',image:'fase-2-sala-de-aula.webp'},
{title:'Jovem adulto',place:'FACULDADE',description:'Em meio aos estudos e às amizades, surgem dúvidas que Oliver ainda não sabe explicar.',image:'fase-3-faculdade.webp'},
{title:'Relacionamento',place:'APARTAMENTO',description:'Uma casa cheia de pequenos sinais de afeto. Algumas conversas são mais difíceis do que parecem.',image:'fase-4-sala.webp'},
{title:'Descobertas',place:'LABORATÓRIO',description:'Anotações e documentos apontam para uma história que permaneceu escondida.',image:'fase-5-laboratorio.webp'},
{title:'Adulto',place:'HOSPITAL',description:'Um ambiente desconhecido, objetos familiares e lacunas que ainda precisam ser preenchidas.',image:'fase-6-hospital.webp'},
{title:'O campo',place:'UM LUGAR DISTANTE',description:'Uma paisagem aberta e perguntas sobre os caminhos que nos trouxeram até aqui.',image:'fase-7-campo.webp'}
];
let current=0;const byId=id=>document.getElementById(id);const chapterNav=byId('chapter-nav');
chapters.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><strong>${c.title}</strong>`;b.setAttribute('aria-label',`Ver capítulo ${i+1}: ${c.title}`);b.addEventListener('click',()=>show(i));chapterNav.appendChild(b)});
function show(i){current=(i+chapters.length)%chapters.length;const c=chapters[current],number=String(current+1).padStart(2,'0');byId('gallery-current').textContent=number;byId('gallery-title').textContent=c.title;byId('gallery-place').textContent=c.place;byId('gallery-description').textContent=c.description;const img=byId('gallery-image');img.src='assets/'+c.image;img.alt='Ilustração do cenário: '+c.place.toLowerCase();Array.from(chapterNav.children).forEach((b,n)=>b.setAttribute('aria-pressed',String(n===current)))}
byId('previous').addEventListener('click',()=>show(current-1));byId('next').addEventListener('click',()=>show(current+1));show(0);
const menu=byId('menu'),nav=byId('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));

// Animações progressivas ao entrar no viewport (respeita preferência por movimento reduzido).
(function initScrollReveals(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.section-label, .intro-layout, .interlude > span, .interlude img, .interlude > p, .scenes-heading, .gallery, .chapter-nav, .asset-note, .experience-list article, .quote-inner, .play-layout, .credits-heading, .credits-grid > div, .resources, .character-art, .character-copy, .character-step');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (el.matches('.experience-list article, .credits-grid > div')) el.style.setProperty('--reveal-delay', `${(i % 4) * 85}ms`);
    if (el.matches('.character-art, .gallery, .intro-layout')) el.dataset.reveal = 'left';
    if (el.matches('.character-copy, .gallery-aside')) el.dataset.reveal = 'right';
  });
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -45px 0px'});
  targets.forEach(el => observer.observe(el));
})();

// Animações vinculadas ao scroll: barra de progresso, parallax do hero e dos números, citação palavra a palavra.
(function initScrollEffects(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;

  // Citação: separa em palavras para animar em cascata.
  const quote = document.querySelector('.quote-inner blockquote');
  if (quote && !quote.querySelector('.w')) {
    const words = quote.textContent.trim().split(/\s+/);
    quote.setAttribute('aria-label', words.join(' '));
    quote.textContent = '';
    words.forEach((word, i) => {
      const s = document.createElement('span');
      s.className = 'w'; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true'); s.textContent = word;
      quote.appendChild(s);
      if (i < words.length - 1) quote.appendChild(document.createTextNode(' '));
    });
  }

  // Títulos e citação ganham o efeito de revelação.
  const headingObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); } });
  }, {threshold: 0.15, rootMargin: '0px 0px -40px 0px'}) : null;
  if (headingObserver) document.querySelectorAll('.section h2, .pullquote').forEach(el => {
    el.classList.add('reveal');
    headingObserver.observe(el);
  });

  // A imagem do interlúdio é recortada por clip-path (área zero), então o gatilho é a própria seção.
  const interlude = document.querySelector('.interlude');
  if (interlude && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { const im = interlude.querySelector('img'); if (im) im.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, {threshold: 0.25});
    io.observe(interlude);
  }

  const bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  root.classList.add('motion-ready');

  const hero = document.querySelector('.hero');
  const steps = Array.from(document.querySelectorAll('.character-step'));
  let ticking = false;

  function update(){
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    const max = Math.max(1, root.scrollHeight - vh);
    bar.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
    if (hero) {
      const h = hero.offsetHeight || 1;
      root.style.setProperty('--hero-p', Math.max(0, Math.min(1, y / h)).toFixed(4));
    }
    steps.forEach(step => {
      const r = step.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const center = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      step.style.setProperty('--ny', (center * -70).toFixed(1) + 'px');
    });
  }
  function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onScroll);
  update();
})();

// Header fixo: sublinha o link da seção atual
(function(){
  const header = document.querySelector('.header'), nav = document.getElementById('nav');
  if (!header || !nav) return;
  const links = Array.from(nav.querySelectorAll('a')), sections = Array.from(document.querySelectorAll('main section[id]'));
  let ticking = false;
  function update(){
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    header.classList.toggle('is-stuck', y > 78);
    let cur = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= vh * 0.4) cur = s.id; });
    links.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + cur));
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
