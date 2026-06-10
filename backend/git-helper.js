const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Check the last few git commits to see if there is any commit message or changes showing env setup
  const log = execSync('git log -p -n 5', { encoding: 'utf8' });
  fs.writeFileSync(path.join(__dirname, 'git-history.txt'), log, 'utf8');
  console.log("Git history written successfully.");
} catch (err) {
  fs.writeFileSync(path.join(__dirname, 'git-history.txt'), "Failed: " + err.message + "\n" + err.stack, 'utf8');
}
