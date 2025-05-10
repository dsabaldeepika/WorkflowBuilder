import express from 'express';
import { WorkflowLogger } from '../services/workflowLogger';
import { RetryManager } from '../services/retryManager';
import { storage } from '../storage';

const router = express.Router();

// Get error logs for a workflow
router.get('/errors', async (req, res) => {
  try {
    const { workflowId, limit = 100, timeframe = 'day' } = req.query;
    
    // If workflowId is provided, get logs for that specific workflow
    if (workflowId) {
      const logs = await WorkflowLogger.getWorkflowLogs(workflowId as string, Number(limit));
      return res.json({ errors: logs });
    }
    
    // Otherwise, get general error stats
    const errorStats = await WorkflowLogger.getErrorStats(timeframe as 'day' | 'week' | 'month');
    res.json(errorStats);
  } catch (error) {
    console.error('Error fetching workflow logs:', error);
    res.status(500).json({ message: 'Failed to fetch workflow logs' });
  }
});

// Get execution history for a workflow
router.get('/executions/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { limit = 10 } = req.query;
    
    // This would typically fetch from a database
    // For now, we'll return a mock response
    res.json({
      executions: [
        {
          id: 'exec-1',
          workflowId: Number(workflowId),
          status: 'completed',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3590000).toISOString(),
          duration: 10000, // 10 seconds
          tasksCompleted: 5,
          tasksTotal: 5
        },
        {
          id: 'exec-2',
          workflowId: Number(workflowId),
          status: 'failed',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 7195000).toISOString(),
          duration: 5000, // 5 seconds
          tasksCompleted: 2,
          tasksTotal: 5,
          error: 'Connection timeout when connecting to external API'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching execution history:', error);
    res.status(500).json({ message: 'Failed to fetch execution history' });
  }
});

// Get workflow health metrics
router.get('/health', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get all workflows for the user
    const workflows = await storage.getWorkflowsByCreator(Number(userId));
    
    // Generate mock health metrics - in a real app, this would come from monitoring data
    const healthMetrics = workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      status: Math.random() > 0.7 ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'error',
      successRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      lastRun: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Within last 24h
      totalExecutions: Math.floor(Math.random() * 100) + 1,
      averageDuration: Math.floor(Math.random() * 60000) + 1000 // 1-61 seconds
    }));
    
    res.json({ workflows: healthMetrics });
  } catch (error) {
    console.error('Error fetching workflow health:', error);
    res.status(500).json({ message: 'Failed to fetch workflow health metrics' });
  }
});

// Get error categories and distribution
router.get('/error-stats', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
    
    // In a real application, this would query a database
    const errorStats = {
      totalErrors: 12,
      retryableErrors: 8,
      categoryCounts: {
        connection: 3,
        auth: 2,
        validation: 4,
        timeout: 1,
        rate_limit: 2,
        system: 0,
        unknown: 0
      },
      topFailingWorkflows: [
        { name: 'Social Media Publishing', count: 5 },
        { name: 'Inventory Sync', count: 4 },
        { name: 'Invoice Generation', count: 3 }
      ]
    };
    
    res.json(errorStats);
  } catch (error) {
    console.error('Error fetching error stats:', error);
    res.status(500).json({ message: 'Failed to fetch error statistics' });
  }
});

// Manual retry for a failed execution
router.post('/retry/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    // In a real application, this would trigger a retry of the failed execution
    // For demo purposes, we'll just return a success response
    
    res.json({
      message: 'Execution retry initiated',
      executionId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error retrying execution:', error);
    res.status(500).json({ message: 'Failed to retry execution' });
  }
});

export default router;