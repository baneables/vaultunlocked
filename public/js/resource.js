async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error de red');
  }
  return data;
}

function getResourceId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadResource() {
  const id = getResourceId();
  const infoEl = document.getElementById('resource-info');
  if (!id || !infoEl) return;
  infoEl.innerHTML = '<p style="color: #94a3b8;">Cargando recurso...</p>';
  try {
    const resource = await fetchJson(`/api/resources/${id}`);
    infoEl.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
          <div style="flex-grow: 1;">
            <div class="resource-category">${resource.category}</div>
            <h1 style="margin: 0.75rem 0 0; color: #f1f5f9; font-size: 2rem;">${resource.title}</h1>
          </div>
        </div>
        <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.8; margin-bottom: 1.5rem;">${resource.description}</p>
        <div class="resource-meta" style="border-bottom: 1px solid rgba(148, 163, 184, 0.1); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
          <span>👤 <strong>${resource.uploaderName}</strong></span>
          <span>⬇️ <strong>${resource.downloads}</strong> descargas</span>
          <span>📅 ${new Date(resource.createdAt).toLocaleDateString('es-ES')}</span>
          <span>📦 ${(resource.size / 1024 / 1024).toFixed(2)}MB</span>
        </div>
        <button onclick="downloadResource('${resource.fileName}', '${resource.originalName}')" style="padding: 1rem 2rem; font-size: 1rem;">⬇️ Descargar ahora</button>
      </div>
    `;
    await setupNavigation();
    loadComments();
  } catch (error) {
    infoEl.innerHTML = `<p style="color: #f87171;">Error: ${error.message}</p>`;
  }
}

function downloadResource(fileName, originalName) {
  const link = document.createElement('a');
  link.href = `/uploads/${encodeURIComponent(fileName)}`;
  link.download = originalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function loadComments() {
  const id = getResourceId();
  const list = document.getElementById('comments-list');
  if (!id || !list) return;
  list.innerHTML = '<p style="color: #94a3b8;">Cargando comentarios...</p>';
  try {
    const comments = await fetchJson(`/api/resources/${id}/comments`);
    if (!comments.length) {
      list.innerHTML = '<p style="color: #94a3b8;">No hay comentarios todavía. ¡Sé el primero!</p>';
      return;
    }
    list.innerHTML = comments.map(comment => `
      <div class="comment-card">
        <p style="margin: 0 0 0.5rem; color: #f1f5f9; font-weight: 600;">${comment.userName}</p>
        <p style="margin: 0 0 0.75rem; color: #cbd5e1;">${comment.text}</p>
        <p class="meta" style="margin: 0; font-size: 0.8rem;">📅 ${new Date(comment.createdAt).toLocaleString('es-ES')}</p>
      </div>
    `).join('');
  } catch (error) {
    list.innerHTML = `<p style="color: #f87171;">Error: ${error.message}</p>`;
  }
}

async function setupCommentForm() {
  const form = document.getElementById('comment-form');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const id = getResourceId();
    const text = form.querySelector('textarea').value.trim();
    if (!text) return;
    try {
      await fetchJson(`/api/resources/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      form.reset();
      loadComments();
    } catch (error) {
      if (error.message.includes('No autenticado')) {
        alert('Debes iniciar sesión para comentar');
        window.location.href = '/login';
        return;
      }
      alert('Error: ' + error.message);
    }
  });
}

async function setupNavigation() {
  const dashboardBtn = document.getElementById('nav-dashboard-btn');
  if (!dashboardBtn) return;
  try {
    const user = await fetchJson('/api/auth/me');
    dashboardBtn.style.display = 'inline-block';
    dashboardBtn.href = '/dashboard';
  } catch {
    dashboardBtn.style.display = 'none';
  }
}

if (document.readyState !== 'loading') {
  loadResource();
  setupCommentForm();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    loadResource();
    setupCommentForm();
  });
}

