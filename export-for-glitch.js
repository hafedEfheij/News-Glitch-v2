const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a directory for the export
const exportDir = path.join(__dirname, 'glitch-export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Files and directories to include in the export
const filesToInclude = [
  '.env.example',
  '.gitignore',
  'glitch.json',
  'next.config.js',
  'package.json',
  'package-lock.json',
  'README.md',
  'server.js',
  'start.sh',
  'watch.json',
  'DEPLOYMENT_GUIDE.md',
  'public',
  'src',
  'tailwind.config.js',
  'postcss.config.mjs',
  'tsconfig.json'
];

// Copy files to the export directory
filesToInclude.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(exportDir, file);
  
  if (fs.existsSync(sourcePath)) {
    if (fs.lstatSync(sourcePath).isDirectory()) {
      // If it's a directory, use a recursive copy
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      // Use a simple recursive copy function
      const copyRecursive = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
              fs.mkdirSync(destPath, { recursive: true });
            }
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      copyRecursive(sourcePath, destPath);
    } else {
      // If it's a file, just copy it
      fs.copyFileSync(sourcePath, destPath);
    }
    
    console.log(`Copied: ${file}`);
  } else {
    console.warn(`Warning: ${file} does not exist and was not copied.`);
  }
});

console.log(`\nExport completed! Files are in: ${exportDir}`);
console.log('You can now zip this directory and upload it to Glitch.');
