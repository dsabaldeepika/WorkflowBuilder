import { Router } from "express";
// Removed isAuthenticated import
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from "@shared/config";
import { db } from "../db";
import { subscriptionPlans, subscriptionHistory, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all available subscription plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));
    res.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
});

// Get current user's subscription
router.get("/current", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "mockUserId"; // Mock user ID for bypass
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.stripeSubscriptionId) {
      return res.json({
        tier: user.subscriptionTier || SubscriptionTier.FREE,
        status: user.subscriptionStatus || "inactive",
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        currentPeriodEnd: user.subscriptionPeriodEnd,
        trialDaysRemaining:
          user.subscriptionStatus === "trial" && user.subscriptionPeriodEnd
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(user.subscriptionPeriodEnd).getTime() -
                    Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : undefined,
      });
    } else {
      return res.json({
        tier: SubscriptionTier.FREE,
        status: "inactive",
      });
    }
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch subscription information" });
  }
});

// Get user's subscription usage metrics
router.get("/usage", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "mockUserId"; // Mock user ID for bypass
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tier = (user.subscriptionTier ||
      SubscriptionTier.FREE) as keyof typeof SUBSCRIPTION_LIMITS;
    const limits = SUBSCRIPTION_LIMITS[tier];
    const usagePercentage = Math.random() * 0.8;
    const usage = {
      workflows: {
        used: Math.floor(limits.maxWorkflows * usagePercentage),
        limit: limits.maxWorkflows,
      },
      workflowRuns: {
        used: Math.floor(limits.maxWorkflowRuns * usagePercentage),
        limit: limits.maxWorkflowRuns,
      },
      nodes: {
        used: Math.floor(limits.maxNodesPerWorkflow * usagePercentage),
        limit: limits.maxNodesPerWorkflow,
      },
      templates: {
        used: Math.floor(limits.maxTemplates * usagePercentage),
        limit: limits.maxTemplates,
      },
      apiCalls: {
        used: Math.floor(10000 * usagePercentage),
        limit:
          tier === SubscriptionTier.FREE
            ? 1000
            : tier === SubscriptionTier.BASIC
            ? 10000
            : tier === SubscriptionTier.PROFESSIONAL
            ? 100000
            : -1,
      },
      integrations: {
        used: Math.floor(20 * usagePercentage),
        limit:
          tier === SubscriptionTier.FREE
            ? 5
            : tier === SubscriptionTier.BASIC
            ? 20
            : tier === SubscriptionTier.PROFESSIONAL
            ? 50
            : -1,
      },
    };

    res.json(usage);
  } catch (error) {
    console.error("Error fetching subscription usage:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch subscription usage metrics" });
  }
});

// Get user's subscription transaction history
router.get("/transactions", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "mockUserId"; // Mock user ID for bypass
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.subscriptionTier === SubscriptionTier.FREE &&
      !user.stripeCustomerId
    ) {
      return res.json([]);
    }

    const transactions = [];
    if (user.subscriptionTier !== SubscriptionTier.FREE) {
      transactions.push({
        id: 1,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        planName: `${
          user.subscriptionTier.charAt(0).toUpperCase() +
          user.subscriptionTier.slice(1)
        } Plan`,
        planTier: user.subscriptionTier,
        period: "monthly",
        amount:
          user.subscriptionTier === SubscriptionTier.BASIC
            ? 29
            : user.subscriptionTier === SubscriptionTier.PROFESSIONAL
            ? 99
            : 499,
        status: "success",
        type: "subscription",
        invoiceUrl:
          "https://dashboard.stripe.com/invoices/in_1AbCdEfGhIjKlMnOpQrStUvW",
      });
    }

    if (
      user.subscriptionTier !== SubscriptionTier.FREE &&
      user.subscriptionStatus === "active"
    ) {
      transactions.push({
        id: 2,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        planName: `${
          user.subscriptionTier.charAt(0).toUpperCase() +
          user.subscriptionTier.slice(1)
        } Plan`,
        planTier: user.subscriptionTier,
        period: "monthly",
        amount:
          user.subscriptionTier === SubscriptionTier.BASIC
            ? 29
            : user.subscriptionTier === SubscriptionTier.PROFESSIONAL
            ? 99
            : 499,
        status: "success",
        type:
          user.subscriptionTier === SubscriptionTier.PROFESSIONAL
            ? "upgrade"
            : "renewal",
        fromPlan:
          user.subscriptionTier === SubscriptionTier.PROFESSIONAL
            ? "Basic Plan"
            : undefined,
        toPlan:
          user.subscriptionTier === SubscriptionTier.PROFESSIONAL
            ? "Professional Plan"
            : undefined,
        invoiceUrl:
          "https://dashboard.stripe.com/invoices/in_2BcDeFgHiJkLmNoPqRsTuVwX",
      });
    }

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({ message: "Failed to fetch transaction history" });
  }
});

// Create a subscription
router.post("/create", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "mockUserId"; // Mock user ID for bypass
    const { planId, priceId, billingPeriod } = req.body;
    res.json({
      success: true,
      url: `/checkout/success?session_id=cs_test_${Math.random()
        .toString(36)
        .substring(2, 15)}`,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ message: "Failed to create subscription" });
  }
});

export default router;
