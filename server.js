const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

console.log('=== SERVER STARTING ===');
console.log('Current directory:', __dirname);

// Solo busca en estas rutas (NO intenta construir)
const possiblePaths = [
  path.join(__dirname, 'dist/proyecto-angular-completo1/browser'),
  path.join(__dirname, 'dist/proyecto-angular-completo1'),
  path.join(__dirname, 'dist')
];

let distPath = null;

for (const p of possiblePaths) {
  const indexPath = path.join(p, 'index.html');
  console.log(`Checking: ${indexPath}`);
  if (fs.existsSync(indexPath)) {
    distPath = p;
    console.log(`✅ FOUND index.html at: ${indexPath}`);
    break;
  }
}

if (!distPath) {
  console.error('❌ ERROR: No build found!');
  console.error('Expected in one of:');
  possiblePaths.forEach(p => console.error(`  - ${p}/index.html`));
  
  // Simple error page
  app.get('*', (req, res) => {
    res.status(500).send(`
      <h1>Build Error</h1>
      <p>Application not built. Check Render logs.</p>
    `);
  });
} else {
  console.log(`✅ Serving from: ${distPath}`);
  app.use(express.static(distPath));
  
  // SPA: all routes to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
