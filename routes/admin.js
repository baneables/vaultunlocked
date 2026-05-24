const express = require('express');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const { getUsers, saveUsers, getResources, saveResources, getComments, saveComments } = require('../helpers/dataManager');

const router = express.Router();

router.use(ensureAuth, ensureAdmin);

router.get('/users', (req, res) => {
  const users = getUsers().map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));
  res.json(users);
});

router.delete('/users/:id', (req, res) => {
  const users = getUsers();
  const updated = users.filter(u => u.id !== req.params.id);
  saveUsers(updated);
  res.json({ message: 'Usuario eliminado' });
});

router.get('/resources', (req, res) => {
  const resources = getResources();
  res.json(resources);
});

router.delete('/resources/:id', (req, res) => {
  const resources = getResources();
  const updated = resources.filter(r => r.id !== req.params.id);
  saveResources(updated);
  const comments = getComments().filter(comment => comment.resourceId !== req.params.id);
  saveComments(comments);
  res.json({ message: 'Recurso eliminado' });
});

router.put('/resources/:id', (req, res) => {
  const { title, description, category } = req.body;
  const resources = getResources();
  const resource = resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ message: 'Recurso no encontrado' });
  }
  resource.title = title || resource.title;
  resource.description = description || resource.description;
  resource.category = category || resource.category;
  saveResources(resources);
  res.json({ message: 'Recurso actualizado', resource });
});

module.exports = router;
