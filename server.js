const express = require('express');
const path = require('path');
const app = express();

const distPath = path.join(__dirname, 'dist/proyecto-angular-completo1');

// Middleware para verificar si la ruta existe
app.use((req, res, next) => {
  console.log('Solicitud recibida para:', req.url);
  console.log('Buscando en la ruta:', distPath);
  next();
});

app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('Intentando enviar index.html desde:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error al enviar index.html:', err);
      res.status(500).send('Error interno del servidor');
    }
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en el puerto ${port}`);
  console.log(`Ruta de archivos estáticos: ${distPath}`);
});
