const path = require('path');
const { getUsers } = require('../helpers/dataManager');

function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'No autorizado' });
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.user) {
    const users = getUsers();
    const user = users.find(u => u.id === req.session.user.id);
    if (user && user.role === 'admin') {
      return next();
    }
  }
  res.status(403).json({ message: 'Acceso denegado' });
}

function attachUser(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
}

module.exports = {
  ensureAuth,
  ensureAdmin,
  attachUser
};
