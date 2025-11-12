// Servidor simple para servir archivos estáticos en Azure App Service
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(join(__dirname, 'dist')));

// Para React Router: todas las rutas que no sean archivos estáticos
// deben servir el index.html
app.get('*', (req, res) => {
  try {
    const indexHtml = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf8');
    res.send(indexHtml);
  } catch (error) {
    res.status(500).send('Error loading application');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

