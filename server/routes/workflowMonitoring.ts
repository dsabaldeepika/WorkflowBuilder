import { Router } from 'express';
import { WorkflowLogger } from '../services/workflowLogger';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const router = Router();

// Get logs for a specific workflow
router.get('/workflows/:workflowId/logs', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { limit = '100' } = req.query;
    
    // In a production system, you'd query logs from a database
    // For now, we're parsing the log files directly
    const logs = await WorkflowLogger.getWorkflowLogs(
      workflowId, 
      parseInt(limit as string, 10)
    );
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve workflow logs',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get all error logs for monitoring
router.get('/errors', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Read error log file
    const logFilePath = path.join(logsDir, 'error.log');
    let errorLogs: any[] = [];
    
    if (fs.existsSync(logFilePath)) {
      const content = await readFile(logFilePath, 'utf8');
      
      // Parse JSON lines
      errorLogs = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(log => log !== null);
      
      // Filter by timeframe if needed
      if (timeframe) {
        const now = new Date();
        let cutoff = now;
        
        switch (timeframe) {
          case 'hour':
            cutoff = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case 'day':
            cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'week':
            cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }
        
        errorLogs = errorLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= cutoff;
        });
      }
    }
    
    res.json({ 
      errors: errorLogs,
      count: errorLogs.length,
      timeframe
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve error logs',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get error statistics for dashboard
router.get('/stats', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
    
    // Get error statistics from WorkflowLogger
    const stats = await WorkflowLogger.getErrorStats(timeframe as any);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve error statistics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;