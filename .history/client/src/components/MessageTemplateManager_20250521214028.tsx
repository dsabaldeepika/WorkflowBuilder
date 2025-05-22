import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "./ui/use-toast";
import { Loader2, PlusCircle, Edit, Trash } from "lucide-react";
import axios from 'axios';

interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  category: string;
  language: string;
  variables: string[];
  isApproved: boolean;
}

export function MessageTemplateManager() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<MessageTemplate>>({
    name: '',
    content: '',
    category: 'general',
    language: 'en',
    variables: []
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load templates: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setIsLoading(true);
      if (editingTemplate) {
        await axios.put(`/api/templates/${editingTemplate.id}`, editingTemplate);
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
      } else {
        await axios.post('/api/templates', newTemplate);
        toast({
          title: "Success",
          description: "New template created successfully"
        });
        setNewTemplate({
          name: '',
          content: '',
          category: 'general',
          language: 'en',
          variables: []
        });
      }
      await loadTemplates();
      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`/api/templates/${id}`);
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      await loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Message Templates</h3>
          <Button onClick={() => setEditingTemplate(null)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>{template.language}</TableCell>
                <TableCell>
                  {template.isApproved ? (
                    <span className="text-green-600">Approved</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Template Editor */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </h3>

        <div className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input
              value={editingTemplate?.name || newTemplate.name}
              onChange={(e) => {
                if (editingTemplate) {
                  setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value
                  });
                } else {
                  setNewTemplate({
                    ...newTemplate,
                    name: e.target.value
                  });
                }
              }}
              placeholder="Enter template name..."
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={editingTemplate?.category || newTemplate.category}
              onValueChange={(value) => {
                if (editingTemplate) {
                  setEditingTemplate({
                    ...editingTemplate,
                    category: value
                  });
                } else {
                  setNewTemplate({
                    ...newTemplate,
                    category: value
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Template Content</Label>
            <Textarea
              value={editingTemplate?.content || newTemplate.content}
              onChange={(e) => {
                if (editingTemplate) {
                  setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value
                  });
                } else {
                  setNewTemplate({
                    ...newTemplate,
                    content: e.target.value
                  });
                }
              }}
              placeholder="Enter message template content..."
              className="min-h-[200px]"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Available variables: {{sender}}, {{recipient}}, {{timestamp}}
            </p>
          </div>

          <div>
            <Label>Language</Label>
            <Select
              value={editingTemplate?.language || newTemplate.language}
              onValueChange={(value) => {
                if (editingTemplate) {
                  setEditingTemplate({
                    ...editingTemplate,
                    language: value
                  });
                } else {
                  setNewTemplate({
                    ...newTemplate,
                    language: value
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSaveTemplate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
