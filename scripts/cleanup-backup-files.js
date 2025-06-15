/**
 * Script to clean up backup and corrupted files
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of backup/corrupted files to clean up
const filesToClean = [
  'src/services/dataEnrichmentService.backup.ts',
  'src/services/dataEnrichmentService.original.ts',
  'src/services/platformApiService.backup.ts',
  'src/services/platformApiService.original.ts',
  'src/services/platformSyncService.backup.ts',
  'src/services/platformSyncService.original.ts',
  'src/services/realTimeLeadDiscoveryService.backup.ts',
  'src/services/realTimeLeadDiscoveryService.original.ts',
  'src/services/realVisitorTrackingService.backup.ts',
  'src/services/realVisitorTrackingService.corrupted.ts',
  'src/services/realVisitorTrackingService.original.ts'
];

// Create a backup directory if it doesn't exist
const backupDir = path.join(dirname(__dirname), 'backup-files');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Move files to backup directory
filesToClean.forEach(file => {
  const sourcePath = path.join(dirname(__dirname), file);
  if (fs.existsSync(sourcePath)) {
    const fileName = path.basename(file);
    const destPath = path.join(backupDir, fileName);
    
    try {
      // Copy file to backup directory
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Backed up ${file} to ${path.relative(dirname(__dirname), destPath)}`);
      
      // Remove original file
      fs.unlinkSync(sourcePath);
      console.log(`Removed ${file}`);
    } catch (error) {
      console.error(`Error handling ${file}:`, error.message);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Cleanup completed.');
