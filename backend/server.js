const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration HTTPS
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'private-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.pem'))
};

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const port = process.env.PORT || 3001;
https.createServer(options, app).listen(port, () => {
  console.log(`Serveur HTTPS démarré sur le port ${port}`);
}); 