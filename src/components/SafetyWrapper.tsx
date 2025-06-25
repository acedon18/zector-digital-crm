// Safety wrapper to catch any substring errors
import React, { Component, ReactNode } from 'react';

interface SafetyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SafetyWrapperState {
  hasError: boolean;
  error?: Error;
}

export class SafetyWrapper extends Component<SafetyWrapperProps, SafetyWrapperState> {
  constructor(props: SafetyWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafetyWrapperState {
    console.error('SafetyWrapper caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SafetyWrapper error details:', error, errorInfo);
    
    // Check if it's a substring error specifically
    if (error.message?.includes('substring') || error.message?.includes('undefined')) {
      console.error('🚨 SUBSTRING ERROR CAUGHT by SafetyWrapper:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-medium">Component Error</h3>
          <p className="text-red-600 text-sm mt-1">
            A temporary error occurred. Please refresh the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafetyWrapper;
