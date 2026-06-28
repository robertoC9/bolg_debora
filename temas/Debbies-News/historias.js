// URL base de la API — cambiar cuando se despliegue
const API_BASE = (() => {
  // En desarrollo local con Live Server vs backend
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  // En producción (Render)
  return 'https://debbie-blog-api.onrender.com';
})();

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('historias-list');
  const statusEl = document.getElementById('historias-status');
  const addBtn = document.getElementById('historia-add-btn');

  const renderEmpty = (message) => {
    if (listEl) listEl.innerHTML = '';
    if (statusEl) statusEl.textContent = message;
  };

  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('es-AR');
  };

  const createCard = (story) => {
    const article = document.createElement('article');
    article.className = 'historia-card';

    const title = document.createElement('h3');
    title.className = 'historia-title';
    title.textContent = story.titulo || 'Sin título';

    const text = document.createElement('p');
    text.className = 'historia-text';
    text.textContent = story.texto || '';

    const meta = document.createElement('div');
    meta.className = 'historia-meta';
    meta.textContent = formatDate(story.fecha);

    article.appendChild(title);
    article.appendChild(text);
    article.appendChild(meta);

    return article;
  };

  const renderStories = (stories) => {
    if (!listEl) return;

    if (!Array.isArray(stories) || stories.length === 0) {
      renderEmpty('Por el momento no hay historias cargadas.');
      return;
    }

    if (statusEl) statusEl.textContent = '';

    listEl.innerHTML = '';
    stories.forEach((s) => {
      listEl.appendChild(createCard(s));
    });
  };

  const API_ENDPOINT = API_BASE + '/api/historias';

  const loadStories = async () => {
    try {
      if (statusEl) statusEl.textContent = 'Cargando historias...';

      const res = await fetch(API_ENDPOINT, { method: 'GET' });

      if (!res.ok) throw new Error('No se pudo cargar');

      const data = await res.json();
      renderStories(data);
    } catch {
      renderEmpty('No se pudo cargar desde el backend (aún no disponible).');
    }
  };

  const setAddButtonState = () => {
    if (!addBtn) return;
    addBtn.disabled = true;
    addBtn.title = 'Funciona solo cuando exista el backend.';
    addBtn.textContent = 'Agregar historia (próximamente)';
  };

  // Botón volver a Home con “atributos más elegantes” usando JS (sin afectar el funcionamiento)
  const homeBackBtn = document.getElementById('home-back-btn');
  const homeBackWrap = document.querySelector('.home-back-wrap');

  if (homeBackBtn && homeBackWrap) {
    homeBackBtn.setAttribute('role', 'button');

    // Efecto sutil de brillo al pasar el mouse
    homeBackWrap.style.backgroundImage = 'none';

    homeBackBtn.addEventListener('mouseenter', () => {
      homeBackWrap.style.backgroundImage = 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0))';
    });

    homeBackBtn.addEventListener('mouseleave', () => {
      homeBackWrap.style.backgroundImage = 'none';
    });

    // Micro-señal: si el usuario estuvo un rato sin interactuar, animar una vez
    let done = false;
    const mark = () => {
      if (done) return;
      done = true;
      homeBackBtn.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-2px)' },
        { transform: 'translateY(0)' },
      ], { duration: 520, easing: 'ease-out' });
    };

    setTimeout(mark, 1200);
  }

  setAddButtonState();
  loadStories();
});
