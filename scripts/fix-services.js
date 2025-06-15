/**
 * Script to fix TypeScript service files by:
 * 1. Converting import.meta.env references to process.env
 * 2. Fixing @/types/* imports to use relative paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const servicesDir = path.join(srcDir, 'services');
const typesDir = path.join(srcDir, 'types');

/**
 * Gets a relative path from one file to another
 * @param {string} from - Source file path
 * @param {string} to - Target file path
 * @returns {string} - Relative path
 */
function getRelativePath(from, to) {
    const fromDir = path.dirname(from);
    const relativePath = path.relative(fromDir, to);
    
    // Ensure the path starts with ./ if it's not going up directories
    if (!relativePath.startsWith('.')) {
        return './' + relativePath;
    }
    
    return relativePath;
}

/**
 * Process a single TypeScript file
 * @param {string} filePath - Path to the TypeScript file
 */
function processFile(filePath) {
    console.log(`Processing ${filePath}...`);
    
    try {
        // Read file content
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace import.meta.env with process.env
        content = content.replace(/import\.meta\.env\.([A-Za-z0-9_]+)/g, 'process.env.$1');
        
        // Replace @/types imports with relative paths
        content = content.replace(
            /from\s+['"]@\/types\/([^'"]*)['"]/g, 
            (match, typePath) => {
                const fullTypePath = path.join(typesDir, `${typePath}.ts`);
                let relativePath = getRelativePath(filePath, fullTypePath);
                
                // Convert Windows backslashes to forward slashes for imports
                relativePath = relativePath.replace(/\\/g, '/');
                
                // Remove .ts extension for imports
                relativePath = relativePath.replace(/\.ts$/, '');
                
                return `from '${relativePath}'`;
            }
        );
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${filePath}`);
    } catch (error) {
        console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
}

/**
 * Process all TypeScript files in a directory recursively
 * @param {string} dir - Directory to process
 */
function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Recursively process subdirectories
            processDirectory(filePath);
        } else if (path.extname(file) === '.ts') {
            // Process TypeScript files
            processFile(filePath);
        }
    }
}

// Main execution
console.log('🔧 Service Files TypeScript Compatibility Fixer');
console.log('=============================================');
console.log('Converting:');
console.log('1. import.meta.env -> process.env');
console.log('2. @/types/* imports -> relative paths');
console.log('=============================================');

try {
    // First, let's restore the original files from any backups
    // Let's scan for realVisitorTrackingService original first
    const originalFiles = fs.readdirSync(servicesDir)
        .filter(file => file.includes('.original.'))
        .map(file => path.join(servicesDir, file));
        
    if (originalFiles.length > 0) {
        console.log('Found backup files. Restoring originals first...');
        for (const origFile of originalFiles) {
            const targetFile = origFile.replace('.original.', '.');
            console.log(`Restoring ${path.basename(targetFile)} from backup`);
            fs.copyFileSync(origFile, targetFile);
        }
    }
    
    // Now process all service files
    processDirectory(servicesDir);
    console.log('✅ All service files processed successfully!');
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}
