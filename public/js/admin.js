async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error de red');
  }
  return data;
}

async function loadAdminData() {
  const usersList = document.getElementById('users-list');
  const resourcesList = document.getElementById('resources-admin-list');
  if (!usersList || !resourcesList) return;
  try {
    const users = await fetchJson('/api/admin/users');
    const resources = await fetchJson('/api/admin/resources');
    if (!users.length) {
      usersList.innerHTML = '<p style="color: #94a3b8;">No hay usuarios registrados.</p>';
    } else {
      usersList.innerHTML = users.map(user => `
        <div class="user-card">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
            <div style="flex-grow: 1;">
              <h3 style="margin: 0; color: #f1f5f9;">${user.name}</h3>
              <p style="margin: 0.25rem 0 0; color: #cbd5e1; font-size: 0.9rem;">${user.email}</p>
            </div>
            <span style="background: ${user.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(96, 165, 250, 0.2)'}; color: ${user.role === 'admin' ? '#d8b4fe' : '#bfdbfe'}; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${user.role}</span>
          </div>
          <p style="margin: 0.5rem 0 0; color: #94a3b8; font-size: 0.85rem;">📅 ${new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
          ${user.role !== 'admin' ? `<button onclick="deleteUser('${user.id}')" style="margin-top: 0.75rem; width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626);">🗑️ Eliminar</button>` : ''}
        </div>
      `).join('');
    }
    if (!resources.length) {
      resourcesList.innerHTML = '<p style="color: #94a3b8;">No hay recursos publicados.</p>';
    } else {
      resourcesList.innerHTML = resources.map(resource => `
        <div class="admin-resource-card">
          <div style="margin-bottom: 0.75rem;">
            <div class="resource-category">${resource.category}</div>
            <h3 style="margin: 0.5rem 0 0; color: #f1f5f9;">${resource.title}</h3>
            <p style="margin: 0.25rem 0; color: #cbd5e1; font-size: 0.9rem;">${resource.description.substring(0, 80)}...</p>
          </div>
          <p style="margin: 0.5rem 0; color: #94a3b8; font-size: 0.85rem;">👤 ${resource.uploaderName} | ⬇️ ${resource.downloads} descargas</p>
          <button onclick="deleteResource('${resource.id}')" style="margin-top: 0.75rem; width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626);">🗑️ Eliminar</button>
        </div>
      `).join('');
    }
  } catch (error) {
    usersList.innerHTML = `<p style="color: #f87171;">Error: ${error.message}</p>`;
    resourcesList.innerHTML = `<p style="color: #f87171;">Error: ${error.message}</p>`;
  }
}

async function deleteUser(id) {
  if (!confirm('⚠️ ¿Estás seguro de que quieres eliminar este usuario?')) return;
  try {
    await fetchJson(`/api/admin/users/${id}`, { method: 'DELETE' });
    loadAdminData();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function deleteResource(id) {
  if (!confirm('⚠️ ¿Estás seguro de que quieres eliminar este recurso?')) return;
  try {
    await fetchJson(`/api/admin/resources/${id}`, { method: 'DELETE' });
    loadAdminData();
  } catch (error) {
    alert('Error: ' + error.message);
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

if (document.readyState !== 'loading') {
  loadAdminData();
  setupLogoutButton();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    loadAdminData();
    setupLogoutButton();
  });
}
