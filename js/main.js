// Fondo con video + carrusel (Bootstrap) 
// Si quieres ajustar el comportamiento, hazlo aquí.

document.addEventListener('DOMContentLoaded', () => {
  // Generar slides del carrusel con todas las imágenes disponibles en /img
  // (lista estática para evitar depender de lectura del servidor / filesystem)
  const carouselInner = document.getElementById('carouselInnerDebora');
  if (carouselInner) {
    const imgFiles = [
      'debora-01.jpeg','debora-02.jpeg','debora-03.jpeg','debora-04.jpeg','debora-05.jpeg',
      'debora-06.jpeg','debora-07.jpeg','debora-08.jpeg','debora-09.jpeg','debrta-10.jpeg'
    ];

    const fragment = document.createDocumentFragment();

    imgFiles.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'carousel-item' + (idx === 0 ? ' active' : '');

      const img = document.createElement('img');
      img.className = 'd-block w-100';
      img.src = 'img/' + file;
      img.alt = 'Foto ' + (idx + 1);

      item.appendChild(img);
      fragment.appendChild(item);
    });

    carouselInner.innerHTML = '';
    carouselInner.appendChild(fragment);
  }

  // Fondo: video
  const video = document.getElementById('bg-video');

  if (video) {
    // Fuerza play por si el navegador lo pausó al render.
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {
      // Si falla, al menos que exista el elemento.
    });
  }

  // Carrusel: asegura autoplay
  const el = document.getElementById('carouselDebora');
  if (el && window.bootstrap?.Carousel) {
    window.bootstrap.Carousel.getOrCreateInstance(el, {
      interval: 3500,
      pause: 'hover',
      ride: true
    });
  }

  // Parallax: mover el video con el scroll (suave)
  const onScroll = () => {
    if (!video) return;
    const y = window.scrollY || 0;
    // Desplazamiento proporcional (ajustar si se siente muy fuerte)
    video.style.transform = `translateY(${y * 0.25}px) scale(1.02)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});


