import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from '@shared/config';
import { db } from '../db';
import { subscriptionPlans, subscriptionHistory, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
});

// Get current user's subscription
router.get('/current', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user has a subscription, fetch the details
    if (user.stripeSubscriptionId) {
      // In a real implementation, you might want to fetch the details from Stripe
      // But for now we'll return the basics from the user record
      return res.json({
        tier: user.subscriptionTier || SubscriptionTier.FREE,
        status: user.subscriptionStatus || 'inactive',
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        currentPeriodEnd: user.subscriptionPeriodEnd,
        // If in trial mode, calculate remaining days
        trialDaysRemaining: user.subscriptionStatus === 'trial' && user.subscriptionPeriodEnd 
          ? Math.max(0, Math.ceil((new Date(user.subscriptionPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : undefined
      });
    } else {
      // Return free tier defaults
      return res.json({
        tier: SubscriptionTier.FREE,
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    res.status(500).json({ message: 'Failed to fetch subscription information' });
  }
});

// Get user's subscription usage metrics
router.get('/usage', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the limits for the user's subscription tier
    const tier = user.subscriptionTier || SubscriptionTier.FREE;
    const limits = SUBSCRIPTION_LIMITS[tier];
    
    // For demo purposes, we'll generate usage metrics based on the tier's limits
    // In a real implementation, you'd fetch actual usage metrics from the database
    const usagePercentage = Math.random() * 0.8; // Random usage between 0% and 80%
    
    // Generate simulated usage metrics
    const usage = {
      workflows: {
        used: Math.floor(limits.maxWorkflows * usagePercentage),
        limit: limits.maxWorkflows
      },
      workflowRuns: {
        used: Math.floor(limits.maxWorkflowRuns * usagePercentage),
        limit: limits.maxWorkflowRuns
      },
      nodes: {
        used: Math.floor(limits.maxNodesPerWorkflow * usagePercentage),
        limit: limits.maxNodesPerWorkflow
      },
      templates: {
        used: Math.floor(limits.maxTemplates * usagePercentage),
        limit: limits.maxTemplates
      },
      apiCalls: {
        used: Math.floor(10000 * usagePercentage), // Arbitrary limit for API calls
        limit: tier === SubscriptionTier.FREE ? 1000 : 
               tier === SubscriptionTier.BASIC ? 10000 : 
               tier === SubscriptionTier.PROFESSIONAL ? 100000 : -1
      },
      integrations: {
        used: Math.floor(20 * usagePercentage), // Arbitrary number of integrations
        limit: tier === SubscriptionTier.FREE ? 5 : 
               tier === SubscriptionTier.BASIC ? 20 : 
               tier === SubscriptionTier.PROFESSIONAL ? 50 : -1
      }
    };
    
    res.json(usage);
  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    res.status(500).json({ message: 'Failed to fetch subscription usage metrics' });
  }
});

// Get user's subscription transaction history
router.get('/transactions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    // In a real implementation, you'd fetch actual transactions from the database
    // For demo purposes, we'll return simulated data
    
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If the user is on a free plan and never had a paid subscription, return empty array
    if (user.subscriptionTier === SubscriptionTier.FREE && !user.stripeCustomerId) {
      return res.json([]);
    }
    
    // Generate transaction history
    // In a real implementation, you would fetch this from the database or Stripe
    const transactions = [];
    
    // Include a subscription start if not on free tier
    if (user.subscriptionTier !== SubscriptionTier.FREE) {
      transactions.push({
        id: 1,
        date: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days ago
        planName: `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan`,
        planTier: user.subscriptionTier,
        period: 'monthly',
        amount: user.subscriptionTier === SubscriptionTier.BASIC ? 29 : 
                user.subscriptionTier === SubscriptionTier.PROFESSIONAL ? 99 : 499,
        status: 'success',
        type: 'subscription',
        invoiceUrl: 'https://dashboard.stripe.com/invoices/in_1AbCdEfGhIjKlMnOpQrStUvW'
      });
    }
    
    // Add a renewal or plan change if appropriate
    if (user.subscriptionTier !== SubscriptionTier.FREE && user.subscriptionStatus === 'active') {
      transactions.push({
        id: 2,
        date: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)).toISOString(), // 15 days ago
        planName: `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan`,
        planTier: user.subscriptionTier,
        period: 'monthly',
        amount: user.subscriptionTier === SubscriptionTier.BASIC ? 29 : 
                user.subscriptionTier === SubscriptionTier.PROFESSIONAL ? 99 : 499,
        status: 'success',
        type: user.subscriptionTier === SubscriptionTier.PROFESSIONAL ? 'upgrade' : 'renewal',
        fromPlan: user.subscriptionTier === SubscriptionTier.PROFESSIONAL ? 'Basic Plan' : undefined,
        toPlan: user.subscriptionTier === SubscriptionTier.PROFESSIONAL ? 'Professional Plan' : undefined,
        invoiceUrl: 'https://dashboard.stripe.com/invoices/in_2BcDeFgHiJkLmNoPqRsTuVwX'
      });
    }
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
});

// Create a subscription
router.post('/create', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { planId, priceId, billingPeriod } = req.body;
    
    // In a real implementation, you would create a subscription with Stripe
    // For demo purposes, we'll just simulate a successful response
    
    res.json({
      success: true,
      url: `/checkout/success?session_id=cs_test_${Math.random().toString(36).substring(2, 15)}`
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

export default router;