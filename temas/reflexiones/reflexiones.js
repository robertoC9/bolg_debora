// JS específico para temas/reflexiones
// Demo UI: lista de posts + respuestas (placeholder). Conectar a backend cuando esté listo.

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

function renderPosts(posts) {
  const container = document.getElementById('reflexiones-feed');
  if (!container) return;

  container.innerHTML = '';

  posts.forEach((post) => {
    const commentsHtml = (post.comments || [])
      .map(
        (c) => `
          <div class="comment-item">
            <div class="comment-item__author">${escapeHtml(c.author || 'Usuario')}</div>
            <div class="comment-item__text">${escapeHtml(c.text || '')}</div>
          </div>
        `
      )
      .join('');

    const postHtml = `
      <article class="post-card" data-post-id="${escapeHtml(post.id)}">
        <div class="post-card__top">
          <div class="post-card__meta">
            Por ${escapeHtml(post.author || 'Débora')} • ${escapeHtml(post.date || '')}
          </div>
          <div class="post-card__content">${escapeHtml(post.text || '')}</div>
          ${post.imageUrl ? `
            <div class="post-card__image"><img src="${escapeHtml(post.imageUrl)}" alt="Imagen del post" /></div>
          ` : ''}
        </div>

        <div class="comments">
          <h3>Respuestas</h3>

          <form class="comment-form" data-comment-form>
            <textarea name="comment" rows="3" placeholder="Escribe tu respuesta..."></textarea>
            <button type="submit">Responder</button>
          </form>

          <div class="comments-list" aria-label="Lista de comentarios">
            ${commentsHtml || ''}
          </div>
        </div>
      </article>
    `;

    container.insertAdjacentHTML('beforeend', postHtml);
  });
}

function initCommentForms() {
  const container = document.getElementById('reflexiones-feed');
  if (!container) return;

  container.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-comment-form]');
    if (!form) return;

    e.preventDefault();

    const postCard = form.closest('.post-card');
    if (!postCard) return;

    const postId = postCard.getAttribute('data-post-id');
    const textarea = form.querySelector('textarea[name="comment"]');
    const text = textarea ? textarea.value.trim() : '';

    if (!text) {
      alert('Escribe una respuesta.');
      return;
    }

    // Placeholder: en vez de enviar al backend, lo agregamos al DOM.
    const list = postCard.querySelector('.comments-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `
      <div class="comment-item__author">Usuario</div>
      <div class="comment-item__text">${escapeHtml(text)}</div>
    `;
    list.appendChild(item);

    if (textarea) textarea.value = '';

    // Aquí conectaríamos al backend:
    // fetch('/api/reflexiones/' + postId + '/comments', {method:'POST', ...})
  });
}

function initUploadForm() {
  // Formulario de Débora eliminado de la UI.
  // Publicaciones se harán desde backend.
}

document.addEventListener('DOMContentLoaded', () => {
  // Efecto: logo 1 (en el pie de página) centrado y con giro hacia la izquierda.
  // Si no existe, no hace nada.
  const logo1 = document.getElementById('logo1');
  if (logo1) {
    logo1.style.transformOrigin = '50% 50%';
    logo1.animate(
      [
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(-18deg) scale(1.02)' },
        { transform: 'rotate(0deg) scale(1)' }
      ],
      { duration: 900, iterations: Infinity, easing: 'ease-in-out' }
    );
  }

  // Demo de posts para que aparezcan y se pueda responder.
  // Cuando conectes backend, reemplaza por fetch a tu API.
  const demoPosts = [
    {
      id: 'p1',
      author: 'Débora',
      date: 'Hoy',
      text: 'Mi primera reflexión: la lectura cuidadosa cambia decisiones.',
      imageUrl: null,
      comments: [
        { author: 'Ana', text: 'Totalmente de acuerdo.' },
        { author: 'Luis', text: 'Me encantó el enfoque.' }
      ]
    },
    {
      id: 'p2',
      author: 'Débora',
      date: 'Ayer',
      text: 'Reflexión sobre acuerdos y dignidad: entender antes de firmar.',
      imageUrl: null,
      comments: [{ author: 'Carla', text: 'Gracias por compartir.' }]
    }
  ];

  renderPosts(demoPosts);
  initCommentForms();
  initUploadForm();
});

