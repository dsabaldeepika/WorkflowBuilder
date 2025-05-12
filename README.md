# PumpFlux - Workflow Builder Platform

PumpFlux is a powerful drag-and-drop workflow builder that enables users to create complex integrations and automation flows with an intuitive, node-based interface. It's designed to simplify complex workflow creation through interactive and intelligent design tools.

![PumpFlux Workflow Builder](https://example.com/workflow-builder-screenshot.png)

## Features

- TypeScript-based frontend and backend
- Swagger-documented API endpoints
- Comprehensive platform integrations (Facebook, HubSpot, Slack, AI services)
- Advanced node-based workflow design with interactive UI elements
- Modular and extensible workflow configuration system
- Customizable node color-coding for visual organization
- Workflow state change animations for enhanced user experience
- Subscription management with tiered pricing plans

## Getting Started

### Prerequisites

- Node.js v18+ and npm (or yarn)
- PostgreSQL database
- Stripe account (for subscription features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pumpflux.git
   cd pumpflux
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env` file):
   ```
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/pumpflux
   
   # Session
   SESSION_SECRET=your_random_session_secret
   
   # Stripe (for subscription features)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Seed the database with initial data (optional):
   ```bash
   npm run seed-templates
   npm run seed-subscription-plans
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Access the application:
   ```
   Main application: http://localhost:5000
   Standalone workflow builder: http://localhost:3000
   ```

## Standalone Workflow Builder

We've included a standalone workflow builder that doesn't require any database or authentication setup. This is perfect for quick testing and development.

To start the standalone builder:

```bash
node quick-server.js
```

Then visit `http://localhost:3000` in your browser.

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable React components
  - `/src/hooks` - Custom React hooks
  - `/src/pages` - Page components
  - `/src/store` - State management using Zustand
  - `/src/types` - TypeScript type definitions
  
- `/server` - Express backend
  - `/routes` - API route handlers
  - `/auth` - Authentication middleware
  - `/db` - Database connection and models
  - `/services` - Business logic

- `/shared` - Shared code between client and server
  - `schema.ts` - Database schema using Drizzle ORM

## Authentication

The application supports multiple authentication methods:

1. **Replit Auth** - For deployment on Replit
2. **Local Authentication** - Username/password login
3. **Auth Bypass** - For local development and testing

For local development, the authentication is bypassed to make it easier to work with the application.

## Troubleshooting

Based on our experience, here are some common issues and their solutions:

### Authentication Issues

**Problem**: Authentication errors or login loop redirects.

**Solutions**:
- Make sure SESSION_SECRET is set in your environment variables
- Check if the database connection is working properly
- If running on Replit, ensure REPLIT_DOMAINS environment variable is set
- For local development, you can use the authentication bypass in server/routes.ts

### Database Connection Problems

**Problem**: Database connection fails or migrations don't apply.

**Solutions**:
- Verify your DATABASE_URL is correct
- Make sure PostgreSQL is running
- Run `npm run db:push` to apply the latest migrations
- Check if the database exists and your user has sufficient permissions

### Stripe Integration Errors

**Problem**: "Failed to load Stripe.js" or other Stripe-related errors.

**Solutions**:
- Ensure both STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY are set correctly
- For development, you can use the Stripe test keys
- If you don't need the subscription features, you can disable Stripe by modifying the imports in AccountBillingPage and CheckoutPage components

### Server Startup Failures

**Problem**: Server fails to start or crashes immediately.

**Solutions**:
- Check for TypeScript errors: `npm run typecheck`
- Look for duplicate route declarations in server/routes.ts
- Ensure all required environment variables are set
- Check for port conflicts (default is 5000)

### Frontend Loading Issues

**Problem**: Frontend loads but with errors or missing features.

**Solutions**:
- Clear your browser cache
- Check browser console for specific errors
- Verify that all dependencies are correctly installed
- Make sure the API endpoints return the expected data

### Standalone Workflow Builder Issues

**Problem**: Standalone builder doesn't load or functions improperly.

**Solutions**:
- Make sure port 3000 is available and not in use
- Check that the static files in direct-launch.html are accessible
- Verify that Font Awesome CDN is accessible for icons
- If nodes don't appear when dragging, check browser console for JavaScript errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Flow - For the workflow diagram visualization
- Shadcn UI - For the component library
- Drizzle ORM - For the database ORM
- Stripe - For subscription management
- Replit - For hosting and authentication