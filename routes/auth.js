const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getUsers, saveUsers } = require('../helpers/dataManager');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'El correo ya está registrado' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  res.json({ message: 'Usuario registrado correctamente', user: req.session.user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Debe enviar correo y contraseña' });
  }

  const users = getUsers();
  const user = users.find(u => u.email === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ message: 'Login exitoso', user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Sesión cerrada' });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.status(401).json({ message: 'No autenticado' });
});

module.exports = router;
