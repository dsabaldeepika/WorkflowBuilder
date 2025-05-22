# PumpFlux - Workflow Automation Platform

PumpFlux is a powerful drag-and-drop workflow builder that enables users to create, monitor, and optimize complex integrations and automation flows with an intuitive, node-based interface. It's similar to popular automation tools like n8n, Make.com, Microsoft Power Automate, and Tray.io.

![PumpFlux](client/src/assets/templates/workflow-template-placeholder.svg)

## Features

### Core Features
- Interactive workflow canvas with drag-and-drop interface
- Predefined templates for common workflow scenarios
- Smart workflow recommendations and AI-assisted workflow creation
- **No authentication required for local development**

### Error Handling & Reliability
- Comprehensive error classification and categorization
- Intelligent retry management with configurable strategies
- Automated error recovery with fallback options
- Error trend analysis and predictive alerts

### Monitoring & Analytics
- Real-time workflow health monitoring dashboard
- Detailed execution metrics and performance analytics
- Error rate tracking and anomaly detection
- Node-level performance monitoring
- Custom metric collection and visualization

### Performance Optimization
- Automated workflow optimization suggestions
- Parallel execution of compatible tasks
- Smart timeout management and retry strategies
- Performance impact analysis for changes

### Integration Features
- Integration with major services (Facebook, HubSpot, Slack, etc.)
- Configurable API connection management
- Rate limiting and quota management
- Connection health monitoring

### Workflow Management
- Version control and change tracking
- Workflow dependency visualization
- Schedule management and execution planning
- Resource utilization optimization

## Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Stripe account (for subscription functionality)

## Environment Setup

Create a `.env` file in the project root with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/pumpflux
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

> **Note:** `SESSION_SECRET` and authentication-related variables are no longer required.

## Running the Project

### Option 1: Running on Replit

1. Fork the project on Replit
2. Wait for dependencies to install
3. Click the "Run" button to start the server
4. The application will be available at the URL provided by Replit

### Option 2: Running Locally

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/pumpflux.git
   cd pumpflux
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up the database:

   ```
   npm run db:push
   ```

4. Seed the database with initial templates and plans (optional):

   ```
   npm run seed:templates
   npm run seed:plans
   ```

5. Start the development server:

   ```
   npm run dev
   ```

6. Visit `http://localhost:5000` in your browser

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - UI components
  - `/src/pages` - Application pages
  - `/src/store` - State management
  - `/src/hooks` - Custom React hooks
  - `/src/assets` - Static assets
  - `/src/monitoring` - Workflow monitoring components
  - `/src/optimization` - Performance optimization tools

- `/server` - Backend Express server
  - `/routes` - API routes
  - `/db` - Database connection
  - `/migrations` - Database migrations
  - `/services` - Core business logic
    - `workflowExecutor.ts` - Workflow execution engine
    - `workflowLogger.ts` - Enhanced logging system
    - `retryManager.ts` - Retry handling service
    - `errorHandler.ts` - Error management system
  - `/monitoring` - Monitoring and analytics
  - `/optimization` - Workflow optimization logic

- `/shared` - Shared code and types
  - `/schema.ts` - Database schema definitions
  - `/types` - TypeScript type definitions
  - `/constants` - Shared constants
  - `/utils` - Utility functions

## Development Workflow

1. **Start the server**: The workflow named 'Start application' runs `npm run dev` which starts both the frontend and backend servers
2. **Create workflows**: Navigate to the workflow builder to create new automation flows
3. **Use templates**: Browse and use predefined templates from the Templates page
4. **Monitor & Optimize**:
   - Track real-time performance in the Monitoring dashboard
   - Review error trends and execution metrics
   - Apply suggested optimizations to improve workflow efficiency
   - Monitor the impact of changes on workflow performance

### Error Handling Development

When developing new nodes or workflows:

1. **Error Classification**: Use the `ERROR_CATEGORIES` enum to properly categorize errors
2. **Retry Configuration**: Configure retry strategies using the RetryManager service
3. **Monitoring Integration**: Implement proper logging using WorkflowLogger
4. **Testing**: Use the built-in error simulation tools for testing error scenarios

### Performance Optimization

To optimize workflow performance:

1. **Analysis**: Use the `/api/workflows/{id}/optimization-suggestions` endpoint to get recommendations
2. **Implementation**: Apply optimizations through the `/api/workflows/{id}/optimize` endpoint
3. **Validation**: Monitor the impact through the health monitoring dashboard
4. **Refinement**: Fine-tune optimizations based on performance metrics

## API Documentation

API documentation is available at `/api/docs` when the server is running. Key endpoints include:

### Workflow Management
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create a new workflow
- `PUT /api/workflows/{id}` - Update a workflow
- `DELETE /api/workflows/{id}` - Delete a workflow

### Monitoring & Analytics
- `GET /api/monitoring/errors` - Get error statistics and trends
- `GET /api/monitoring/workflows/{userId}` - Get workflow monitoring stats
- `GET /api/health-monitoring-data` - Get comprehensive health data

### Optimization
- `GET /api/workflows/{id}/optimization-suggestions` - Get optimization recommendations
- `POST /api/workflows/{id}/optimize` - Apply optimization strategies

### Error Management
- `GET /api/workflows/{id}/errors` - Get workflow error history
- `POST /api/workflows/{id}/retry` - Retry failed workflow executions

Refer to the Swagger documentation at `/api/docs` for complete API specifications and request/response schemas.

## Authentication

> **Authentication has been removed for local and development use.**
>
> The application now runs without authentication or login. All authentication and session logic has been removed from both backend and frontend. You can access all features directly after starting the server.

## License

[MIT License](LICENSE)
