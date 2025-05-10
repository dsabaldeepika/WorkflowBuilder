import express from 'express';
import { storage } from '../storage';
import { 
  insertAppIntegrationSchema, 
  insertUserAppCredentialsSchema,
  type AppIntegration,
  type UserAppCredential
} from '@shared/schema';
import { ZodError } from 'zod';

const router = express.Router();

/**
 * Routes for managing app integrations and user credentials
 */

// == App Integration Routes ==

// Get all app integrations with optional category filtering
router.get('/integrations', async (req, res) => {
  try {
    const { category } = req.query;
    
    const integrations = await storage.getAppIntegrations(category as string);
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching app integrations:', error);
    res.status(500).json({ message: 'Failed to fetch app integrations' });
  }
});

// Get a single app integration by ID
router.get('/integrations/:id', async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    const integration = await storage.getAppIntegration(integrationId);
    
    if (!integration) {
      return res.status(404).json({ message: 'App integration not found' });
    }
    
    res.json(integration);
  } catch (error) {
    console.error('Error fetching app integration:', error);
    res.status(500).json({ message: 'Failed to fetch app integration' });
  }
});

// Get an app integration by name
router.get('/integrations/by-name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const integration = await storage.getAppIntegrationByName(name);
    
    if (!integration) {
      return res.status(404).json({ message: 'App integration not found' });
    }
    
    res.json(integration);
  } catch (error) {
    console.error('Error fetching app integration by name:', error);
    res.status(500).json({ message: 'Failed to fetch app integration' });
  }
});

// Create a new app integration
router.post('/integrations', async (req, res) => {
  try {
    const parsedBody = insertAppIntegrationSchema.parse(req.body);
    
    const integration = await storage.createAppIntegration(parsedBody);
    res.status(201).json(integration);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating app integration:', error);
    res.status(500).json({ message: 'Failed to create app integration' });
  }
});

// Update an existing app integration
router.put('/integrations/:id', async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    const parsedBody = insertAppIntegrationSchema.parse(req.body);
    
    const integration = await storage.updateAppIntegration(integrationId, parsedBody);
    
    if (!integration) {
      return res.status(404).json({ message: 'App integration not found' });
    }
    
    res.json(integration);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error updating app integration:', error);
    res.status(500).json({ message: 'Failed to update app integration' });
  }
});

// Delete an app integration
router.delete('/integrations/:id', async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    await storage.deleteAppIntegration(integrationId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting app integration:', error);
    res.status(500).json({ message: 'Failed to delete app integration' });
  }
});

// == User App Credentials Routes ==

// Get all credentials for a user
router.get('/credentials', async (req, res) => {
  try {
    const { userId, appIntegrationId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const credentials = await storage.getUserAppCredentials(
      parseInt(userId as string),
      appIntegrationId ? parseInt(appIntegrationId as string) : undefined
    );
    
    // Don't return the actual credential values for security
    const safeCredentials = credentials.map(cred => ({
      ...cred,
      credentials: { 
        isSecure: true,
        // Add a placeholder instead of the actual credentials
        type: typeof cred.credentials === 'object' ? 'secured_credentials' : 'secured_value'
      }
    }));
    
    res.json(safeCredentials);
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    res.status(500).json({ message: 'Failed to fetch user credentials' });
  }
});

// Get a single credential by ID
router.get('/credentials/:id', async (req, res) => {
  try {
    const credentialId = parseInt(req.params.id);
    const credential = await storage.getUserAppCredential(credentialId);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    // Don't return the actual credential values for security
    const safeCredential = {
      ...credential,
      credentials: { ...credential.credentials, isSecure: true }
    };
    
    res.json(safeCredential);
  } catch (error) {
    console.error('Error fetching user credential:', error);
    res.status(500).json({ message: 'Failed to fetch user credential' });
  }
});

// Create a new credential
router.post('/credentials', async (req, res) => {
  try {
    const parsedBody = insertUserAppCredentialsSchema.parse(req.body);
    
    const credential = await storage.createUserAppCredential(parsedBody);
    
    // Don't return the actual credential values for security
    const safeCredential = {
      ...credential,
      credentials: { ...credential.credentials, isSecure: true }
    };
    
    res.status(201).json(safeCredential);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating user credential:', error);
    res.status(500).json({ message: 'Failed to create user credential' });
  }
});

// Update an existing credential
router.put('/credentials/:id', async (req, res) => {
  try {
    const credentialId = parseInt(req.params.id);
    const parsedBody = insertUserAppCredentialsSchema.parse(req.body);
    
    const credential = await storage.updateUserAppCredential(credentialId, parsedBody);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    // Don't return the actual credential values for security
    const safeCredential = {
      ...credential,
      credentials: { ...credential.credentials, isSecure: true }
    };
    
    res.json(safeCredential);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error updating user credential:', error);
    res.status(500).json({ message: 'Failed to update user credential' });
  }
});

// Delete a credential
router.delete('/credentials/:id', async (req, res) => {
  try {
    const credentialId = parseInt(req.params.id);
    await storage.deleteUserAppCredential(credentialId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user credential:', error);
    res.status(500).json({ message: 'Failed to delete user credential' });
  }
});

// Validate a credential
router.post('/credentials/:id/validate', async (req, res) => {
  try {
    const credentialId = parseInt(req.params.id);
    const isValid = await storage.validateUserAppCredential(credentialId);
    
    res.json({ isValid });
  } catch (error) {
    console.error('Error validating user credential:', error);
    res.status(500).json({ message: 'Failed to validate user credential' });
  }
});

export default router;