import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function SupabaseEnvGuard({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured()) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground px-6">
      <h1 className="text-xl font-semibold text-center">Configure Supabase</h1>
      <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
        This app only reads credentials from environment variables (not from source
        code). Copy{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.example</code>{" "}
        to{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code>
        , then set{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          VITE_SUPABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          VITE_SUPABASE_ANON_KEY
        </code>{" "}
        from your project&apos;s{" "}
        <strong>Project Settings → API</strong> in the Supabase dashboard. Restart{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run dev</code>{" "}
        after saving.
      </p>
    </div>
  );
}
