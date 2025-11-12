// Servidor simple para servir archivos estáticos en Azure App Service
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Logging para debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Servir archivos estáticos desde la carpeta dist
const distPath = join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.error('ERROR: dist folder not found at:', distPath);
  console.error('Current directory:', __dirname);
  app.get('*', (req, res) => {
    res.status(500).send('Build files not found. Please run npm run build first.');
  });
} else {
  console.log('✅ dist folder found at:', distPath);
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true
  }));
}

// Para React Router: todas las rutas que no sean archivos estáticos
// deben servir el index.html
app.get('*', (req, res) => {
  try {
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      const indexHtml = readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(indexHtml);
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(500).send('index.html not found');
    }
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send(`Error loading application: ${error.message}`);
  }
});

// Manejo de errores del servidor
app.on('error', (error) => {
  console.error('Server error:', error);
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

