/**
 * @swagger
 * tags:
 *   - name: Subscriptions
 *     description: Subscription plans and user subscription management
 */

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get all subscription plans
 *     description: Retrieves all active subscription plans with pricing information
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: A list of subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubscriptionPlan'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/subscriptions/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session
 *     description: Creates a new Stripe checkout session for the user to complete payment
 *     tags: [Subscriptions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priceId
 *               - planId
 *               - billingPeriod
 *             properties:
 *               priceId:
 *                 type: string
 *                 description: Stripe price ID for the selected plan
 *               planId:
 *                 type: integer
 *                 description: ID of the subscription plan being purchased
 *               billingPeriod:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 description: Billing period (monthly or yearly)
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: Stripe checkout session ID
 *                 url:
 *                   type: string
 *                   description: URL to redirect the user to for checkout
 *       400:
 *         description: Invalid request parameters
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
 * /api/subscriptions/user:
 *   get:
 *     summary: Get user subscription details
 *     description: Retrieves subscription details for the currently authenticated user
 *     tags: [Subscriptions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptionId:
 *                   type: string
 *                   description: Stripe subscription ID
 *                 status:
 *                   type: string
 *                   enum: [active, canceled, past_due, trialing, incomplete, incomplete_expired]
 *                   description: Current subscription status
 *                 planId:
 *                   type: integer
 *                   description: ID of the subscription plan
 *                 currentPeriodStart:
 *                   type: string
 *                   format: date-time
 *                   description: Start date of current billing period
 *                 currentPeriodEnd:
 *                   type: string
 *                   format: date-time
 *                   description: End date of current billing period
 *                 cancelAtPeriodEnd:
 *                   type: boolean
 *                   description: Whether subscription will cancel at period end
 *                 plan:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User subscription not found
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
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel user subscription
 *     description: Cancels the subscription for the currently authenticated user at the end of the billing period
 *     tags: [Subscriptions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subscription cancelled successfully"
 *                 cancelAtPeriodEnd:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User subscription not found
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
 * /api/subscriptions/reactivate:
 *   post:
 *     summary: Reactivate cancelled subscription
 *     description: Reactivates a previously cancelled subscription for the currently authenticated user
 *     tags: [Subscriptions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Subscription reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subscription reactivated successfully"
 *                 cancelAtPeriodEnd:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User subscription not found
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
 * /api/subscriptions/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     description: Handles Stripe webhook events such as payment successes, failures, and subscription updates
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe webhook event
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid request
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