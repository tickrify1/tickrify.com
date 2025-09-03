// Script de debug para verificar problemas na aplicação
console.log('=== DEBUG APP ===');

// Verificar se há problemas de importação ou runtime
const fs = require('fs');
const path = require('path');

// Verificar se todos os arquivos essenciais existem
const requiredFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/components/Layout/MobileOptimizer.tsx',
  'src/hooks/useDeviceDetection.ts',
  'src/hooks/useAuth.tsx',
  'src/hooks/useSubscription.tsx',
  'src/pages/Landing.tsx'
];

console.log('Verificando arquivos essenciais...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Verificar package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = require('./package.json');
  console.log('\n=== DEPENDENCIES ===');
  console.log('React:', packageJson.dependencies?.react || 'NOT FOUND');
  console.log('React-DOM:', packageJson.dependencies?.['react-dom'] || 'NOT FOUND');
  console.log('TypeScript:', packageJson.devDependencies?.typescript || 'NOT FOUND');
  console.log('Vite:', packageJson.devDependencies?.vite || 'NOT FOUND');
}

console.log('\n=== CHECK COMPLETE ===');
