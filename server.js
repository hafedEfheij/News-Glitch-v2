// This file is used by Glitch to start the application
// It's a simple wrapper around the Next.js start command

const { exec } = require('child_process');
const port = process.env.PORT || 3000;

// Build the application first
console.log('Building the Next.js application...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error}`);
    return;
  }
  
  console.log(stdout);
  
  // Start the Next.js server
  console.log(`Starting Next.js server on port ${port}...`);
  const server = exec(`npm run start`);
  
  server.stdout.on('data', (data) => {
    console.log(data);
  });
  
  server.stderr.on('data', (data) => {
    console.error(data);
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
});
