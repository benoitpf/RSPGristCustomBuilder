const http = require('http');
const { spawn } = require('child_process');

async function testServer() {
  console.log('Starting server...');
  const serverProcess = spawn('node', ['server.js'], { stdio: 'pipe' });

  // Wait for server to start
  await new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('Serveur démarré')) {
        resolve();
      }
    });
  });

  const checkPath = async (path, expectedStatus) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:8080${path}`, (res) => {
        console.log(`GET ${path} - Status: ${res.statusCode}`);
        if (res.statusCode === expectedStatus) {
          resolve();
        } else {
          reject(new Error(`Path ${path} returned status ${res.statusCode}, expected ${expectedStatus}`));
        }
      }).on('error', reject);
    });
  };

  try {
    await checkPath('/', 200);
    await checkPath('/index.html', 200);
    await checkPath('/MESIRH/RSP/RSPWidget.js', 200);
    await checkPath('/non-existent', 500); // server.js returns 500 on error (like file not found)
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  } finally {
    serverProcess.kill();
  }
}

testServer();
