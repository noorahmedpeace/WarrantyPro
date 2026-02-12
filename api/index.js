// Set the correct working directory for module resolution
process.chdir(__dirname + '/../backend');

// Now require the server with correct context
const app = require('../backend/server');

module.exports = app;
