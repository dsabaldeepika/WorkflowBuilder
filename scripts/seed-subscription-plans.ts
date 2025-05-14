/**
 * Seed script to populate initial subscription plans
 */
import { db } from "../server/db";
import { subscriptionPlans, SubscriptionTier } from "../shared/schema";

async function seedSubscriptionPlans() {
  console.log("Seeding subscription plans...");
  
  // First, check if plans already exist
  const existingPlans = await db.select().from(subscriptionPlans);
  if (existingPlans.length > 0) {
    console.log(`Found ${existingPlans.length} existing plans. Skipping seeding.`);
    return;
  }

  // Define our subscription plans
  const plans = [
    {
      name: "Free",
      tier: SubscriptionTier.FREE,
      description: "Perfect for individuals getting started with workflow automation",
      priceMonthly: 0,
      priceYearly: 0,
      stripePriceIdMonthly: "", // Empty for free tier
      stripePriceIdYearly: "",  // Empty for free tier
      maxWorkflows: 5,
      maxWorkspaces: 1,
      maxExecutionsPerMonth: 500,
      maxTeamMembers: 1,
      hasAdvancedIntegrations: false,
      hasAiFeatures: false,
      hasCustomBranding: false,
      hasPrioritySuppport: false,
      features: [
        "Up to 5 workflows (more than competitors)",
        "Basic integrations",
        "Community support",
        "1 workspace",
        "500 executions per month"
      ],
      isActive: true,
    },
    {
      name: "Basic",
      tier: SubscriptionTier.BASIC,
      description: "Great for professionals who need more power and flexibility",
      priceMonthly: 19.99,
      priceYearly: 199.99,
      stripePriceIdMonthly: "price_basic_monthly", // These would be actual Stripe price IDs in production
      stripePriceIdYearly: "price_basic_yearly",
      maxWorkflows: 25,
      maxWorkspaces: 3,
      maxExecutionsPerMonth: 7500,
      maxTeamMembers: 3,
      hasAdvancedIntegrations: true,
      hasAiFeatures: false,
      hasCustomBranding: false,
      hasPrioritySuppport: false,
      features: [
        "Up to 25 workflows",
        "Advanced integrations",
        "Email support",
        "3 workspaces",
        "7,500 executions per month",
        "Team collaboration (up to 3 members)"
      ],
      isActive: true,
    },
    {
      name: "Professional",
      tier: SubscriptionTier.PROFESSIONAL,
      description: "For teams that need advanced features and higher limits",
      priceMonthly: 49.99,
      priceYearly: 499.99,
      stripePriceIdMonthly: "price_pro_monthly",
      stripePriceIdYearly: "price_pro_yearly",
      maxWorkflows: 100,
      maxWorkspaces: 10,
      maxExecutionsPerMonth: 25000,
      maxTeamMembers: 10,
      hasAdvancedIntegrations: true,
      hasAiFeatures: true,
      hasCustomBranding: false,
      hasPrioritySuppport: true,
      features: [
        "Up to 100 workflows",
        "All integrations",
        "AI-powered features",
        "Priority support",
        "10 workspaces",
        "25,000 executions per month",
        "Team collaboration (up to 10 members)",
        "Workflow monitoring"
      ],
      isActive: true,
    },
    {
      name: "Enterprise",
      tier: SubscriptionTier.ENTERPRISE,
      description: "Custom solutions for organizations with advanced needs",
      priceMonthly: 129.99,
      priceYearly: 1299.99,
      stripePriceIdMonthly: "price_enterprise_monthly",
      stripePriceIdYearly: "price_enterprise_yearly",
      maxWorkflows: -1, // Unlimited
      maxWorkspaces: -1, // Unlimited
      maxExecutionsPerMonth: -1, // Unlimited
      maxTeamMembers: -1, // Unlimited
      hasAdvancedIntegrations: true,
      hasAiFeatures: true,
      hasCustomBranding: true,
      hasPrioritySuppport: true,
      features: [
        "Unlimited workflows",
        "All integrations",
        "Advanced AI features",
        "Dedicated support",
        "Custom branding",
        "Unlimited workspaces",
        "Unlimited executions per month",
        "Unlimited team members",
        "Enterprise security features",
        "Custom reporting",
        "SLA guarantees"
      ],
      isActive: true,
    }
  ];
  
  // Insert the plans into the database
  for (const plan of plans) {
    await db.insert(subscriptionPlans).values(plan);
  }
  
  console.log(`Successfully seeded ${plans.length} subscription plans.`);
}

// Run the seeding function
seedSubscriptionPlans()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding subscription plans:", error);
    process.exit(1);
  });