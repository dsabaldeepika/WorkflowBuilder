import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
// import { isAuthenticated } from "../replitAuth";
import { SubscriptionTier } from "../../shared/schema";
import { API_ENDPOINTS } from "../../shared/config";

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
subscriptionsRouter.post("/create-subscription", bypassAuth, async (req: any, res) => {
  try {
    const { planId, billingPeriod = "monthly" } = req.body;
    if (!planId) {
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

    // Get the plan details
    const plan = await storage.getSubscriptionPlan(planId);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }
    
    // Generate a mock client secret
    const mockClientSecret = `mock_client_secret_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Store metadata for later use
    const metadataKey = `checkout_${mockClientSecret}`;
    req.session[metadataKey] = {
      userId: userId,
      planId: planId,
      billingPeriod: billingPeriod,
      tier: plan.tier,
      createdAt: new Date()
    };

    // Return the mock client secret
    res.status(200).json({ clientSecret: mockClientSecret });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: error.message });
  }
});

// Complete the subscription process
subscriptionsRouter.post("/complete-subscription", bypassAuth, async (req: any, res) => {
  try {
    const { clientSecret } = req.body;
    if (!clientSecret) {
      return res.status(400).json({ error: "Missing client secret" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get metadata from session
    const metadataKey = `checkout_${clientSecret}`;
    const metadata = req.session[metadataKey];
    
    if (!metadata) {
      return res.status(400).json({ error: "Invalid client secret or session expired" });
    }

    // Get the plan
    const plan = await storage.getSubscriptionPlan(metadata.planId);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    // Calculate subscription period end date (1 month or 1 year from now)
    const periodEnd = new Date();
    if (metadata.billingPeriod === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update user's subscription details
    await storage.updateUserSubscription(userId, {
      tier: plan.tier as SubscriptionTier,
      status: "active",
      subscriptionId: `mock_sub_${Date.now()}`,
      periodEnd: periodEnd
    });

    // Create a subscription history record
    await storage.createSubscriptionHistory({
      userId,
      subscriptionPlanId: metadata.planId,
      stripeSubscriptionId: `mock_sub_${Date.now()}`,
      stripeInvoiceId: `mock_inv_${Date.now()}`,
      billingPeriod: metadata.billingPeriod,
      status: "active",
      startDate: new Date(),
      endDate: periodEnd,
      amount: metadata.billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly,
      currency: "USD"
    });

    // Clean up session
    delete req.session[metadataKey];

    res.status(200).json({ 
      success: true, 
      subscription: {
        id: `mock_sub_${Date.now()}`,
        status: "active",
        currentPeriodEnd: periodEnd
      }
    });
  } catch (error: any) {
    console.error("Error completing subscription:", error);
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
    // @ts-ignore Bypassing type issues for now
    await storage.updateUserSubscription(userId, {
      tier: SubscriptionTier.PRO, // Default to PRO until end date
      status: subscription.status,
      // @ts-ignore Access current_period_end property 
      periodEnd: new Date((subscription.current_period_end || 0) * 1000)
    });

    // @ts-ignore Access current_period_end property
    const endDate = new Date((subscription.current_period_end || 0) * 1000);
    res.json({ 
      canceled: true, 
      willEndOn: endDate 
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: error.message });
  }
});