// Footer banner en tiempo real
// Muestra fecha/hora exacta en el centro.

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatLocalDateTime(d) {
  // Ej: 21/06/2026 14:03:09
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('footer-datetime');

  if (target) {
    const update = () => {
      target.textContent = formatLocalDateTime(new Date());
    };

    update();
    setInterval(update, 1000);
  }

  const slides = Array.from(document.querySelectorAll('.footer-photo-slider__slide'));
  if (slides.length <= 1) return;

  let current = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (current < 0) current = 0;

  slides.forEach((slide, index) => {
    slide.classList.toggle('is-active', index === current);
  });

  window.setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, 3500);
});


