const express = require('express');
const path = require('path');

const app = express();

// 👇 ESTA ES LA RUTA CORRECTA DE TU BUILD
const distPath = path.join(__dirname, 'dist/frontend-proyecto-angular');

console.log('Serving from:', distPath);

// Servir archivos estáticos
app.use(express.static(distPath));

// Soporte para rutas Angular (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});