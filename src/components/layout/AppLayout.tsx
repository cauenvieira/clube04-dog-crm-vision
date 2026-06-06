import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { useAuth } from "@/lib/auth-store";

export function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <LoginScreen />;
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({
  title, subtitle, actions, badge,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <header className="px-8 pt-7 pb-5 border-b border-border bg-background sticky top-0 z-30 backdrop-blur-md bg-background/85">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function MockBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-warning/15 text-amber-700 border border-warning/30">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
      Protótipo operacional
    </span>
  );
}

export function FuturoBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 border border-sky-500/20">
      Futuro
    </span>
  );
}
