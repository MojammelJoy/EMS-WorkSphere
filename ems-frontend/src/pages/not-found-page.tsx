import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">
      <p className="text-8xl font-bold text-primary/20 select-none">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">The page you're looking for doesn't exist or you don't have permission to view it.</p>
      <Button className="mt-6" asChild>
        <Link to="/dashboard"><Home className="h-4 w-4" />Go to Dashboard</Link>
      </Button>
    </div>
  );
}
