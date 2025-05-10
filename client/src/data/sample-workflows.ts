import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';

// Sample workflow for testing the monitoring and execution components
export const sampleWorkflow = {
  nodes: [
    // Trigger node - Schedule
    {
      id: 'trigger-1',
      type: 'trigger',
      data: {
        label: 'Schedule Trigger',
        nodeType: 'trigger',
        type: 'trigger',
        description: 'Runs the workflow on a schedule',
        icon: 'clock',
        configuration: {
          frequency: 'daily',
          time: '09:00',
          timezone: 'UTC'
        }
      },
      position: { x: 250, y: 50 }
    },
    
    // Action node - Get data
    {
      id: 'action-1',
      type: 'action',
      data: {
        label: 'Fetch Customer Data',
        nodeType: 'action',
        type: 'action',
        description: 'Retrieves customer data from the CRM',
        icon: 'database',
        configuration: {
          endpoint: '/api/customers',
          method: 'GET',
          params: {
            limit: 100,
            status: 'active'
          }
        }
      },
      position: { x: 250, y: 200 }
    },
    
    // Condition node - Filter customers
    {
      id: 'condition-1',
      type: 'condition',
      data: {
        label: 'Filter Premium Customers',
        nodeType: 'condition',
        type: 'condition',
        description: 'Filters customers by premium status',
        icon: 'filter',
        configuration: {
          condition: 'customer.isPremium === true'
        }
      },
      position: { x: 250, y: 350 }
    },
    
    // Action node - Send email (if condition is true)
    {
      id: 'action-2',
      type: 'action',
      data: {
        label: 'Send Premium Email',
        nodeType: 'action',
        type: 'action',
        description: 'Sends marketing email to premium customers',
        icon: 'mail',
        configuration: {
          template: 'premium-offer',
          subject: 'Exclusive Offer for Premium Members',
          from: 'marketing@example.com'
        }
      },
      position: { x: 100, y: 500 }
    },
    
    // Action node - Standard notification (if condition is false)
    {
      id: 'action-3',
      type: 'action',
      data: {
        label: 'Send Standard Email',
        nodeType: 'action',
        type: 'action',
        description: 'Sends standard email to regular customers',
        icon: 'mail',
        configuration: {
          template: 'standard-offer',
          subject: 'Special Offer',
          from: 'marketing@example.com'
        }
      },
      position: { x: 400, y: 500 }
    },
    
    // Final action - Update CRM
    {
      id: 'action-4',
      type: 'action',
      data: {
        label: 'Update CRM',
        nodeType: 'action',
        type: 'action',
        description: 'Updates customer contact records in CRM',
        icon: 'save',
        configuration: {
          endpoint: '/api/customers/update',
          method: 'POST',
          field: 'lastContactedDate'
        }
      },
      position: { x: 250, y: 650 }
    }
  ] as Node<NodeData>[],
  
  edges: [
    // Trigger to fetch data
    {
      id: 'e1-2',
      source: 'trigger-1',
      target: 'action-1',
      type: 'default'
    },
    
    // Fetch data to filter
    {
      id: 'e2-3',
      source: 'action-1',
      target: 'condition-1',
      type: 'default'
    },
    
    // Condition to premium email
    {
      id: 'e3-4',
      source: 'condition-1',
      target: 'action-2',
      type: 'default',
      data: {
        condition: 'true'
      }
    },
    
    // Condition to standard email
    {
      id: 'e3-5',
      source: 'condition-1',
      target: 'action-3',
      type: 'default',
      data: {
        condition: 'false'
      }
    },
    
    // Premium email to update CRM
    {
      id: 'e4-6',
      source: 'action-2',
      target: 'action-4',
      type: 'default'
    },
    
    // Standard email to update CRM
    {
      id: 'e5-6',
      source: 'action-3',
      target: 'action-4',
      type: 'default'
    }
  ] as Edge[]
};

