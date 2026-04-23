import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./app/App.tsx";
import { AuthProvider } from "./app/auth/AuthContext.tsx";
import { SupabaseEnvGuard } from "./app/auth/SupabaseEnvGuard.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <SupabaseEnvGuard>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SupabaseEnvGuard>
    <Toaster richColors position="top-center" />
  </>,
);
