const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(__dirname, filePath);

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            // Serve index.html for all routes (SPA)
            fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else {
            const ext = path.extname(fullPath);
            const contentType =
                ext === '.css' ? 'text/css' :
                ext === '.js' ? 'application/javascript' : 'text/html';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(3001, () => {
    console.log('🚀 Frontend running FAST on http://localhost:3001');
    console.log('⚡ Optimized for speed');
});
