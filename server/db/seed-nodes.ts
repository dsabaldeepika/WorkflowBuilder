import { db } from '../db';
import { nodeTypes } from '@shared/schema';
import { fileURLToPath } from 'url';

export async function seedNodeConfigurations() {
  console.log('Starting node configuration seeding...');

  try {
    // Define node types with comprehensive configurations
    const newNodeTypes = [
      // Social Media Nodes
      {
        name: 'facebook_trigger',
        displayName: 'Facebook Trigger',
        category: 'trigger',
        description: 'Trigger workflow on Facebook events',
        icon: 'facebook',
        color: '#1877F2',
        service: 'facebook',
        config: {
          inputFields: {
            events: {
              type: 'select',
              options: ['new_lead', 'form_submission', 'page_post'],
              required: true
            },
            form_id: {
              type: 'string',
              required: true,
              description: 'Facebook form ID to monitor'
            },
            include_fields: {
              type: 'multiselect',
              options: ['name', 'email', 'phone', 'company', 'message'],
              required: true
            },
            filter_conditions: {
              type: 'object',
              properties: {
                status: {
                  type: 'select',
                  options: ['new', 'processed', 'all']
                }
              }
            }
          },
          outputFields: {
            lead: {
              type: 'object',
              properties: {
                id: 'string',
                name: 'string',
                email: 'string',
                phone: 'string',
                company: 'string',
                message: 'string',
                created_time: 'string'
              }
            }
          }
        }
      },
      {
        name: 'slack_action',
        displayName: 'Slack Action',
        category: 'action',
        description: 'Send messages to Slack channels',
        icon: 'slack',
        color: '#4A154B',
        service: 'slack',
        config: {
          inputFields: {
            channel: {
              type: 'string',
              required: true,
              description: 'Slack channel ID'
            },
            message_type: {
              type: 'select',
              options: ['text', 'blocks'],
              required: true
            },
            blocks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: 'string',
                  text: {
                    type: 'object',
                    properties: {
                      type: 'string',
                      text: 'string'
                    }
                  }
                }
              },
              required: true,
              when: {
                message_type: 'blocks'
              }
            },
            thread_ts: {
              type: 'string',
              required: false,
              description: 'Thread timestamp for replies'
            },
            reply_broadcast: {
              type: 'boolean',
              required: false,
              description: 'Whether to broadcast reply to channel'
            }
          },
          outputFields: {
            result: {
              type: 'object',
              properties: {
                success: 'boolean',
                message_ts: 'string',
                error: 'string'
              }
            }
          }
        }
      },

      // AI Nodes
      {
        name: 'openai_action',
        displayName: 'OpenAI Action',
        category: 'action',
        description: 'Generate content using OpenAI models',
        icon: 'openai',
        color: '#10A37F',
        service: 'openai',
        config: {
          inputFields: {
            model: {
              type: 'select',
              options: ['gpt-4', 'gpt-3.5-turbo'],
              required: true
            },
            prompt: {
              type: 'string',
              required: true,
              description: 'Prompt for the AI model'
            },
            max_tokens: {
              type: 'number',
              required: true,
              min: 1,
              max: 4000
            },
            temperature: {
              type: 'number',
              required: true,
              min: 0,
              max: 2
            }
          },
          outputFields: {
            response: {
              type: 'string',
              description: 'Generated content from the AI model'
            }
          }
        }
      },

      // Google Sheets Nodes
      {
        name: 'google_sheets_trigger',
        displayName: 'Google Sheets Trigger',
        category: 'trigger',
        description: 'Trigger workflow on Google Sheets events',
        icon: 'sheets',
        color: '#0F9D58',
        service: 'google-sheets',
        config: {
          inputFields: {
            spreadsheet_id: {
              type: 'string',
              required: true,
              description: 'Google Sheets spreadsheet ID'
            },
            sheet_name: {
              type: 'string',
              required: true,
              description: 'Sheet name to monitor'
            },
            include_fields: {
              type: 'multiselect',
              options: ['*'],
              required: true
            }
          },
          outputFields: {
            row: {
              type: 'object',
              properties: {
                id: 'string',
                values: 'object',
                timestamp: 'string'
              }
            }
          }
        }
      },
      {
        name: 'google_sheets_action',
        displayName: 'Google Sheets Action',
        category: 'action',
        description: 'Perform actions in Google Sheets',
        icon: 'sheets',
        color: '#0F9D58',
        service: 'google-sheets',
        config: {
          inputFields: {
            spreadsheet_id: {
              type: 'string',
              required: true,
              description: 'Google Sheets spreadsheet ID'
            },
            sheet_name: {
              type: 'string',
              required: true,
              description: 'Sheet name to update'
            },
            value_input_option: {
              type: 'select',
              options: ['RAW', 'USER_ENTERED'],
              required: true
            },
            insert_data_option: {
              type: 'select',
              options: ['INSERT_ROWS', 'OVERWRITE'],
              required: true
            },
            column_mapping: {
              type: 'object',
              properties: {
                '*': 'string'
              },
              required: true
            }
          },
          outputFields: {
            result: {
              type: 'object',
              properties: {
                success: 'boolean',
                updated_range: 'string',
                error: 'string'
              }
            }
          }
        }
      }
    ];

    // Insert new node types
    for (const nodeType of newNodeTypes) {
      try {
        await db.insert(nodeTypes).values({
          name: nodeType.name,
          displayName: nodeType.displayName,
          category: nodeType.category,
          description: nodeType.description,
          icon: nodeType.icon,
          color: nodeType.color,
          config: nodeType.config,
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log(`Created node type: ${nodeType.name}`);
      } catch (error: any) {
        if (error.code === '23505') { // Unique violation
          console.log(`Node type ${nodeType.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('Node configuration seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding node configurations:', error);
    throw error;
  }
}

// Only run the seed function if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNodeConfigurations()
    .then(() => {
      console.log('Node configuration seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Node configuration seed failed:', error);
      process.exit(1);
    });
}