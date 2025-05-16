# PumpFlux - Workflow Automation Platform

PumpFlux is a powerful drag-and-drop workflow builder that enables users to create, monitor, and optimize complex integrations and automation flows with an intuitive, node-based interface. It's similar to popular automation tools like n8n, Make.com, Microsoft Power Automate, and Tray.io.

![PumpFlux](client/src/assets/templates/workflow-template-placeholder.svg)

## Features

- Interactive workflow canvas with drag-and-drop interface
- Predefined templates for common workflow scenarios
- Comprehensive health monitoring for all workflows
- Integration with major services (Facebook, HubSpot, Slack, etc.)
- Workflow execution tracking and performance optimization
- **No authentication required for local development**

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

- `/server` - Backend Express server

  - `/routes` - API routes
  - `/db` - Database connection
  - `/migrations` - Database migrations

- `/shared` - Shared code and types
  - `/schema.ts` - Database schema definitions

## Development Workflow

1. **Start the server**: The workflow named 'Start application' runs `npm run dev` which starts both the frontend and backend servers
2. **Create workflows**: Navigate to the workflow builder to create new automation flows
3. **Use templates**: Browse and use predefined templates from the Templates page
4. **Monitor workflows**: Track performance and errors in the Monitoring dashboard

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Authentication

> **Authentication has been removed for local and development use.**
>
> The application now runs without authentication or login. All authentication and session logic has been removed from both backend and frontend. You can access all features directly after starting the server.

## License

[MIT License](LICENSE)
