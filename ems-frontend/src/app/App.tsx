import { BrowserRouter } from "react-router-dom";
import { Providers } from "./providers";
import { AppRoutes } from "@/routes";
import { ErrorBoundary } from "@/components/feedback/error-boundary";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Providers>
          <AppRoutes />
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
