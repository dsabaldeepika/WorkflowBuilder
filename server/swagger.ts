import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';
import { APP_CONFIG } from '../shared/config';

/**
 * Swagger definition options
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: APP_CONFIG.name + ' API Documentation',
      version,
      description: `Complete API documentation for ${APP_CONFIG.name} - ${APP_CONFIG.description}`,
      license: {
        name: 'Private',
        url: 'https://pumpflux.io/terms',
      },
      contact: {
        name: 'PumpFlux Support',
        url: 'https://pumpflux.io/support',
        email: 'support@pumpflux.io',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            error: {
              type: 'string',
            },
          },
        },
        // User schema
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
              example: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            firstName: {
              type: 'string',
              example: 'John',
              nullable: true,
            },
            lastName: {
              type: 'string',
              example: 'Doe',
              nullable: true,
            },
            profileImageUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
            },
            stripeCustomerId: {
              type: 'string',
              example: 'cus_1234567890',
              nullable: true,
            },
            stripeSubscriptionId: {
              type: 'string',
              example: 'sub_1234567890',
              nullable: true,
            },
            subscriptionTier: {
              type: 'string',
              enum: ['free', 'basic', 'professional', 'enterprise'],
              example: 'free',
            },
            subscriptionStatus: {
              type: 'string',
              enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'],
              example: 'active',
              nullable: true,
            },
            subscriptionPeriodEnd: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Workflow Template schema
        WorkflowTemplate: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Lead Capture to CRM',
            },
            description: {
              type: 'string',
              example: 'Capture leads from Facebook and add them to your CRM system',
            },
            category: {
              type: 'string',
              example: 'Lead Generation',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['facebook', 'crm', 'leads'],
            },
            complexity: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              example: 'beginner',
            },
            templateData: {
              type: 'object',
              description: 'JSON representation of the workflow template',
            },
            popularity: {
              type: 'integer',
              example: 120,
            },
            estimatedCompletionTime: {
              type: 'integer',
              example: 5,
              description: 'Estimated completion time in minutes',
            },
            thumbnailUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Subscription Plan schema
        SubscriptionPlan: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Basic Plan',
            },
            tier: {
              type: 'string',
              enum: ['free', 'basic', 'professional', 'enterprise'],
              example: 'basic',
            },
            description: {
              type: 'string',
              example: 'Perfect for individuals and small teams',
            },
            priceMonthly: {
              type: 'number',
              format: 'float',
              example: 19.99,
            },
            priceYearly: {
              type: 'number',
              format: 'float',
              example: 199.99,
            },
            stripePriceIdMonthly: {
              type: 'string',
              example: 'price_1234567890',
            },
            stripePriceIdYearly: {
              type: 'string',
              example: 'price_0987654321',
            },
            maxWorkflows: {
              type: 'integer',
              example: 10,
            },
            maxWorkspaces: {
              type: 'integer',
              example: 3,
            },
            maxExecutionsPerMonth: {
              type: 'integer',
              example: 1000,
            },
            maxTeamMembers: {
              type: 'integer',
              example: 5,
            },
            features: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Advanced Integrations', 'Priority Support', 'Workflow Templates'],
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Workflow schema
        Workflow: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Customer Onboarding',
            },
            description: {
              type: 'string',
              example: 'Automate the customer onboarding process',
            },
            workflowData: {
              type: 'object',
              description: 'JSON representation of the workflow data including nodes and connections',
            },
            userId: {
              type: 'integer',
              format: 'int64',
              example: 1,
            },
            workspaceId: {
              type: 'integer',
              format: 'int64',
              example: 1,
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'inactive', 'archived'],
              example: 'active',
            },
            lastExecutedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            executionCount: {
              type: 'integer',
              example: 42,
            },
            schedule: {
              type: 'string',
              example: '0 9 * * 1-5', // cron expression for weekdays at 9 AM
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    './server/routes.ts', 
    './server/routes/*.ts',
    './server/routes/*-swagger.js'
  ], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);