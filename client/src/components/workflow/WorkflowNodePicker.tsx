import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Star, Clock, Plus, Filter, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { NodeCategory } from '@/types/workflow';

interface NodeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: NodeCategory;
  popular?: boolean;
  new?: boolean;
}

interface AppNodeType {
  id: string;
  name: string;
  icon: string;
  actions: {
    id: string;
    name: string;
    description: string;
    popular?: boolean;
    new?: boolean;
  }[];
  triggers: {
    id: string;
    name: string;
    description: string;
    popular?: boolean;
    new?: boolean;
  }[];
}

interface WorkflowNodePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string, category: NodeCategory) => void;
  initialCategory?: NodeCategory;
}

export function WorkflowNodePicker({ 
  isOpen, 
  onClose, 
  onSelectNode,
  initialCategory = 'trigger'
}: WorkflowNodePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<NodeCategory>(initialCategory);
  const [activeApp, setActiveApp] = useState<AppNodeType | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'new'>('all');

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveApp(null);
      setActiveCategory(initialCategory);
      setSearchQuery('');
    }
  }, [isOpen, initialCategory]);

  // Sample data for apps - in a real app, this would come from an API
  const apps: AppNodeType[] = [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: 'https://cdn.zapier.com/storage/services/54f0bd6f9c31b757ab8d9f846aede1de.png',
      actions: [
        { 
          id: 'add-row', 
          name: 'Add Row', 
          description: 'Add a new row to a Google Sheet',
          popular: true
        },
        { 
          id: 'update-row', 
          name: 'Update Row', 
          description: 'Update an existing row in a Google Sheet'
        },
        { 
          id: 'get-rows', 
          name: 'Get Rows', 
          description: 'Get rows from a Google Sheet'
        },
      ],
      triggers: [
        { 
          id: 'new-row', 
          name: 'New Row', 
          description: 'Triggers when a new row is added to a Google Sheet',
          popular: true
        },
        { 
          id: 'updated-row', 
          name: 'Updated Row', 
          description: 'Triggers when a row is updated in a Google Sheet'
        },
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: 'https://cdn.zapier.com/storage/services/748073910ff63c72db5d7accdaf52d1d.png',
      actions: [
        { 
          id: 'send-message', 
          name: 'Send Message', 
          description: 'Send a message to a Slack channel',
          popular: true
        },
        { 
          id: 'create-channel', 
          name: 'Create Channel', 
          description: 'Create a new Slack channel'
        },
      ],
      triggers: [
        { 
          id: 'new-message', 
          name: 'New Message', 
          description: 'Triggers when a new message is posted to a channel',
          popular: true
        },
        { 
          id: 'new-channel', 
          name: 'New Channel', 
          description: 'Triggers when a new channel is created'
        },
      ]
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      icon: 'https://cdn.zapier.com/storage/services/208673cf26d3ad37fa9c541dd863a849.png',
      actions: [
        { 
          id: 'create-account', 
          name: 'Create Account', 
          description: 'Create a new Salesforce account',
          popular: true
        },
        { 
          id: 'update-contact', 
          name: 'Update Contact', 
          description: 'Update an existing Salesforce contact'
        },
      ],
      triggers: [
        { 
          id: 'new-lead', 
          name: 'New Lead', 
          description: 'Triggers when a new lead is created in Salesforce',
          popular: true,
          new: true
        },
        { 
          id: 'updated-opportunity', 
          name: 'Updated Opportunity', 
          description: 'Triggers when an opportunity is updated in Salesforce'
        },
      ]
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      icon: 'https://cdn.zapier.com/storage/services/87d3bd71db9fc742f9d269ad0a93eb33.png',
      actions: [
        { 
          id: 'create-contact', 
          name: 'Create Contact', 
          description: 'Create a new HubSpot contact',
          popular: true
        },
        { 
          id: 'update-deal', 
          name: 'Update Deal', 
          description: 'Update an existing HubSpot deal'
        },
      ],
      triggers: [
        { 
          id: 'new-contact', 
          name: 'New Contact', 
          description: 'Triggers when a new contact is created in HubSpot',
          popular: true
        },
        { 
          id: 'new-deal', 
          name: 'New Deal', 
          description: 'Triggers when a new deal is created in HubSpot',
          new: true
        },
      ]
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: 'https://cdn.zapier.com/storage/services/b30c8d8c5dbc4914ce6b40342c88e3a2.png',
      actions: [
        { 
          id: 'send-email', 
          name: 'Send Email', 
          description: 'Send a new email through Gmail',
          popular: true
        },
        { 
          id: 'create-draft', 
          name: 'Create Draft', 
          description: 'Create a new draft email in Gmail'
        },
      ],
      triggers: [
        { 
          id: 'new-email', 
          name: 'New Email', 
          description: 'Triggers when a new email is received in Gmail',
          popular: true
        },
        { 
          id: 'new-attachment', 
          name: 'New Attachment', 
          description: 'Triggers when a new email with an attachment is received'
        },
      ]
    },
    {
      id: 'trello',
      name: 'Trello',
      icon: 'https://cdn.zapier.com/storage/developer/f8c59a62248b4c4eef9a36811aa02a22.png',
      actions: [
        { 
          id: 'create-card', 
          name: 'Create Card', 
          description: 'Create a new card in Trello',
          popular: true
        },
        { 
          id: 'move-card', 
          name: 'Move Card', 
          description: 'Move a card to another list'
        },
      ],
      triggers: [
        { 
          id: 'new-card', 
          name: 'New Card', 
          description: 'Triggers when a new card is created',
          popular: true
        },
        { 
          id: 'card-moved', 
          name: 'Card Moved', 
          description: 'Triggers when a card is moved to a different list'
        },
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: 'https://cdn.zapier.com/storage/developer/71a53e067ab0a50edbdb22e3099956e6.png',
      actions: [
        { 
          id: 'generate-text', 
          name: 'Generate Text', 
          description: 'Generate text using the GPT model',
          popular: true,
          new: true
        },
        { 
          id: 'create-image', 
          name: 'Create Image', 
          description: 'Generate an image using DALL-E',
          new: true
        },
      ],
      triggers: [],
    },
  ];

  // Built-in utility nodes
  const utilityNodes: NodeType[] = [
    {
      id: 'code',
      name: 'Code',
      description: 'Run custom code as part of your workflow',
      icon: '🧩',
      category: 'transformer',
      popular: true,
    },
    {
      id: 'filter',
      name: 'Filter',
      description: 'Filter data based on conditions',
      icon: '🔍',
      category: 'condition',
      popular: true,
    },
    {
      id: 'delay',
      name: 'Delay',
      description: 'Add a delay or wait between steps',
      icon: '⏱️',
      category: 'action',
      popular: true,
    },
    {
      id: 'loop',
      name: 'Loop',
      description: 'Loop through a list of items',
      icon: '🔄',
      category: 'action',
    },
  ];

  // Specialized schedule triggers
  const scheduleTriggers: NodeType[] = [
    {
      id: 'schedule-once',
      name: 'Run Once',
      description: 'Trigger workflow to run one time at a specific date and time',
      icon: '🕒',
      category: 'trigger',
      popular: true,
    },
    {
      id: 'schedule-interval',
      name: 'Run at Intervals',
      description: 'Trigger workflow to run repeatedly at specified intervals',
      icon: '⏰',
      category: 'trigger',
      popular: true,
    },
    {
      id: 'schedule-cron',
      name: 'Cron Job',
      description: 'Trigger workflow on a custom schedule using cron syntax',
      icon: '📆',
      category: 'trigger',
    },
  ];

  const webhookTriggers: NodeType[] = [
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'Trigger workflow when a webhook URL is called',
      icon: '🌐',
      category: 'trigger',
      popular: true,
    },
    {
      id: 'http-request',
      name: 'HTTP Request',
      description: 'Make HTTP requests to external APIs',
      icon: '📡',
      category: 'action',
      popular: true,
    },
  ];

  // Filter apps based on search and active category
  const filteredApps = apps
    .filter(app => {
      const matchesSearch = 
        searchQuery === '' || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.actions.some(action => action.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        app.triggers.some(trigger => trigger.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Only show apps with relevant node types for the active category
      if (activeCategory === 'trigger') {
        return matchesSearch && app.triggers.length > 0;
      } else if (activeCategory === 'action') {
        return matchesSearch && app.actions.length > 0;
      }
      
      return matchesSearch;
    });
  
  // Get filtered utility nodes based on active category
  const filteredUtilityNodes = utilityNodes
    .filter(node => 
      (activeCategory === 'all' || node.category === activeCategory) &&
      (searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Get filtered schedule triggers
  const filteredScheduleTriggers = scheduleTriggers
    .filter(node => 
      (activeCategory === 'all' || node.category === 'trigger') &&
      (searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Get filtered webhook triggers
  const filteredWebhookTriggers = webhookTriggers
    .filter(node => 
      (activeCategory === 'all' || node.category === activeCategory) &&
      (searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Filter node list based on active tab
  const filterByTab = (nodes: any[]) => {
    if (activeTab === 'popular') {
      return nodes.filter(node => node.popular);
    } else if (activeTab === 'new') {
      return nodes.filter(node => node.new);
    }
    return nodes;
  };

  const handleSelectNode = (nodeId: string, category: NodeCategory) => {
    onSelectNode(nodeId, category);
    onClose();
  };

  const handleAppClick = (app: AppNodeType) => {
    setActiveApp(app);
  };

  const handleBackClick = () => {
    setActiveApp(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {activeApp ? (
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2 -ml-2" 
                    onClick={handleBackClick}
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </Button>
                  <img 
                    src={activeApp.icon} 
                    alt={activeApp.name}
                    className="w-6 h-6 mr-2" 
                  />
                  {activeApp.name}
                </div>
              ) : (
                <span>
                  {activeCategory === 'trigger' ? 'Select a Trigger' : 
                   activeCategory === 'action' ? 'Select an Action' :
                   activeCategory === 'condition' ? 'Select a Condition' :
                   activeCategory === 'transformer' ? 'Select a Transformer' :
                   'Select a Node'}
                </span>
              )}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {activeApp ? (
              <span>Choose an {activeCategory === 'trigger' ? 'trigger' : 'action'} for {activeApp.name}</span>
            ) : (
              <span>Build your workflow by adding nodes</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {!activeApp && (
          <div className="flex gap-2 p-4 border-b">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apps and actions..."
                className="pl-8 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        )}
        
        <div className="overflow-y-auto flex-1">
          {!activeApp ? (
            <div className="p-4">
              {/* Category Tabs */}
              <div className="mb-4">
                <Tabs value={activeCategory} className="w-full">
                  <TabsList className="w-full justify-start mb-2 p-1 h-auto">
                    <TabsTrigger 
                      value="trigger" 
                      onClick={() => setActiveCategory('trigger')}
                      className="text-xs py-1 px-3 h-auto"
                    >
                      Triggers
                    </TabsTrigger>
                    <TabsTrigger 
                      value="action" 
                      onClick={() => setActiveCategory('action')}
                      className="text-xs py-1 px-3 h-auto"
                    >
                      Actions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="condition" 
                      onClick={() => setActiveCategory('condition')}
                      className="text-xs py-1 px-3 h-auto"
                    >
                      Conditions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="transformer" 
                      onClick={() => setActiveCategory('transformer')}
                      className="text-xs py-1 px-3 h-auto"
                    >
                      Transformers
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Tabs value={activeTab} className="w-full">
                  <TabsList className="w-full mb-4 justify-start bg-muted/40 p-1">
                    <TabsTrigger 
                      value="all" 
                      onClick={() => setActiveTab('all')}
                      className="text-xs py-1 px-3"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="popular" 
                      onClick={() => setActiveTab('popular')}
                      className="text-xs py-1 px-3"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </TabsTrigger>
                    <TabsTrigger 
                      value="new" 
                      onClick={() => setActiveTab('new')}
                      className="text-xs py-1 px-3"
                    >
                      <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 rounded-sm bg-blue-500 text-white">NEW</Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Schedule Triggers Section */}
              {activeCategory === 'trigger' && filterByTab(filteredScheduleTriggers).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Schedule Triggers
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filterByTab(filteredScheduleTriggers).map(node => (
                      <button
                        key={node.id}
                        onClick={() => handleSelectNode(node.id, node.category)}
                        className="flex items-start gap-3 p-3 text-left rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 text-lg">{node.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="font-medium text-base">{node.name}</h4>
                            {node.popular && (
                              <Badge variant="secondary" className="ml-2 text-[10px] py-0">Popular</Badge>
                            )}
                            {node.new && (
                              <Badge className="ml-2 text-[10px] py-0 bg-blue-500">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{node.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50 self-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Webhook Triggers Section */}
              {activeCategory === 'trigger' && filterByTab(filteredWebhookTriggers).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Webhook Triggers</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filterByTab(filteredWebhookTriggers).map(node => (
                      <button
                        key={node.id}
                        onClick={() => handleSelectNode(node.id, node.category)}
                        className="flex items-start gap-3 p-3 text-left rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 text-lg">{node.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="font-medium text-base">{node.name}</h4>
                            {node.popular && (
                              <Badge variant="secondary" className="ml-2 text-[10px] py-0">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{node.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50 self-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Utility Nodes Section */}
              {filterByTab(filteredUtilityNodes).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Utilities</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filterByTab(filteredUtilityNodes).map(node => (
                      <button
                        key={node.id}
                        onClick={() => handleSelectNode(node.id, node.category)}
                        className="flex items-start gap-3 p-3 text-left rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 text-lg">{node.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="font-medium text-base">{node.name}</h4>
                            {node.popular && (
                              <Badge variant="secondary" className="ml-2 text-[10px] py-0">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{node.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50 self-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Apps Section */}
              {filteredApps.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                    {activeCategory === 'trigger' ? 'App Triggers' : 'App Actions'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filterByTab(filteredApps).map(app => (
                      <button
                        key={app.id}
                        onClick={() => handleAppClick(app)}
                        className="flex flex-col items-center gap-2 p-4 text-center rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <img src={app.icon} alt={app.name} className="w-12 h-12 object-contain" />
                        <div>
                          <h4 className="font-medium text-sm">{app.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activeCategory === 'trigger' 
                              ? `${app.triggers.length} ${app.triggers.length === 1 ? 'trigger' : 'triggers'}`
                              : `${app.actions.length} ${app.actions.length === 1 ? 'action' : 'actions'}`
                            }
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Results */}
              {filteredApps.length === 0 && filteredUtilityNodes.length === 0 && 
               filteredScheduleTriggers.length === 0 && filteredWebhookTriggers.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try a different search term or category
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              {activeCategory === 'trigger' && activeApp.triggers.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Available Triggers</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {activeApp.triggers
                      .filter(trigger => 
                        searchQuery === '' || 
                        trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        trigger.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(trigger => (
                        <button
                          key={trigger.id}
                          onClick={() => handleSelectNode(`${activeApp.id}-${trigger.id}`, 'trigger')}
                          className="flex items-start gap-3 p-3 text-left rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h4 className="font-medium text-base">{trigger.name}</h4>
                              {trigger.popular && (
                                <Badge variant="secondary" className="ml-2 text-[10px] py-0">Popular</Badge>
                              )}
                              {trigger.new && (
                                <Badge className="ml-2 text-[10px] py-0 bg-blue-500">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{trigger.description}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground/50 self-center" />
                        </button>
                      ))
                    }
                  </div>
                </div>
              ) : activeCategory === 'action' && activeApp.actions.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Available Actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {activeApp.actions
                      .filter(action => 
                        searchQuery === '' || 
                        action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        action.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(action => (
                        <button
                          key={action.id}
                          onClick={() => handleSelectNode(`${activeApp.id}-${action.id}`, 'action')}
                          className="flex items-start gap-3 p-3 text-left rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h4 className="font-medium text-base">{action.name}</h4>
                              {action.popular && (
                                <Badge variant="secondary" className="ml-2 text-[10px] py-0">Popular</Badge>
                              )}
                              {action.new && (
                                <Badge className="ml-2 text-[10px] py-0 bg-blue-500">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{action.description}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground/50 self-center" />
                        </button>
                      ))
                    }
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No options available</h3>
                  <p className="text-muted-foreground">
                    This app doesn't have any {activeCategory === 'trigger' ? 'triggers' : 'actions'} available yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}