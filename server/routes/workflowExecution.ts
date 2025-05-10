import express from 'express';
import { storage } from '../storage';
import { ZodError } from 'zod';

const router = express.Router();

/**
 * Routes for workflow execution and node execution tracking
 */

// Get all runs for a workflow
router.get('/runs/:workflowId', async (req, res) => {
  try {
    const workflowId = parseInt(req.params.workflowId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const runs = await storage.getWorkflowRuns(workflowId, limit);
    res.json(runs);
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    res.status(500).json({ message: 'Failed to fetch workflow runs' });
  }
});

// Start a new workflow run
router.post('/runs/:workflowId/start', async (req, res) => {
  try {
    const workflowId = parseInt(req.params.workflowId);
    const { userId } = req.body;
    
    const startedByUserId = userId ? parseInt(userId) : null;
    const startTime = new Date();
    
    const run = await storage.recordWorkflowRun(
      workflowId,
      startedByUserId,
      'running',
      startTime
    );
    
    res.status(201).json(run);
  } catch (error) {
    console.error('Error starting workflow run:', error);
    res.status(500).json({ message: 'Failed to start workflow run' });
  }
});

// Complete a workflow run
router.post('/runs/:runId/complete', async (req, res) => {
  try {
    const runId = parseInt(req.params.runId);
    const { status, errorMessage, errorCategory } = req.body;
    
    const endTime = new Date();
    
    const run = await storage.completeWorkflowRun(
      runId,
      status,
      endTime,
      errorMessage,
      errorCategory
    );
    
    if (!run) {
      return res.status(404).json({ message: 'Workflow run not found' });
    }
    
    res.json(run);
  } catch (error) {
    console.error('Error completing workflow run:', error);
    res.status(500).json({ message: 'Failed to complete workflow run' });
  }
});

// Get all node executions for a workflow run
router.get('/runs/:runId/nodes', async (req, res) => {
  try {
    const runId = parseInt(req.params.runId);
    
    const nodeExecutions = await storage.getNodeExecutions(runId);
    res.json(nodeExecutions);
  } catch (error) {
    console.error('Error fetching node executions:', error);
    res.status(500).json({ message: 'Failed to fetch node executions' });
  }
});

// Record a new node execution
router.post('/runs/:runId/nodes', async (req, res) => {
  try {
    const runId = parseInt(req.params.runId);
    const { nodeId, status, executionOrder, startTime } = req.body;
    
    if (!nodeId || !status || executionOrder === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: nodeId, status, executionOrder' 
      });
    }
    
    const nodeExecution = await storage.recordNodeExecution(
      runId,
      nodeId,
      status,
      executionOrder,
      startTime ? new Date(startTime) : undefined
    );
    
    res.status(201).json(nodeExecution);
  } catch (error) {
    console.error('Error recording node execution:', error);
    res.status(500).json({ message: 'Failed to record node execution' });
  }
});

// Update input data for a node execution
router.put('/nodes/:nodeExecutionId/input', async (req, res) => {
  try {
    const nodeExecutionId = parseInt(req.params.nodeExecutionId);
    const { inputData } = req.body;
    
    if (!inputData) {
      return res.status(400).json({ message: 'Input data is required' });
    }
    
    const success = await storage.updateNodeExecutionInputData(
      nodeExecutionId,
      inputData
    );
    
    if (!success) {
      return res.status(404).json({ message: 'Node execution not found' });
    }
    
    res.json({ success });
  } catch (error) {
    console.error('Error updating node input data:', error);
    res.status(500).json({ message: 'Failed to update node input data' });
  }
});

// Complete a node execution
router.post('/nodes/:nodeExecutionId/complete', async (req, res) => {
  try {
    const nodeExecutionId = parseInt(req.params.nodeExecutionId);
    const { status, outputData, errorMessage, errorCategory } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const endTime = new Date();
    
    const nodeExecution = await storage.completeNodeExecution(
      nodeExecutionId,
      status,
      endTime,
      outputData,
      errorMessage,
      errorCategory
    );
    
    if (!nodeExecution) {
      return res.status(404).json({ message: 'Node execution not found' });
    }
    
    res.json(nodeExecution);
  } catch (error) {
    console.error('Error completing node execution:', error);
    res.status(500).json({ message: 'Failed to complete node execution' });
  }
});

// Retry a node execution
router.post('/nodes/:nodeExecutionId/retry', async (req, res) => {
  try {
    const nodeExecutionId = parseInt(req.params.nodeExecutionId);
    
    const startTime = new Date();
    
    const nodeExecution = await storage.retryNodeExecution(
      nodeExecutionId,
      startTime
    );
    
    if (!nodeExecution) {
      return res.status(404).json({ message: 'Node execution not found' });
    }
    
    res.json(nodeExecution);
  } catch (error) {
    console.error('Error retrying node execution:', error);
    res.status(500).json({ message: 'Failed to retry node execution' });
  }
});

export default router;