import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Something went wrong</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">{this.state.error?.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false, error: null })}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
