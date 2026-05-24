const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ensureAuth } = require('../middleware/auth');
const { getResources, saveResources, getComments, saveComments } = require('../helpers/dataManager');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Map de tamaños máximos por categoría (MB)
const categoryMaxMB = {
  plugins: 50,
  mods: 200,
  assets: 300,
  scripts: 10,
  texturas: 150,
  mapas: 500,
  utilidades: 20
};

router.get('/', (req, res) => {
  const resources = getResources();
  res.json(resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Devuelve la lista de categorías únicas
router.get('/categories', (req, res) => {
  const resources = getResources();
  const cats = Array.from(new Set(resources.map(r => (r.category || 'sin categoría').toString().toLowerCase())));
  res.json(cats.sort());
});

router.post('/upload', ensureAuth, (req, res) => {
  // category must be provided as query param so we can set multer limits before parsing
  const categoryQuery = (req.query.category || '').toString().toLowerCase();
  const maxMB = categoryMaxMB[categoryQuery] || 100;
  const upload = multer({ storage, limits: { fileSize: maxMB * 1024 * 1024 } });

  upload.single('file')(req, res, err => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: `El archivo excede el límite de ${maxMB}MB para la categoría ${categoryQuery || 'predeterminada'}` });
      }
      return res.status(400).json({ message: err.message });
    }

    const { title, description, category } = req.body;
    const usedCategory = category || categoryQuery;
    if (!req.file || !title || !description || !usedCategory) {
      return res.status(400).json({ message: 'Todos los campos y el archivo son obligatorios' });
    }

    const resources = getResources();
    const newResource = {
      id: uuidv4(),
      title,
      description,
      category: usedCategory,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploaderId: req.session.user.id,
      uploaderName: req.session.user.name,
      createdAt: new Date().toISOString(),
      downloads: 0
    };

    resources.push(newResource);
    saveResources(resources);
    res.json({ message: 'Recurso subido correctamente', resource: newResource });
  });
});

router.get('/:id', (req, res) => {
  const resources = getResources();
  const resource = resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ message: 'Recurso no encontrado' });
  }
  res.json(resource);
});

router.post('/:id/comments', ensureAuth, (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'El comentario no puede estar vacío' });
  }

  const resources = getResources();
  const resource = resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ message: 'Recurso no encontrado' });
  }

  const comments = getComments();
  const newComment = {
    id: uuidv4(),
    resourceId: resource.id,
    userId: req.session.user.id,
    userName: req.session.user.name,
    text,
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  saveComments(comments);
  res.json({ message: 'Comentario agregado', comment: newComment });
});

router.get('/:id/comments', (req, res) => {
  const comments = getComments();
  const resourceComments = comments
    .filter(comment => comment.resourceId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(resourceComments);
});

router.post('/:id/download', (req, res) => {
  const resources = getResources();
  const resource = resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ message: 'Recurso no encontrado' });
  }

  resource.downloads += 1;
  saveResources(resources);
  res.json({ message: 'Descarga registrada' });
});

module.exports = router;
