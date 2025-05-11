/**
 * @swagger
 * tags:
 *   - name: Workflow Templates
 *     description: Workflow templates management and operations
 */

/**
 * @swagger
 * /api/workflow/templates:
 *   get:
 *     summary: Get all workflow templates
 *     description: Retrieves all available workflow templates with optional filtering
 *     tags: [Workflow Templates]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter templates by category
 *       - in: query
 *         name: complexity
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter templates by complexity level
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search templates by name or description
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter templates by tags (comma-separated)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [popularity, newest, name]
 *         description: Field to sort results by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of workflow templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkflowTemplate'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/workflow/templates/{id}:
 *   get:
 *     summary: Get a workflow template by ID
 *     description: Retrieves a specific workflow template by its ID
 *     tags: [Workflow Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: The workflow template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowTemplate'
 *       404:
 *         description: Template not found
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
 * /api/workflow/templates:
 *   post:
 *     summary: Create a new workflow template
 *     description: Creates a new workflow template
 *     tags: [Workflow Templates]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - complexity
 *               - templateData
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Lead Capture to CRM"
 *               description:
 *                 type: string
 *                 example: "Capture leads from Facebook and add them to your CRM system"
 *               category:
 *                 type: string
 *                 example: "Lead Generation"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["facebook", "crm", "leads"]
 *               complexity:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "beginner"
 *               templateData:
 *                 type: object
 *                 description: JSON representation of the workflow template
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               estimatedCompletionTime:
 *                 type: integer
 *                 example: 5
 *                 description: Estimated completion time in minutes
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowTemplate'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/workflow/templates/{id}:
 *   put:
 *     summary: Update a workflow template
 *     description: Updates an existing workflow template
 *     tags: [Workflow Templates]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               complexity:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               templateData:
 *                 type: object
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               estimatedCompletionTime:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowTemplate'
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
 *         description: Template not found
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
 * /api/workflow/templates/{id}:
 *   delete:
 *     summary: Delete a workflow template
 *     description: Deletes a workflow template
 *     tags: [Workflow Templates]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       204:
 *         description: Template deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Template not found
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
 * /api/workflow/templates/categories:
 *   get:
 *     summary: Get all template categories
 *     description: Retrieves all available template categories
 *     tags: [Workflow Templates]
 *     responses:
 *       200:
 *         description: A list of template categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/workflow/templates/tags:
 *   get:
 *     summary: Get all template tags
 *     description: Retrieves all available template tags
 *     tags: [Workflow Templates]
 *     responses:
 *       200:
 *         description: A list of template tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */