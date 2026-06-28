// JS propio SOLO para “Redes sociales”.
// Mantiene el video activo y aplica un micro-parallax al hacer scroll (aunque el body está oculto).

document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('.background-video video');
  if (!video) return;

  video.muted = true;
  video.playsInline = true;

  // Reintenta play por políticas del navegador
  const tryPlay = async () => {
    try {
      await video.play();
    } catch (_) {
      // no-op
    }
  };

  tryPlay();

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onScroll = () => {
    if (prefersReducedMotion) return;
    const y = window.scrollY || 0;
    video.style.transform = `translateY(${y * 0.15}px) scale(1.02)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});



