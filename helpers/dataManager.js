const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '..', 'data');
const usersPath = path.join(dataDir, 'users.json');
const resourcesPath = path.join(dataDir, 'resources.json');
const commentsPath = path.join(dataDir, 'comments.json');

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersPath)) {
    const adminPassword = bcrypt.hashSync('Admin123!', 10);
    fs.writeFileSync(usersPath, JSON.stringify([
      {
        id: uuidv4(),
        name: 'Administrador',
        email: 'admin@vaultunlocked.test',
        password: adminPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ], null, 2));
  }

  if (!fs.existsSync(resourcesPath)) {
    fs.writeFileSync(resourcesPath, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(commentsPath)) {
    fs.writeFileSync(commentsPath, JSON.stringify([], null, 2));
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUsers() {
  return readJson(usersPath);
}

function saveUsers(users) {
  writeJson(usersPath, users);
}

function getResources() {
  return readJson(resourcesPath);
}

function saveResources(resources) {
  writeJson(resourcesPath, resources);
}

function getComments() {
  return readJson(commentsPath);
}

function saveComments(comments) {
  writeJson(commentsPath, comments);
}

module.exports = {
  ensureDataFiles,
  getUsers,
  saveUsers,
  getResources,
  saveResources,
  getComments,
  saveComments
};
