const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

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

// If in Render and no distPath found, try to build
if (!distPath && process.env.RENDER) {
  console.log('Build not found. Attempting to build the application...');
  try {
    // We are in the root directory of the project, so run the build
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    console.error('Build failed:', error);
    // We can't start the server without the build, so exit
    process.exit(1);
  }
  // After build, try to find the distPath again
  for (const possiblePath of possiblePaths) {
    distPath = findIndexHtml(possiblePath);
    if (distPath) {
      break;
    }
  }
}

if (!distPath) {
  console.error('Could not find the built Angular app.');
  app.get('*', (req, res) => {
    res.status(500).send(`
      <h1>Error: Application not built</h1>
      <p>Please check the build logs on Render.</p>
      <p>If you are running locally, run 'npm run build' first.</p>
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
