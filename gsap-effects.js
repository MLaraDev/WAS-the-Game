// GSAP + ScrollTrigger: apenas a entrada do hero e um leve parallax ao rolar.
(function(){
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    root.classList.add('gsap-on');

    // Entrada do hero (uma vez, ao carregar)
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-title > p', { y: 16, autoAlpha: 0, duration: .8 })
      .from('.hero h1', { y: 28, autoAlpha: 0, duration: 1 }, '-=.5')
      .from('.hero-bottom', { y: 16, autoAlpha: 0, duration: .8 }, '-=.6');

    // Ao rolar: fundo desce de leve e o conteúdo do hero some suavemente (scrub)
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-image', { yPercent: 8, ease: 'none' }, 0)
      .to('.hero-inner', { y: -40, autoAlpha: 0, ease: 'none' }, 0);

    return () => root.classList.remove('gsap-on');
  });
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
