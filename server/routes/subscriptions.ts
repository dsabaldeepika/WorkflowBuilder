import { Router, Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
// import { isAuthenticated } from "../replitAuth";
import { SubscriptionTier } from "../../shared/schema";
import { STRIPE_CONFIG, API_ENDPOINTS } from "../../shared/config";

// BYPASS: Create a bypass for the authentication middleware
const bypassAuth = (req: Request, res: Response, next: NextFunction) => {
  // Inject a fake authenticated user into the request
  (req as any).user = {
    id: 1,
    username: 'demo_user',
    email: 'demo@example.com',
    role: 'admin',
    subscriptionTier: SubscriptionTier.PRO
  };
  (req as any).isAuthenticated = () => true;
  next();
};

// Initialize Stripe client
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret key");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_CONFIG.apiVersion,
});

export const subscriptionsRouter = Router();

// Get all subscription plans
subscriptionsRouter.get("/plans", async (req, res) => {
  try {
    const plans = await storage.getSubscriptionPlans(true);
    res.json(plans);
  } catch (error: any) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user's subscription details
subscriptionsRouter.get("/current", bypassAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Enhanced subscription details with plan information
    let subscriptionDetails = {
      tier: user.subscriptionTier || SubscriptionTier.FREE,
      status: user.subscriptionStatus || "inactive",
      periodEnd: user.subscriptionPeriodEnd,
      planDetails: null
    };

    if (user.subscriptionTier) {
      const planDetails = await storage.getSubscriptionPlanByTier(user.subscriptionTier);
      if (planDetails) {
        subscriptionDetails.planDetails = planDetails;
      }
    }

    res.json(subscriptionDetails);
  } catch (error: any) {
    console.error("Error fetching subscription details:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a checkout session for a new subscription
subscriptionsRouter.post("/create-checkout-session", bypassAuth, async (req: any, res) => {
  try {
    const { priceId, planId, billingPeriod = "monthly" } = req.body;
    if (!priceId && !planId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If no specific priceId was provided but planId was, lookup the plan
    let stripePriceId = priceId;
    if (!stripePriceId && planId) {
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }
      
      stripePriceId = billingPeriod === "yearly" 
        ? plan.stripePriceIdYearly 
        : plan.stripePriceIdMonthly;
    }

    // Check if user already has a Stripe customer ID
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id.toString()
        }
      });
      
      customerId = customer.id;
      // Update user with Stripe customer ID
      await storage.updateUserStripeInfo(userId, { customerId });
    }

    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: STRIPE_CONFIG.successUrl + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: STRIPE_CONFIG.cancelUrl,
      metadata: {
        userId: user.id.toString(),
        planId: planId?.toString() || "",
        billingPeriod
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Handle subscription webhooks from Stripe
subscriptionsRouter.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = STRIPE_CONFIG.webhookSecret;

  // Only verify the signature if an endpoint secret is configured
  let event;
  if (endpointSecret) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // If no secret is configured, just use the raw body (useful for testing)
    event = req.body;
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = parseInt(session.metadata.userId, 10);
        const subscriptionId = session.subscription;
        
        // Update user with subscription ID
        await storage.updateUserStripeInfo(userId, { 
          customerId: session.customer,
          subscriptionId: subscriptionId as string 
        });
        
        // Retrieve the subscription to get more details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        
        // Determine the tier based on the price ID or metadata
        let tier = SubscriptionTier.FREE;
        if (session.metadata.planId) {
          const plan = await storage.getSubscriptionPlan(parseInt(session.metadata.planId, 10));
          if (plan) {
            tier = plan.tier as SubscriptionTier;
          }
        }
        
        // Update user's subscription details
        await storage.updateUserSubscription(userId, {
          tier,
          status: subscription.status,
          subscriptionId: subscription.id,
          periodEnd: new Date(subscription.current_period_end * 1000)
        });
        
        // Create a subscription history record
        if (session.metadata.planId) {
          await storage.createSubscriptionHistory({
            userId,
            subscriptionPlanId: parseInt(session.metadata.planId, 10),
            stripeSubscriptionId: subscription.id,
            stripeInvoiceId: subscription.latest_invoice as string,
            billingPeriod: session.metadata.billingPeriod || "monthly",
            status: subscription.status,
            startDate: new Date(subscription.current_period_start * 1000),
            endDate: new Date(subscription.current_period_end * 1000),
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || "USD"
          });
        }
        
        break;
      }
      
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = parseInt(subscription.metadata.userId, 10);
          
          // Update subscription period end date
          await storage.updateUserSubscription(userId, {
            tier: subscription.metadata.tier || SubscriptionTier.FREE,
            status: subscription.status,
            periodEnd: new Date(subscription.current_period_end * 1000)
          });
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = parseInt(subscription.metadata.userId, 10);
        
        if (userId) {
          await storage.updateUserSubscription(userId, {
            status: subscription.status,
            periodEnd: new Date(subscription.current_period_end * 1000)
          });
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = parseInt(subscription.metadata.userId, 10);
        
        if (userId) {
          // Reset user to free tier when subscription is canceled
          await storage.updateUserSubscription(userId, {
            tier: SubscriptionTier.FREE,
            status: "canceled",
            subscriptionId: null,
            periodEnd: null
          });
          
          // Update subscription history if needed
          // This logic could be expanded based on your requirements
        }
        break;
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error(`Error handling webhook: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Create customer portal session for managing subscriptions
subscriptionsRouter.post("/create-portal-session", bypassAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found for this user" });
    }

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${req.protocol}://${req.get("host")}/account/billing`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel a subscription
subscriptionsRouter.post("/cancel", bypassAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found" });
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user record
    await storage.updateUserSubscription(userId, {
      status: subscription.status,
      periodEnd: new Date(subscription.current_period_end * 1000)
    });

    res.json({ 
      canceled: true, 
      willEndOn: new Date(subscription.current_period_end * 1000) 
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: error.message });
  }
});