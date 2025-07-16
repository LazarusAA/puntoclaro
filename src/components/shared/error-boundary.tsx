'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      // Default fallback UI
      return (
        <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">
              ¡Algo salió mal!
            </CardTitle>
            <CardDescription>
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 p-4 rounded text-sm">
                <summary className="cursor-pointer font-medium">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.message}
                  {this.state.error.stack && '\n\n' + this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleRetry} variant="default">
                Intentar de nuevo
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Recargar página
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export function DiagnosticErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Additional logging for diagnostic-specific errors
        console.error('Diagnostic Error:', {
          error: error.message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }}
      fallback={({ error, retry }) => (
        <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">
              Error en el diagnóstico
            </CardTitle>
            <CardDescription>
              No pudimos cargar el diagnóstico correctamente. Esto puede deberse a problemas de conexión o datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex gap-2 justify-center">
              <Button onClick={retry} variant="default">
                Reintentar diagnóstico
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                variant="outline"
              >
                Ir al dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundary>
  );
} 