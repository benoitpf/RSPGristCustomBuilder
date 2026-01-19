const http = require("http");
const fs = require('fs').promises;
const pathf = require('path');

const hostname = 'localhost';
const port = 8080;

const server = http.createServer(async (req, res) => { // Step 1: Use async function
    const fullUrl = new URL(req.url, `http://${req.headers.host}`);

    const path = fullUrl.pathname;            // "/maPage"
    const searchParams = fullUrl.searchParams; // objet pour lire les paramètres
    console.log('PATH :', path);
    console.log('param1 =', searchParams.get('param1'));
    let filePath = pathf.join(__dirname, path);

    let contentType;
    if (path === '/' || path === '/index.html') {
        filePath = pathf.join(__dirname, 'index.html'); // Step 2: Correct file path
        contentType = 'text/html; charset=utf-8';
    } else if (path.endsWith('.js')) {
        contentType = 'application/javascript; charset=utf-8';
    } else{
        contentType = 'text/html; charset=utf-8';
    }

    try {
        const contents = await fs.readFile(filePath); // Step 1: Use await for reading file
        res.setHeader("Content-Type", contentType);
        res.setHeader('Content-Length', contents.length);
        res.writeHead(200);
        res.end(contents);
    } catch (error) { // Step 2: Handle errors in catch block
        console.error(`Error: ${error.message}`);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Erreur serveur');
    }
});

server.listen(port, hostname, () => {
    console.log(`Serveur démarré sur http://${hostname}:${port}`);
});
