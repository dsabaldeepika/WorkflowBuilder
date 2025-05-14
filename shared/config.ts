/**
 * PumpFlux Global Configuration
 * 
 * This file centralizes all configuration settings for the application.
 * Update this file instead of modifying settings in various places.
 */

// Application information
export const APP_CONFIG = {
  name: 'PumpFlux',
  description: 'Create powerful automated workflows and connections',
  version: '1.0.0',
}

// Helper function to safely access environment variables in both client and server
const getEnv = (key: string, defaultValue: string = ''): string => {
  // For server-side (Node.js)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] || defaultValue;
  }
  // For client-side (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

// Determine the app URL - this will be empty string on client unless explicitly set
const appUrl = getEnv('APP_URL', '');

// Stripe configuration
export const STRIPE_CONFIG = {
  apiVersion: '2023-10-16' as const, // Use latest Stripe API version
  webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
  successUrl: `${appUrl}/account/billing?success=true`,
  cancelUrl: `${appUrl}/pricing?cancelled=true`,
}

// Subscription tiers
export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

// Workflow limits per subscription tier
export const SUBSCRIPTION_LIMITS = {
  [SubscriptionTier.FREE]: {
    maxWorkflows: 100, // Increased from 5 to 100 (50x more than Make.com's free tier of 2)
    maxWorkflowRuns: 500, // Increased from 100 to 500
    maxExecutionsPerMonth: 500, // Monthly execution limit
    maxNodesPerWorkflow: 10, // Increased from 5 to 10
    maxTemplates: 15, // Increased from 10 to 15
    supportResponseTime: '48 hours',
    customNodeTypes: false,
    advancedAnalytics: false,
    aiAssistance: false,
    prioritySupport: false,
    dedicatedAccount: false,
    whiteLabeling: false,
  },
  [SubscriptionTier.BASIC]: {
    maxWorkflows: 25, // Increased from 10 to 25
    maxWorkflowRuns: 2500, // Increased from 1000 to 2500
    maxExecutionsPerMonth: 2500, // Monthly execution limit
    maxNodesPerWorkflow: 20, // Increased from 15 to 20
    maxTemplates: 40, // Increased from 30 to 40
    supportResponseTime: '24 hours',
    customNodeTypes: true,
    advancedAnalytics: false,
    aiAssistance: false,
    prioritySupport: false,
    dedicatedAccount: false,
    whiteLabeling: false,
  },
  [SubscriptionTier.PROFESSIONAL]: {
    maxWorkflows: 100, // Increased from 50 to 100
    maxWorkflowRuns: 25000, // Increased from 10000 to 25000
    maxExecutionsPerMonth: 25000, // Monthly execution limit
    maxNodesPerWorkflow: 75, // Increased from 50 to 75
    maxTemplates: 200, // Increased from 100 to 200
    supportResponseTime: '8 hours',
    customNodeTypes: true,
    advancedAnalytics: true,
    aiAssistance: true,
    prioritySupport: true,
    dedicatedAccount: false,
    whiteLabeling: false,
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxWorkflows: -1, // Unlimited
    maxWorkflowRuns: -1, // Unlimited
    maxExecutionsPerMonth: -1, // Unlimited
    maxNodesPerWorkflow: -1, // Unlimited
    maxTemplates: -1, // Unlimited
    supportResponseTime: '2 hours',
    customNodeTypes: true,
    advancedAnalytics: true,
    aiAssistance: true,
    prioritySupport: true,
    dedicatedAccount: true,
    whiteLabeling: true,
  },
}

// Route paths configuration
export const ROUTES = {
  home: '/',
  auth: '/auth',
  signup: '/signup',
  dashboard: '/dashboard',
  createWorkflow: '/create',
  templates: '/templates',
  inspirationGallery: '/inspiration-gallery',
  connections: '/connections',
  workflowAnimations: '/workflow-animations',
  loadingAnimations: '/loading-animations',
  pricing: '/pricing',
  checkout: '/checkout',
  accountBilling: '/account/billing',
  emailSettings: '/settings/email',
  subscriptionUsage: '/account/usage',
  transactionHistory: '/account/transactions',
  workflowOptimizer: '/workflow-optimizer',
}

// Path to subscription plans in Stripe dashboard
export const STRIPE_PRODUCT_URL = 'https://dashboard.stripe.com/products';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/login',
    logout: '/api/logout',
    register: '/api/register',
    user: '/api/user',
  },
  email: {
    status: '/api/email/status',
    config: '/api/email/config',
    test: '/api/email/test',
    templates: {
      welcome: '/api/email/templates/welcome',
      workflowError: '/api/email/templates/workflow-error',
    }
  },
  subscriptions: {
    plans: '/api/subscriptions/plans',
    current: '/api/subscriptions/current',
    createSubscription: '/api/subscriptions/create',
    cancelSubscription: '/api/subscriptions/cancel',
    resumeSubscription: '/api/subscriptions/resume',
    createPortalSession: '/api/subscriptions/create-portal-session',
    webhook: '/api/subscriptions/webhook',
    usage: '/api/subscriptions/usage',
    transactions: '/api/subscriptions/transactions',
  },
  templates: {
    list: '/api/templates',
    get: (id: number) => `/api/templates/${id}`,
    create: '/api/templates',
    update: (id: number) => `/api/templates/${id}`,
    delete: (id: number) => `/api/templates/${id}`,
  },
  workflows: {
    list: '/api/workflows',
    get: (id: number) => `/api/workflows/${id}`,
    create: '/api/workflows',
    update: (id: number) => `/api/workflows/${id}`,
    delete: (id: number) => `/api/workflows/${id}`,
    execute: (id: number) => `/api/workflows/${id}/execute`,
    status: (id: number) => `/api/workflows/${id}/status`,
    optimize: (id: number) => `/api/workflows/${id}/optimize`,
    suggestions: (id: number) => `/api/workflows/${id}/optimization-suggestions`,
  },
}

// Default pagination limits
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
}

// Toast notification durations
export const TOAST_DURATION = {
  short: 3000,
  medium: 5000, 
  long: 8000,
}

// Feature flags for optional functionality
export const FEATURES = {
  enableAnimations: true,
  enableTemplateSharing: true,
  enableAIAssistance: false, // To be enabled later
  enableBillingSystem: false, // Disabled by default, needs Stripe API key to be enabled
  enableAPIConnections: true,
}

// Feature flags with consistent naming pattern - prefer using these over FEATURES
export const FEATURE_FLAGS = {
  enableAnimations: true,
  enableTemplateSharing: true,
  enableAIAssistance: false, // To be enabled later
  enableBillingSystem: true, // Enabled for the authentication flow with pricing integration
  enableAPIConnections: true,
  enableEmail: false, // Email functionality disabled by default
}