# PumpFlux on Replit - Quick Guide

This guide provides specific instructions for running and troubleshooting PumpFlux on Replit.

## Running the Application

There are two ways to run the application on Replit:

### 1. Main Application (Port 5000)

This is the full-featured application with all capabilities including authentication, database storage, and Stripe integration.

To run it:
- Use the "Start application" workflow button in the Replit interface
- This starts the server with `npm run dev`

**Note:** The main application may have issues with Stripe and authentication in the Replit environment due to iframe restrictions.

### 2. Standalone Workflow Builder (Port 3000)

This is a simplified version that focuses solely on the workflow builder interface. It doesn't require authentication or database connection.

To run it:
- Open a Shell in Replit
- Run `node quick-server.js`
- Access it at `https://your-replit-url.replit.app:3000`

## Troubleshooting Replit-Specific Issues

### Authentication Problems

The application uses Replit Auth which requires proper configuration in the Replit environment. If you encounter authentication issues:

1. **Authentication loop or redirects:**
   - We've implemented an authentication bypass in the code to make development easier
   - The mock user has admin privileges and pro subscription tier

2. **iframe restrictions:**
   - Replit sometimes has issues with authentication in iframes
   - Use the direct URL to the application outside the Replit environment

### Stripe Integration Errors

If you see "Failed to load Stripe.js" errors:

1. Check that the Stripe keys are properly set in the Replit secrets:
   - VITE_STRIPE_PUBLIC_KEY (starts with pk_)
   - STRIPE_SECRET_KEY (starts with sk_)

2. If the errors persist, you can use the standalone workflow builder which doesn't require Stripe integration.

### Port Access

Replit only exposes the main port (5000) by default. To access the standalone server on port 3000:

1. **Option 1: Use forwarded ports**
   - In the Replit interface, go to "Ports" tab
   - If port 3000 is listed, click on it to access

2. **Option 2: Change the port**
   - Edit quick-server.js to use port 5000 instead of 3000
   - Stop the main application first using the workflow controls

### Database Issues

If you encounter database errors:

1. Make sure the PostgreSQL database is properly set up in Replit
2. Check that the DATABASE_URL secret is available and correct
3. Verify migrations have run successfully (look for "Migrations completed successfully" in logs)

## Using the Standalone Workflow Builder

The standalone builder provides the core workflow editing experience without the complexity of the full application. With it, you can:

1. Drag and drop nodes from the left sidebar
2. Connect nodes to create workflows
3. Configure node properties in the right panel
4. Test the drag/drop and connection functionality

## Screenshots and Demo

Access the standalone demo at: https://your-replit-url.replit.app:3000

![Standalone Workflow Builder](https://example.com/standalone-builder-screenshot.png)

## Getting Support

If you encounter issues not covered in this guide, please:

1. Check the main README.md file for general troubleshooting tips
2. Look at the server logs in the Replit console for specific error messages
3. Examine browser console logs for frontend errors