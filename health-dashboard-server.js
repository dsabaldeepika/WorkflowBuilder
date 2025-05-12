import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Serve static HTML file
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'health-dashboard.html');
  
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading health dashboard HTML:', err);
      return res.status(500).send('Error loading health dashboard');
    }
    
    res.send(data);
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Workflow Health Dashboard running at http://0.0.0.0:${PORT}`);
});