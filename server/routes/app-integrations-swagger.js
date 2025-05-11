/**
 * @swagger
 * tags:
 *   - name: App Integrations
 *     description: Application integrations and connection management
 */

/**
 * @swagger
 * /api/app/integrations:
 *   get:
 *     summary: Get all available app integrations
 *     description: Retrieves all available application integrations that can be used in workflows
 *     tags: [App Integrations]
 *     responses:
 *       200:
 *         description: A list of app integrations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                     example: "Salesforce"
 *                   description:
 *                     type: string
 *                     example: "Connect with Salesforce CRM"
 *                   authType:
 *                     type: string
 *                     enum: [oauth2, apiKey, basic, custom]
 *                   category:
 *                     type: string
 *                     example: "CRM"
 *                   logoUrl:
 *                     type: string
 *                     format: uri
 *                   actions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         inputSchema:
 *                           type: object
 *                         outputSchema:
 *                           type: object
 *                   triggers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         outputSchema:
 *                           type: object
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/app/integrations/{id}:
 *   get:
 *     summary: Get app integration details
 *     description: Retrieves detailed information about a specific app integration
 *     tags: [App Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Integration ID
 *     responses:
 *       200:
 *         description: App integration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                   example: "Salesforce"
 *                 description:
 *                   type: string
 *                   example: "Connect with Salesforce CRM"
 *                 authType:
 *                   type: string
 *                   enum: [oauth2, apiKey, basic, custom]
 *                 category:
 *                   type: string
 *                   example: "CRM"
 *                 logoUrl:
 *                   type: string
 *                   format: uri
 *                 documentationUrl:
 *                   type: string
 *                   format: uri
 *                 authConfig:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       format: uri
 *                     tokenUrl:
 *                       type: string
 *                       format: uri
 *                     scope:
 *                       type: string
 *                 actions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       inputSchema:
 *                         type: object
 *                       outputSchema:
 *                         type: object
 *                 triggers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       outputSchema:
 *                         type: object
 *       404:
 *         description: Integration not found
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
 * /api/app/credentials:
 *   get:
 *     summary: Get user's app credentials
 *     description: Retrieves all app credentials saved by the user
 *     tags: [App Integrations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User's app credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   integrationId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                     example: "My Salesforce Account"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   integration:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       logoUrl:
 *                         type: string
 *                         format: uri
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
 * /api/app/credentials:
 *   post:
 *     summary: Save app credentials
 *     description: Saves new credentials for an app integration
 *     tags: [App Integrations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - integrationId
 *               - name
 *               - credentials
 *             properties:
 *               integrationId:
 *                 type: integer
 *                 description: ID of the app integration
 *               name:
 *                 type: string
 *                 example: "My Salesforce Account"
 *                 description: User-defined name for these credentials
 *               credentials:
 *                 type: object
 *                 description: The credentials data (structure depends on auth type)
 *     responses:
 *       201:
 *         description: Credentials saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: "Credentials saved successfully"
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
 * /api/app/credentials/{id}:
 *   put:
 *     summary: Update app credentials
 *     description: Updates existing app integration credentials
 *     tags: [App Integrations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Credential ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Updated Salesforce Account"
 *               credentials:
 *                 type: object
 *                 description: The updated credentials data
 *     responses:
 *       200:
 *         description: Credentials updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: "Credentials updated successfully"
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
 *         description: Credentials not found
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
 * /api/app/credentials/{id}:
 *   delete:
 *     summary: Delete app credentials
 *     description: Deletes saved app integration credentials
 *     tags: [App Integrations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Credential ID
 *     responses:
 *       204:
 *         description: Credentials deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Credentials not found
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
 * /api/app/credentials/verify/{id}:
 *   post:
 *     summary: Verify app credentials
 *     description: Verifies if the saved credentials for an app are valid
 *     tags: [App Integrations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Credential ID
 *     responses:
 *       200:
 *         description: Credential verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Credentials are valid"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Credentials not found
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