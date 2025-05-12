# PumpFlux Standalone Workflow Builder - User Guide

This guide provides detailed instructions for using the standalone workflow builder in PumpFlux.

## Getting Started

### Starting the Standalone Server

1. Open a terminal and navigate to the project root
2. Run the standalone server:
   ```bash
   node quick-server.js
   ```
3. Access the workflow builder at: `http://localhost:3000`

## Interface Overview

The standalone workflow builder has a clean, intuitive interface divided into three main sections:

### 1. Left Sidebar: Node Library

Contains all available node types organized by category:
- CRM (HubSpot, Salesforce, Zoho)
- Communication (Email, Slack, SMS)
- Productivity (Google Sheets, Docs, Calendar)
- Social Media (Facebook, Twitter, LinkedIn)
- AI & ML (OpenAI, Sentiment Analysis, NLP)

Each node represents an action or integration you can add to your workflow.

### 2. Center Canvas: Workflow Design Area

This is where you build your workflow by:
- Dragging nodes from the sidebar onto the canvas
- Connecting nodes together to define the flow of data
- Arranging nodes spatially to visualize the workflow logic

The canvas provides:
- Grid background for alignment
- Zooming and panning controls
- Drag-and-drop functionality for node placement

### 3. Right Sidebar: Properties Panel

Shows properties and settings for:
- The currently selected node
- Overall workflow properties when no node is selected

## Building Your First Workflow

### Step 1: Add a Trigger Node

Every workflow starts with a trigger node that initiates the workflow:

1. Click the "Add a Trigger" button in the welcome message
2. A trigger node will appear in the center of the canvas
3. Configure the trigger in the right properties panel

### Step 2: Add Action Nodes

Add the actions you want to occur when the workflow runs:

1. Drag nodes from the left sidebar onto the canvas
2. Position them in a logical sequence, typically from top to bottom or left to right
3. Click on a node to select it and configure its properties in the right panel

### Step 3: Connect Nodes

Create connections between nodes to define the flow of data:

1. Click and drag from the output port of one node (right side)
2. Drop onto the input port of another node (left side)
3. A connection line will appear between the nodes

### Step 4: Configure Node Settings

Each node has its own settings that determine its behavior:

1. Click on a node to select it
2. The right sidebar will show that node's properties
3. Fill in required fields and options
4. Node colors indicate their status:
   - Yellow: Trigger or waiting
   - Blue: Default state
   - Green: Successfully executed
   - Red: Error state

## Node Type Reference

### CRM Nodes

- **HubSpot**: Interact with HubSpot CRM data (contacts, deals, etc.)
- **Salesforce**: Connect with Salesforce objects and functions
- **Zoho CRM**: Manage Zoho CRM data and workflows

### Communication Nodes

- **Email**: Send emails or process incoming emails
- **Slack**: Post messages or respond to Slack events
- **SMS**: Send or receive text messages

### Productivity Nodes

- **Google Sheets**: Read from or write to Google Sheets
- **Google Docs**: Create or modify Google Docs
- **Calendar**: Schedule or respond to calendar events

### Social Media Nodes

- **Facebook**: Post updates, monitor engagement, process leads
- **Twitter**: Post tweets, monitor mentions, analyze trends
- **LinkedIn**: Manage professional network content and connections

### AI & ML Nodes

- **OpenAI**: Leverage AI models for content generation or analysis
- **Sentiment Analysis**: Analyze text for sentiment and emotional tone
- **NLP**: Process and understand natural language inputs

## Tips and Best Practices

1. **Plan Before Building**: Sketch your workflow on paper first to understand the logic
2. **Use Clear Node Naming**: Give each node a descriptive name for better organization
3. **Group Related Functions**: Keep related nodes close together on the canvas
4. **Test As You Build**: Verify each node works before adding the next one
5. **Create Simple Workflows First**: Start with basic workflows before attempting complex ones

## Keyboard Shortcuts

- **Delete**: Remove selected node
- **Ctrl+Z**: Undo last action
- **Ctrl+C/Ctrl+V**: Copy/paste selected node
- **Arrow Keys**: Fine-tune node position
- **+/-**: Zoom in/out
- **Space+Drag**: Pan the canvas

## Saving and Exporting

In the standalone version, saving functionality is limited. For full persistence:

1. Use the "Save" button to demonstrate the UI interaction
2. For actual persistence of workflows, use the full application with database support

## Troubleshooting the Standalone Builder

### Nodes Don't Appear When Dragging

- Check that you're dragging from the node title or icon
- Ensure JavaScript is enabled in your browser
- Try a different browser if the issue persists

### Connection Lines Don't Form

- Make sure you're dragging from an output port to an input port
- Check that the target node accepts connections
- Try clicking directly on the port handles

### UI Elements Look Broken

- Ensure your browser supports modern CSS features
- Check that Font Awesome CDN is accessible for icons
- Try disabling browser extensions that might interfere

### Canvas Performance Issues

- Limit the number of nodes on the canvas for better performance
- Use the zoom controls to focus on specific areas
- Close other browser tabs to free up resources