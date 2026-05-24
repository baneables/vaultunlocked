const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const adminRoutes = require('./routes/admin');
const { ensureDataFiles } = require('./helpers/dataManager');

const app = express();
const PORT = process.env.PORT || 3000;

ensureDataFiles();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'vaultunlocked-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/resource', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resource.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

app.listen(PORT, () => {
  console.log(`VaultUnlocked ejecutándose en http://localhost:${PORT}`);
});
