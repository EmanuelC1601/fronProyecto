const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Function to check if index.html exists in a given path
function findIndexHtml(dir) {
  const indexPath = path.join(dir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return dir;
  }
  return null;
}

// Possible paths for the built Angular app
const possiblePaths = [
  path.join(__dirname, 'dist/proyecto-angular-completo1/browser'),
  path.join(__dirname, 'dist/proyecto-angular-completo1'),
  path.join(__dirname, 'dist')
];

let distPath = null;

for (const possiblePath of possiblePaths) {
  distPath = findIndexHtml(possiblePath);
  if (distPath) {
    break;
  }
}

if (!distPath) {
  console.error('Could not find the built Angular app.');
  console.log('Searched in the following paths:');
  possiblePaths.forEach(p => console.log('  - ' + p));
  
  // List the current directory structure for debugging
  console.log('Current directory structure:');
  function listDir(dir, indent) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      console.log(indent + file + (stat.isDirectory() ? '/' : ''));
      if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
        listDir(filePath, indent + '  ');
      }
    });
  }
  try {
    listDir(__dirname, '  ');
  } catch (e) {
    console.error('Error listing directory:', e.message);
  }

  app.get('*', (req, res) => {
    res.status(500).send(`
      <h1>Error: Application not built</h1>
      <p>The built Angular application was not found in the expected location.</p>
      <p>Please check the build logs on Render. The build command must include 'npm run build'.</p>
      <p>Current directory: ${__dirname}</p>
      <p>Searched paths:</p>
      <ul>
        ${possiblePaths.map(p => `<li>${p}</li>`).join('')}
      </ul>
    `);
  });
} else {
  console.log(`Serving static files from ${distPath}`);
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