// More complex workflow with integrations
export const complexWorkflow = {
  nodes: [
    // Trigger node - Webhook
    {
      id: 'trigger-webhook',
      type: 'trigger',
      data: {
        label: 'New Order Webhook',
        nodeType: 'trigger',
        type: 'trigger',
        description: 'Triggered when a new order is placed',
        icon: 'webhook',
        configuration: {
          endpoint: '/webhooks/new-order',
          method: 'POST',
          authType: 'api-key'
        }
      },
      position: { x: 250, y: 50 }
    },
    
    // Integration - Shopify
    {
      id: 'integration-1',
      type: 'integration',
      data: {
        label: 'Validate Order in Shopify',
        nodeType: 'integration',
        type: 'integration',
        description: 'Validates the order details with Shopify API',
        icon: 'shopping-bag',
        configuration: {
          apiKey: '{{SHOPIFY_API_KEY}}',
          storeUrl: 'store.myshopify.com',
          endpoint: '/orders/validate'
        }
      },
      position: { x: 250, y: 180 }
    },
    
    // Condition - Check Order Value
    {
      id: 'condition-value',
      type: 'condition',
      data: {
        label: 'Check Order Value',
        nodeType: 'condition',
        type: 'condition',
        description: 'Routes based on order total value',
        icon: 'dollar-sign',
        configuration: {
          condition: 'order.total > 100'
        }
      },
      position: { x: 250, y: 310 }
    },
    
    // Action - Process High Value Order
    {
      id: 'action-high',
      type: 'action',
      data: {
        label: 'Process High Value Order',
        nodeType: 'action',
        type: 'action',
        description: 'Special processing for high value orders',
        icon: 'star',
        configuration: {
          priority: 'high',
          assignTo: 'premium-team'
        }
      },
      position: { x: 100, y: 440 }
    },
    
    // Action - Process Standard Order
    {
      id: 'action-standard',
      type: 'action',
      data: {
        label: 'Process Standard Order',
        nodeType: 'action',
        type: 'action',
        description: 'Normal processing for standard orders',
        icon: 'package',
        configuration: {
          priority: 'normal',
          assignTo: 'standard-team'
        }
      },
      position: { x: 400, y: 440 }
    },
    
    // Integration - Slack Notification
    {
      id: 'integration-slack',
      type: 'integration',
      data: {
        label: 'Send Slack Notification',
        nodeType: 'integration',
        type: 'integration',
        description: 'Notifies the team in Slack',
        icon: 'message-square',
        configuration: {
          webhookUrl: '{{SLACK_WEBHOOK_URL}}',
          channel: '#orders',
          template: 'order-notification'
        }
      },
      position: { x: 250, y: 570 }
    },
    
    // Integration - Update Inventory
    {
      id: 'integration-inventory',
      type: 'integration',
      data: {
        label: 'Update Inventory',
        nodeType: 'integration',
        type: 'integration',
        description: 'Updates product inventory levels',
        icon: 'layers',
        configuration: {
          apiEndpoint: '/api/inventory/update',
          method: 'POST',
          authType: 'oauth'
        }
      },
      position: { x: 250, y: 700 }
    }
  ] as Node<NodeData>[],
  
  edges: [
    // Webhook to Shopify validation
    {
      id: 'e-webhook-validate',
      source: 'trigger-webhook',
      target: 'integration-1',
      type: 'default'
    },
    
    // Validation to condition
    {
      id: 'e-validate-condition',
      source: 'integration-1',
      target: 'condition-value',
      type: 'default'
    },
    
    // Condition to high value process
    {
      id: 'e-condition-high',
      source: 'condition-value',
      target: 'action-high',
      type: 'default',
      data: {
        condition: 'true'
      }
    },
    
    // Condition to standard process
    {
      id: 'e-condition-standard',
      source: 'condition-value',
      target: 'action-standard',
      type: 'default',
      data: {
        condition: 'false'
      }
    },
    
    // High value to Slack
    {
      id: 'e-high-slack',
      source: 'action-high',
      target: 'integration-slack',
      type: 'default'
    },
    
    // Standard value to Slack
    {
      id: 'e-standard-slack',
      source: 'action-standard',
      target: 'integration-slack',
      type: 'default'
    },
    
    // Slack to Inventory
    {
      id: 'e-slack-inventory',
      source: 'integration-slack',
      target: 'integration-inventory',
      type: 'default'
    }
  ] as Edge[]
};

// Template for customer onboarding workflow
export const customerOnboardingTemplate = {
  id: 'customer-onboarding',
  name: 'Customer Onboarding',
  description: 'Automated workflow for new customer onboarding process',
  category: 'Sales & Marketing',
  image: '/templates/customer-onboarding.svg',
  useCases: [
    'New customer sign-up',
    'Free trial to paid conversion',
    'Account activation'
  ],
  requirements: [
    'CRM integration',
    'Email service provider',
    'Document management system'
  ],
  documentation: `
    # Customer Onboarding Workflow
    
    This template helps automate the customer onboarding process from initial sign-up to account activation.
    
    ## Key Steps
    
    1. Capture new customer details
    2. Welcome email with account information
    3. Assign customer success manager
    4. Schedule onboarding call
    5. Send documentation
    6. Follow-up sequence
    
    ## Customization Options
    
    - Change email templates
    - Adjust follow-up timing
    - Modify assigned teams
  `,
  nodes: [
    // Simplified version of the complete template
    {
      id: 'trigger-signup',
      type: 'trigger',
      data: {
        label: 'New Customer Sign-up',
        nodeType: 'trigger',
        type: 'trigger',
        description: 'Triggered when a new customer signs up',
        icon: 'user-plus'
      },
      position: { x: 250, y: 50 }
    },
    {
      id: 'action-welcome',
      type: 'action',
      data: {
        label: 'Send Welcome Email',
        nodeType: 'action',
        type: 'action',
        description: 'Sends welcome email with account details',
        icon: 'mail'
      },
      position: { x: 250, y: 200 }
    },
    {
      id: 'action-cs-assign',
      type: 'action',
      data: {
        label: 'Assign CS Manager',
        nodeType: 'action',
        type: 'action',
        description: 'Assigns a customer success manager',
        icon: 'user'
      },
      position: { x: 250, y: 350 }
    }
  ] as Node<NodeData>[],
  edges: [
    {
      id: 'e-signup-welcome',
      source: 'trigger-signup',
      target: 'action-welcome',
      type: 'default'
    },
    {
      id: 'e-welcome-cs',
      source: 'action-welcome',
      target: 'action-cs-assign',
      type: 'default'
    }
  ] as Edge[]
};

// Helper function to create unique node IDs
export function createUniqueNodeId(prefix: string = 'node'): string {
  return `${prefix}-${uuidv4().substring(0, 8)}`;
}