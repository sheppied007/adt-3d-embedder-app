const express = require('express');
const path = require('path');
const setupProxy = require('./src/setupProxy'); // reuse your existing proxy setup

const app = express();

// Apply the proxy middleware from your existing setupProxy.js
setupProxy(app);

// Serve the static React build folder
app.use(express.static(path.join(__dirname, 'build')));

// SPA fallback — redirect all routes to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});