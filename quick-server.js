import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple Express server
const app = express();
const port = 3000; // Use a different port to avoid conflicts

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve the standalone workflow page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'direct-launch.html'));
});

// Serve the workflow suggestions demo
app.get('/suggestions-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'suggestions-demo.html'));
});

// Create a mock API endpoint for workflow templates
app.get('/api/workflow/templates', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Customer Onboarding",
      description: "Automated workflow for new customer onboarding",
      category: "CRM",
      tags: ["customer", "onboarding", "automation"],
      previewImageUrl: "https://via.placeholder.com/300x200",
      workflowData: { nodes: [], edges: [] },
      popularity: 120,
      isOfficial: true,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Lead Nurturing",
      description: "Automated lead nurturing workflow with email sequences",
      category: "Marketing",
      tags: ["lead", "nurturing", "email"],
      previewImageUrl: "https://via.placeholder.com/300x200",
      workflowData: { nodes: [], edges: [] },
      popularity: 85,
      isOfficial: true,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

// Create a mock API endpoint for user authentication
app.get('/api/auth/user', (req, res) => {
  res.json({
    id: 1,
    username: 'demo_user',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
    subscriptionTier: 'pro',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Redirect workflow URLs to the standalone page
app.get('/create-workflow', (req, res) => {
  res.sendFile(path.join(__dirname, 'direct-launch.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Standalone workflow app running at http://0.0.0.0:${port}`);
});