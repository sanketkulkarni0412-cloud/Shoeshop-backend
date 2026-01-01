const path = require('path');
console.log('CWD:', process.cwd());
console.log('Expected firebaseAdmin path:', path.resolve(__dirname, '../firebaseAdmin.js'));
try {
    require('../firebaseAdmin.js');
    console.log('Successfully required firebaseAdmin.js');
} catch (e) {
    console.error('Failed to require firebaseAdmin.js:', e);
}
