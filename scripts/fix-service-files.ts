// Helper to convert service files to be TypeScript-backend compatible
// - Changes import.meta.env to process.env
// - Changes @/types/* imports to relative paths

import fs from 'fs';
import path from 'path';

// Configuration
const srcDir = path.join(process.cwd(), 'src');
const serviceDir = path.join(srcDir, 'services');
const typesDir = path.join(srcDir, 'types');

// Get relative path between two absolute paths
function getRelativePath(from: string, to: string): string {
  const relativePath = path.relative(path.dirname(from), to);
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
}

// Process a single file
function processFile(filePath: string): void {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace import.meta.env with process.env
  // - Add .VITE_ prefix to ensure proper mapping
  content = content.replace(/import\.meta\.env\.([A-Za-z0-9_]+)/g, 'process.env.$1');
  
  // Replace @/types imports with relative paths  
  content = content.replace(
    /from ['"]@\/types\/([^'"]+)['"]/g, 
    (match, typePath) => {
      const relativePath = getRelativePath(filePath, path.join(typesDir, typePath));
      return `from '${relativePath}'`;
    }
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath}`);
}

// Process all TypeScript files in the services directory
function processDirectory(dir: string): void {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(filePath);
    } else if (file.endsWith('.ts')) {
      // Process TypeScript files
      processFile(filePath);
    }
  }
}

// Main execution
console.log('🔧 Service Files TypeScript Compatibility Fixer');
console.log('=============================================');
console.log('Converting:');
console.log('1. import.meta.env → process.env');
console.log('2. @/types/* imports → relative paths');
console.log('=============================================');

try {
  processDirectory(serviceDir);
  console.log('✅ All service files processed successfully!');
} catch (error) {
  console.error('❌ Error processing files:', error);
  process.exit(1);
}
