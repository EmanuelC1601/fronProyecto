const fs = require('fs');
const path = require('path');

console.log('=== VERIFICACIÓN DE BUILD ===');
console.log('Directorio actual:', __dirname);

// Verificar estructura
console.log('\n📁 Contenido del directorio raíz:');
fs.readdirSync(__dirname).forEach(item => {
  const itemPath = path.join(__dirname, item);
  const stats = fs.statSync(itemPath);
  console.log(`  ${item}${stats.isDirectory() ? '/' : ''}`);
});

// Verificar dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('\n📦 Contenido de dist/:');
  fs.readdirSync(distPath).forEach(item => {
    console.log(`  ${item}`);
  });
} else {
  console.log('\n❌ Carpeta dist/ no existe');
}

// Buscar index.html
console.log('\n🔍 Buscando index.html...');
function findIndexHtml(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (item === 'index.html') {
      console.log(`  ✅ Encontrado: ${fullPath}`);
    }
    if (fs.statSync(fullPath).isDirectory() && !item.includes('node_modules')) {
      findIndexHtml(fullPath);
    }
  }
}
findIndexHtml(__dirname);
