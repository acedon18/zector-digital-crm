/**
 * Script to fix TypeScript import/export statements for backend files
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define backend directories to process
const directories = [
  'src/backend',
  'src/services'
];

// Get all TypeScript files
const getAllTsFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.name.endsWith('.ts') && 
              !item.name.includes('.backup.') && 
              !item.name.includes('.original.') && 
              !item.name.includes('.corrupted.')) {
      files.push(fullPath);
    }
  });
  
  return files;
};

let tsFiles = [];
directories.forEach(dir => {
  const fullDir = path.join(dirname(__dirname), dir);
  if (fs.existsSync(fullDir)) {
    tsFiles.push(...getAllTsFiles(fullDir));
  }
});

console.log(`Found ${tsFiles.length} TypeScript files to process`);

// Process each file
let fixedCount = 0;
tsFiles.forEach(file => {
  console.log(`Processing ${path.relative(dirname(__dirname), file)}`);
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Fix imports from @/types to relative paths
  content = content.replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]@\/types\/([^'"]+)['"]/g, 
    (match, imports, typePath) => {
      const relativePath = path.relative(
        path.dirname(file), 
        path.join(dirname(__dirname), 'src', 'types', typePath)
      ).replace(/\\/g, '/');
      
      return `import { ${imports} } from "${relativePath}"`;
    });
  
  // Fix other imports from @ to relative paths
  content = content.replace(/import\s+([^'"]+)\s+from\s+['"]@\/([^'"]+)['"]/g, 
    (match, imports, importPath) => {
      const relativePath = path.relative(
        path.dirname(file), 
        path.join(dirname(__dirname), 'src', importPath)
      ).replace(/\\/g, '/');
      
      return `import ${imports} from "${relativePath}"`;
    });

  // Fix import.meta.env to process.env
  content = content.replace(/import\.meta\.env\.([A-Z_]+)/g, 'process.env.$1');
  
  if (content !== originalContent) {
    // Backup the original file
    const backupPath = `${file}.pre-fix.bak`;
    fs.writeFileSync(backupPath, originalContent);
    console.log(`  Created backup at ${path.relative(dirname(__dirname), backupPath)}`);
    
    // Write the fixed content
    fs.writeFileSync(file, content);
    console.log(`  Fixed import statements in ${path.relative(dirname(__dirname), file)}`);
    fixedCount++;
  } else {
    console.log(`  No changes needed for ${path.relative(dirname(__dirname), file)}`);
  }
});

console.log(`\nFixed ${fixedCount} files out of ${tsFiles.length} total files`);

// Run TypeScript check
try {
  console.log('\nRunning TypeScript check...');
  execSync('npx tsc --noEmit -p tsconfig.backend.json', { stdio: 'inherit' });
  console.log('TypeScript check completed successfully!');
} catch (error) {
  console.error('TypeScript check failed with errors.');
}
