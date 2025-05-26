import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Serve static HTML file
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'launcher.html');
  
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading launcher HTML:', err);
      return res.status(500).send('Error loading launcher page');
    }
    
    // Update the URL hosts to match Replit
    const hostname = req.hostname;
    const modified = data
      .replace('http://localhost:3000', `https://${hostname}:3100`)
      .replace('http://localhost:3001', `https://${hostname}:3001`);
    
    res.send(modified);
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PumpFlux Launcher running at http://0.0.0.0:${PORT}`);
});