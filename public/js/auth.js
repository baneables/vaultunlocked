async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error de red');
  }
  return data;
}

function showMessage(text, isError = true) {
  const message = document.getElementById('message');
  if (message) {
    message.style.display = 'block';
    message.textContent = text;
    if (isError) {
      message.style.color = '#fca5a5';
    } else {
      message.style.color = '#86efac';
    }
  }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    try {
      await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      showMessage('✅ Login exitoso. Redirigiendo...', false);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (error) {
      showMessage('❌ ' + error.message);
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    try {
      await fetchJson('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      showMessage('✅ Cuenta creada. Redirigiendo...', false);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (error) {
      showMessage('❌ ' + error.message);
    }
  });
}
