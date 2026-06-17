"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-xl p-8 shadow-lg">
            <div className="flex justify-center">
              <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                <AlertTriangle className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We encountered an unexpected error on this page. Please try reloading or head back to safety.
            </p>
            {this.state.error && (
              <pre className="p-4 bg-muted text-muted-foreground text-xs rounded-lg text-left overflow-x-auto max-h-40 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full sm:w-auto animate-none">
                Reload Page
              </Button>
              <Button onClick={this.handleReset} className="w-full sm:w-auto animate-none">
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
