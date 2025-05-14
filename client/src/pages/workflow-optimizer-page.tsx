import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { PerformanceOptimizer } from '@/components/workflow/PerformanceOptimizer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeData } from '@/store/useWorkflowStore';
import { ZapIcon } from 'lucide-react';

const sampleNodes: Node<NodeData>[] = [
  {
    id: 'node-1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: {
      label: 'Get Contacts API',
      nodeType: 'api',
      configuration: {
        endpoint: 'https://api.example.com/contacts',
        method: 'GET'
      }
    }
  },
  {
    id: 'node-2',
    type: 'default',
    position: { x: 300, y: 200 },
    data: {
      label: 'Filter Contacts',
      nodeType: 'transformer',
      configuration: {
        filter: 'status === "active"'
      }
    }
  },
  {
    id: 'node-3',
    type: 'default',
    position: { x: 500, y: 300 },
    data: {
      label: 'Send Email API',
      nodeType: 'api',
      configuration: {
        endpoint: 'https://api.example.com/send-email',
        method: 'POST'
      }
    }
  },
  {
    id: 'node-4',
    type: 'default',
    position: { x: 700, y: 100 },
    data: {
      label: 'Update Database',
      nodeType: 'action',
      configuration: {
        table: 'contacts',
        action: 'update'
      }
    }
  }
];

const sampleEdges: Edge[] = [
  {
    id: 'edge-1-2',
    source: 'node-1',
    target: 'node-2',
    type: 'smoothstep'
  },
  {
    id: 'edge-2-3',
    source: 'node-2',
    target: 'node-3',
    type: 'smoothstep'
  },
  {
    id: 'edge-2-4',
    source: 'node-2',
    target: 'node-4',
    type: 'smoothstep'
  }
];

const WorkflowOptimizerPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(sampleNodes);
  const [edges, setEdges] = useState<Edge[]>(sampleEdges);
  
  const handleOptimize = (optimizedNodes: Node<NodeData>[], optimizedEdges: Edge[]) => {
    setNodes(optimizedNodes);
    setEdges(optimizedEdges);
    console.log('Workflow optimized with:', optimizedNodes.length, 'nodes and', optimizedEdges.length, 'edges');
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <ZapIcon className="h-8 w-8 text-primary" />
        Workflow Performance Optimization
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Workflow</CardTitle>
              <CardDescription>
                A sample workflow to demonstrate optimization capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {nodes.map(node => (
                  <li key={node.id} className="p-3 border rounded-md">
                    <div className="font-medium">{node.data.label}</div>
                    <div className="text-sm text-muted-foreground">Type: {node.data.nodeType}</div>
                    {node.data.optimized && (
                      <div className="text-xs mt-1 text-primary">✓ Optimized</div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <PerformanceOptimizer
            nodes={nodes}
            edges={edges}
            workflowId={123} // In a real app, this would be a real workflow ID
            onOptimize={handleOptimize}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowOptimizerPage;