const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist/proyecto-angular-completo1')));

// Redirigir todas las rutas a index.html (para Angular Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/proyecto-angular-completo1', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
