import React, { Component, ErrorInfo, ReactNode } from 'react';

// Props interface defining the component's input properties
interface Props {
  children: ReactNode;      // The child components to be wrapped by the error boundary
  fallback?: ReactNode;     // Optional custom fallback UI to show when an error occurs
}

// State interface defining the component's internal state
interface State {
  hasError: boolean;        // Flag indicating if an error has occurred
  error: Error | null;      // The error object that was caught
}

/**
 * ErrorBoundary Component
 * 
 * This is a class component that implements React's error boundary functionality.
 * It catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component<Props, State> {
  // Initialize the component's state
  public state: State = {
    hasError: false,
    error: null
  };

  /**
   * Static lifecycle method that is called when an error is thrown in a descendant component.
   * It receives the error that was thrown and returns a value to update state.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method that is called after an error has been thrown in a descendant component.
   * It receives the error that was thrown and an error info object containing component stack trace.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  /**
   * Render method that determines what to display based on error state
   */
  public render() {
    if (this.state.hasError) {
      // If there's an error, show either the custom fallback UI or the default error UI
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {/* Button to reset the error state and try again */}
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    // If there's no error, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
