// Dual photo sliders: dos carruseles lado a lado con fotos alternadas.
// Requiere markup:
// - .footer-photo-slider--primary
// - .footer-photo-slider--secondary
// Cada uno con hijos .footer-photo-slider__slide

function setActiveSlide(sliderEl, slides, index) {
  slides.forEach((s, i) => {
    const active = i === index;
    s.classList.toggle('is-active', active);
    s.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
}

function initDualSliders() {
  const primary = document.querySelector('.footer-photo-slider--primary');
  const secondary = document.querySelector('.footer-photo-slider--secondary');
  if (!primary || !secondary) return;

  const pSlides = Array.from(primary.querySelectorAll('.footer-photo-slider__slide'));
  const sSlides = Array.from(secondary.querySelectorAll('.footer-photo-slider__slide'));
  if (pSlides.length <= 1 || sSlides.length <= 1) return;

  // Alineamos ambos sliders para que nunca se vean “la misma foto juntas”.
  // Estrategia: si se muestran índices [i, j], el secundario usa el siguiente índice offset.
  const offset = 1;

  let pIndex = pSlides.findIndex((s) => s.classList.contains('is-active'));
  if (pIndex < 0) pIndex = 0;
  let sIndex = (pIndex + offset) % sSlides.length;

  setActiveSlide(primary, pSlides, pIndex);
  setActiveSlide(secondary, sSlides, sIndex);

  // Segundo intervalo: al avanzar el primary, ajusta secondary.
  const INTERVAL_MS = 3500;

  window.setInterval(() => {
    pIndex = (pIndex + 1) % pSlides.length;
    sIndex = (pIndex + offset) % sSlides.length;

    setActiveSlide(primary, pSlides, pIndex);
    setActiveSlide(secondary, sSlides, sIndex);
  }, INTERVAL_MS);
}

document.addEventListener('DOMContentLoaded', () => {
  initDualSliders();
});

