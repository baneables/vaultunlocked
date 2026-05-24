async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error de red');
  }
  return data;
}

let currentCategory = 'all';
let allResources = [];

async function loadResources() {
  const list = document.getElementById('resources-list');
  if (!list) return;
  list.innerHTML = '<p style="text-align: center; color: #94a3b8;">Cargando recursos...</p>';
  try {
    allResources = await fetchJson('/api/resources');
    renderResources();
  } catch (error) {
    list.innerHTML = `<p style="text-align: center; color: #f87171;">Error: ${error.message}</p>`;
  }
}

function renderResources() {
  const list = document.getElementById('resources-list');
  if (!list) return;
  
  const filtered = currentCategory === 'all' 
    ? allResources 
    : allResources.filter(r => r.category.toLowerCase() === currentCategory.toLowerCase());
  
  if (!filtered.length) {
    list.innerHTML = '<p style="text-align: center; color: #94a3b8; grid-column: 1/-1;">No hay recursos en esta categoría.</p>';
    return;
  }
  
  list.innerHTML = filtered.map(resource => `
    <article class="resource-card" onclick="window.location.href='/resource?id=${resource.id}'">
      <div class="resource-category">${resource.category}</div>
      <h3>${resource.title}</h3>
      <p style="color: #cbd5e1; line-height: 1.6; flex-grow: 1;">${resource.description.substring(0, 120)}${resource.description.length > 120 ? '...' : ''}</p>
      <div class="resource-meta">
        <span>👤 ${resource.uploaderName}</span>
        <span>⬇️ ${resource.downloads}</span>
        <span>📅 ${new Date(resource.createdAt).toLocaleDateString('es-ES')}</span>
      </div>
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(148, 163, 184, 0.1);">
        <button onclick="event.stopPropagation(); window.location.href='/resource?id=${resource.id}'" style="width: 100%;">Ver Recurso</button>
      </div>
    </article>
  `).join('');
}

function setupCategoryFilter() {
  const container = document.querySelector('.category-buttons');
  if (!container) return;
  // solicitamos categorías al backend y construimos botones dinámicamente
  fetchJson('/api/resources/categories').then(cats => {
    const buttons = ['all', ...cats];
    container.innerHTML = buttons.map((c, i) => `
      <button class="cat-btn ${i===0? 'active' : ''}" data-category="${c}">${c === 'all' ? 'Todas' : c.charAt(0).toUpperCase() + c.slice(1)}</button>
    `).join('');
    container.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderResources();
      });
    });
  }).catch(() => {
    // fallback: si falla, se usan botones ya presentes en HTML
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderResources();
      });
    });
  });
}

async function renderMyResources() {
  const el = document.getElementById('my-resources');
  if (!el) return;
  el.innerHTML = '<p style="color: #94a3b8;">Cargando...</p>';
  try {
    const userResponse = await fetchJson('/api/auth/me');
    const myResources = allResources.filter(resource => resource.uploaderId === userResponse.user.id);
    if (!myResources.length) {
      el.innerHTML = '<p style="color: #94a3b8;">No has subido recursos todavía.</p>';
      return;
    }
    el.innerHTML = myResources.map(resource => `
      <div class="resource-card" style="cursor: pointer;" onclick="window.location.href='/resource?id=${resource.id}'">
        <h3>${resource.title}</h3>
        <p style="color: #cbd5e1; font-size: 0.9rem;">${resource.category}</p>
        <p style="color: #94a3b8; font-size: 0.85rem;">⬇️ ${resource.downloads} descargas</p>
        <button onclick="event.stopPropagation(); window.location.href='/resource?id=${resource.id}'" style="width: 100%; margin-top: 0.75rem;">Ver</button>
      </div>
    `).join('');
  } catch (error) {
    if (error.message.includes('No autenticado')) {
      el.innerHTML = '<p style="color: #94a3b8;">Debes iniciar sesión para ver tus recursos.</p>';
      return;
    }
    el.innerHTML = `<p style="color: #f87171;">${error.message}</p>`;
  }
}

async function setupLogoutButton() {
  const button = document.getElementById('logout-button');
  if (!button) return;
  button.addEventListener('click', async () => {
    await fetchJson('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
}

async function setupUploadForm() {
  const form = document.getElementById('upload-form');
  const message = document.getElementById('upload-message');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(form);
    // client-side size validation based on category
    const sizeMap = {
      plugins: 50,
      mods: 200,
      assets: 300,
      scripts: 10,
      texturas: 150,
      mapas: 500,
      utilidades: 20
    };
    const category = formData.get('category') || '';
    const maxMB = sizeMap[category] || 100;
    const file = formData.get('file');
    if (file && file.size && file.size > maxMB * 1024 * 1024) {
      message.style.display = 'block';
      message.textContent = `El archivo supera el límite de ${maxMB}MB para la categoría ${category}.`; 
      message.style.color = '#fca5a5';
      return;
    }

    message.style.display = 'block';
    message.textContent = 'Subiendo recurso...';
    try {
      const url = `/api/resources/upload?category=${encodeURIComponent(category)}`;
      await fetchJson(url, { method: 'POST', body: formData });
      message.textContent = '✅ Recurso subido correctamente.';
      message.style.color = '#86efac';
      form.reset();
      await loadResources();
      renderMyResources();
    } catch (error) {
      message.textContent = error.message;
      message.style.color = '#fca5a5';
    }
  });
}

async function setupNavigation() {
  try {
    const user = await fetchJson('/api/auth/me');
    document.getElementById('nav-login-btn').style.display = 'none';
    document.getElementById('nav-register-btn').style.display = 'none';
    document.getElementById('nav-dashboard-btn').style.display = 'inline-block';
    if (user.user.role === 'admin') {
      document.getElementById('nav-admin-btn').style.display = 'inline-block';
    }
    document.getElementById('nav-logout-btn').style.display = 'inline-block';
    
    document.getElementById('nav-login-btn').href = '#';
    document.getElementById('nav-register-btn').href = '#';
    document.getElementById('nav-dashboard-btn').href = '/dashboard';
    document.getElementById('nav-admin-btn').href = '/admin';
  } catch {
    document.getElementById('nav-login-btn').href = '/login';
    document.getElementById('nav-register-btn').href = '/register';
  }
}

if (document.readyState !== 'loading') {
  setupNavigation();
  loadResources();
  renderMyResources();
  setupLogoutButton();
  setupUploadForm();
  setupCategoryFilter();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadResources();
    renderMyResources();
    setupLogoutButton();
    setupUploadForm();
    setupCategoryFilter();
  });
}

