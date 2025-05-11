/**
 * @swagger
 * tags:
 *   - name: Workflow Execution
 *     description: Workflow execution and monitoring operations
 */

/**
 * @swagger
 * /api/execution/run/{workflowId}:
 *   post:
 *     summary: Execute a workflow
 *     description: Executes a workflow by its ID with optional input data
 *     tags: [Workflow Execution]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the workflow to execute
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputData:
 *                 type: object
 *                 description: Optional input data for the workflow execution
 *     responses:
 *       200:
 *         description: Workflow execution started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 executionId:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: "Workflow execution started"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workflow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/execution/status/{executionId}:
 *   get:
 *     summary: Get workflow execution status
 *     description: Retrieves the status of a workflow execution by its ID
 *     tags: [Workflow Execution]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workflow execution
 *     responses:
 *       200:
 *         description: Workflow execution status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 executionId:
 *                   type: string
 *                 workflowId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   enum: [running, completed, failed, pending]
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 nodes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nodeId:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, running, completed, failed]
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       endTime:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       output:
 *                         type: object
 *                         nullable: true
 *                       error:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Execution not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/execution/history/{workflowId}:
 *   get:
 *     summary: Get workflow execution history
 *     description: Retrieves the execution history for a specific workflow
 *     tags: [Workflow Execution]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the workflow
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Workflow execution history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   executionId:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [running, completed, failed, pending]
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   duration:
 *                     type: integer
 *                     description: Duration in milliseconds
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workflow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/execution/cancel/{executionId}:
 *   post:
 *     summary: Cancel workflow execution
 *     description: Cancels a running workflow execution
 *     tags: [Workflow Execution]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workflow execution to cancel
 *     responses:
 *       200:
 *         description: Workflow execution cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workflow execution cancelled"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Execution not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/monitoring/workflows/{userId}:
 *   get:
 *     summary: Get workflow monitoring stats
 *     description: Retrieves monitoring statistics for all workflows of a user
 *     tags: [Workflow Execution]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *         description: Timeframe for the statistics
 *     responses:
 *       200:
 *         description: Workflow monitoring statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalExecutions:
 *                   type: integer
 *                 successfulExecutions:
 *                   type: integer
 *                 failedExecutions:
 *                   type: integer
 *                 averageExecutionTime:
 *                   type: integer
 *                   description: Average execution time in milliseconds
 *                 workflowStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       workflowId:
 *                         type: integer
 *                       workflowName:
 *                         type: string
 *                       totalExecutions:
 *                         type: integer
 *                       successRate:
 *                         type: number
 *                         format: float
 *                       averageExecutionTime:
 *                         type: integer
 *                         description: Average execution time in milliseconds
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */