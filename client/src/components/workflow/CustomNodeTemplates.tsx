import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Search,
  Plus,
  Save,
  Trash2,
  Edit,
  Star,
  Copy,
  Bookmark
} from 'lucide-react';
import { NodeType, NodeCategory, NodeTemplate } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';

interface CustomNodeTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NodeTemplate) => void;
}

export function CustomNodeTemplates({ 
  isOpen, 
  onClose,
  onSelectTemplate 
}: CustomNodeTemplatesProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<NodeTemplate | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<NodeTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    nodeType: 'action',
    configuration: {}
  });
  
  // Access templates from store
  const { 
    customTemplates,
    addCustomTemplate,
    removeCustomTemplate,
    updateCustomTemplate,
    duplicateCustomTemplate
  } = useWorkflowStore();
  
  // Filtered templates based on search
  const filteredTemplates = customTemplates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle template selection
  const handleSelectTemplate = (template: NodeTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    onClose();
  };

  // Handle template creation
  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast({
        title: 'Error',
        description: 'Name and description are required',
        variant: 'destructive'
      });
      return;
    }

    const template: NodeTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description || '',
      category: newTemplate.category as NodeCategory || 'custom',
      nodeType: newTemplate.nodeType as NodeType || 'action',
      icon: 'settings',
      configuration: newTemplate.configuration || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true
    };

    addCustomTemplate(template);
    setIsCreatingTemplate(false);
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      nodeType: 'action',
      configuration: {}
    });

    toast({
      title: 'Success',
      description: 'Template created successfully'
    });
  };

  // Handle template deletion
  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this template?')) {
      removeCustomTemplate(templateId);
      toast({
        title: 'Template Deleted',
        description: 'The template has been removed'
      });
    }
  };

  // Handle marking template as favorite
  const handleToggleFavorite = (templateId: string, isFavorite: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    updateCustomTemplate(templateId, { isFavorite: !isFavorite });
    toast({
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: isFavorite 
        ? 'Template removed from favorites' 
        : 'Template added to favorites'
    });
  };

  // Handle duplicating a template
  const handleDuplicateTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    duplicateCustomTemplate(templateId);
    toast({
      title: 'Template Duplicated',
      description: 'A copy of the template has been created'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Custom Node Templates</DialogTitle>
          <DialogDescription>
            Create, manage, and use your custom node templates to streamline your workflow creation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsCreatingTemplate(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recently Used</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="h-full">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Templates Found</h3>
                <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                  {searchQuery
                    ? 'No templates match your search criteria. Try a different search term.'
                    : 'You haven\'t created any custom templates yet. Create your first template to streamline your workflow creation.'}
                </p>
                <Button onClick={() => setIsCreatingTemplate(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <div className="flex space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => handleToggleFavorite(template.id, template.isFavorite, e)}
                            >
                              <Star 
                                className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                              />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => handleDuplicateTemplate(template.id, e)}
                            >
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => handleDeleteTemplate(template.id, e)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground pb-2">
                        <div className="flex justify-between">
                          <span>Type: {template.nodeType}</span>
                          <span>Category: {template.category}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.filter(t => t.isFavorite).length === 0 ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Favorites Yet</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      Mark templates as favorites for quick access to your most used node configurations.
                    </p>
                  </div>
                ) : (
                  filteredTemplates
                    .filter(template => template.isFavorite)
                    .map((template) => (
                      <Card 
                        key={template.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleToggleFavorite(template.id, template.isFavorite, e)}
                              >
                                <Star 
                                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDuplicateTemplate(template.id, e)}
                              >
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDeleteTemplate(template.id, e)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground pb-2">
                          <div className="flex justify-between">
                            <span>Type: {template.nodeType}</span>
                            <span>Category: {template.category}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.length === 0 ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Recent Templates</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      Templates you use will appear here for quick access.
                    </p>
                  </div>
                ) : (
                  // Sort by most recently updated
                  filteredTemplates
                    .slice()
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 6) // Show only the 6 most recent
                    .map((template) => (
                      <Card 
                        key={template.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleToggleFavorite(template.id, template.isFavorite, e)}
                              >
                                <Star 
                                  className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDuplicateTemplate(template.id, e)}
                              >
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDeleteTemplate(template.id, e)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground pb-2">
                          Last used: {new Date(template.updatedAt).toLocaleString()}
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Create Template Modal */}
      <Dialog open={isCreatingTemplate} onOpenChange={(open) => !open && setIsCreatingTemplate(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Custom Template</DialogTitle>
            <DialogDescription>
              Create a reusable node template with your custom configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="col-span-3"
                placeholder="My Custom Node"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="col-span-3"
                placeholder="Describe what this node template does..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nodeType" className="text-right">
                Node Type
              </Label>
              <select
                id="nodeType"
                value={newTemplate.nodeType}
                onChange={(e) => setNewTemplate({...newTemplate, nodeType: e.target.value as NodeType})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="trigger">Trigger</option>
                <option value="action">Action</option>
                <option value="condition">Condition</option>
                <option value="transformer">Transformer</option>
                <option value="api">API</option>
                <option value="connector">Connector</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <select
                id="category"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value as NodeCategory})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="custom">Custom</option>
                <option value="automation">Automation</option>
                <option value="integration">Integration</option>
                <option value="ai">AI & ML</option>
                <option value="data">Data Processing</option>
                <option value="messaging">Messaging</option>
                <option value="crm">CRM</option>
                <option value="social">Social Media</option>
                <option value="ecommerce">E-commerce</option>
                <option value="utility">Utility</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// For Clock icon
function Clock(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}