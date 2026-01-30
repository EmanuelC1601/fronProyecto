const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Posibles rutas donde podría estar el build de Angular
// Angular 16+ genera una subcarpeta 'browser' dentro del outputPath
const possiblePaths = [
  path.join(__dirname, 'dist/proyecto-angular-completo1/browser'),
  path.join(__dirname, 'dist/proyecto-angular-completo1'),
  path.join(__dirname, 'dist')
];

let distPath = null;

// Buscar la primera ruta que contenga index.html
for (const possiblePath of possiblePaths) {
  const indexPath = path.join(possiblePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    distPath = possiblePath;
    break;
  }
}

if (distPath) {
  console.log(`Sirviendo archivos estáticos desde: ${distPath}`);
  app.use(express.static(distPath));

  // Para una SPA de Angular, todas las rutas deben redirigir a index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Si no se encuentra el build, mostrar un error detallado
  console.error('No se encontró el build de Angular. Las rutas verificadas fueron:');
  possiblePaths.forEach(p => console.error(`  - ${p}`));

  app.get('*', (req, res) => {
    res.status(500).send(`
      <h1>Error: Aplicación no construida</h1>
      <p>No se encontró la carpeta de construcción de Angular. Asegúrate de que:</p>
      <ol>
        <li>El comando de construcción (build) se ejecutó correctamente en Render.</li>
        <li>El comando de construcción genera la carpeta 'dist' con el index.html.</li>
      </ol>
      <p>Consulta los logs de construcción en Render para más detalles.</p>
    `);
  });
}

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
