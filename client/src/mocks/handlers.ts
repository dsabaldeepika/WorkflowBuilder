import { rest } from 'msw';
import { NodeConfig, NodeData } from '@/types/workflow';

export const handlers = [
  // Get node configurations
  rest.get('/api/node-config', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        configs: [
          {
            id: '1',
            name: 'Test Node',
            displayName: 'Test Node',
            description: 'A test node',
            category: 'test',
            type: 'test',
            icon: 'test',
            color: '#000000',
            version: '1.0.0',
            inputFields: [],
            outputFields: []
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      })
    );
  }),

  // Create node configuration
  rest.post('/api/node-config', async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({
        id: '2',
        ...body
      })
    );
  }),

  // Update node configuration
  rest.put('/api/node-config/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();
    return res(
      ctx.status(200),
      ctx.json({
        id,
        ...body
      })
    );
  }),

  // Delete node configuration
  rest.delete('/api/node-config/:id', (req, res, ctx) => {
    return res(
      ctx.status(204)
    );
  }),

  // Execute node
  rest.post('/api/workflow/execute-node/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const { inputs, config } = await req.json();

    // Simulate node execution
    return res(
      ctx.status(200),
      ctx.json({
        nodeId: id,
        status: 'success',
        result: {
          message: 'Node executed successfully',
          inputs,
          config
        }
      })
    );
  }),

  // Execute workflow
  rest.post('/api/workflow/execute', async (req, res, ctx) => {
    const { nodes, edges } = await req.json();

    // Simulate workflow execution
    const results = nodes.reduce((acc: Record<string, any>, node: Node<NodeData>) => {
      acc[node.id] = {
        status: 'success',
        result: {
          message: `Node ${node.id} executed successfully`
        }
      };
      return acc;
    }, {});

    return res(
      ctx.status(200),
      ctx.json({
        status: 'success',
        results
      })
    );
  }),

  // Get node type definition
  rest.get('/api/workflow/node-types/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: 'Test Node Type',
        description: 'A test node type',
        category: 'test',
        type: 'test',
        inputFields: [],
        outputFields: []
      })
    );
  })
]; 