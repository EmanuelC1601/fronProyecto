const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Verificar múltiples rutas posibles
const possiblePaths = [
  path.join(__dirname, 'dist/proyecto-angular-completo1'),
  path.join(__dirname, 'dist/proyecto-angular-completo1/browser'),
  path.join(__dirname, 'dist')
];

let distPath = null;
for (const possiblePath of possiblePaths) {
  const indexPath = path.join(possiblePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    distPath = possiblePath;
    console.log(`✅ Encontrado index.html en: ${indexPath}`);
    break;
  }
}

if (!distPath) {
  console.error('❌ ERROR: No se encontró index.html en ninguna ruta');
  console.log('Buscando archivos en:', __dirname);
  
  // Listar contenido del directorio
  const listFiles = (dir, prefix = '') => {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      console.log(`${prefix}${item}${stat.isDirectory() ? '/' : ''}`);
      if (stat.isDirectory() && !item.includes('node_modules')) {
        listFiles(itemPath, prefix + '  ');
      }
    });
  };
  
  listFiles(__dirname);
  
  // Crear una respuesta de error temporal
  app.get('*', (req, res) => {
    res.status(500).send(`
      <h1>Error: Aplicación no construida</h1>
      <p>El archivo index.html no se encontró en dist/</p>
      <p>Verifica los logs de build en Render</p>
    `);
  });
} else {
  // Servir archivos estáticos
  app.use(express.static(distPath));
  
  // Todas las rutas redirigen a index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en el puerto ${port}`);
});
