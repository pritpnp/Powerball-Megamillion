const { execSync } = require('child_process');

try {
  console.log('🎯 Running generate.js...');
  execSync('node generate.js', { stdio: 'inherit' });

  console.log('🛠 Updating index.html...');
  execSync('node update-index.js', { stdio: 'inherit' });

  console.log('✅ All done!');
} catch (error) {
  console.error('❌ Something went wrong:', error.message);
}