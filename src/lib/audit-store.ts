import type { Papel } from "./auth-store";

export type AuditAction =
  | "login"
  | "logout"
  | "lead_criado"
  | "lead_editado"
  | "interacao_registrada"
  | "sem_resposta"
  | "lead_reatribuido"
  | "config_alterada"
  | "usuario_alterado"
  | "dados_reiniciados";

export interface AuditEntry {
  id: string;
  at: string;
  action: AuditAction;
  actorName: string;
  actorRole: Papel | "sistema";
  leadId?: string;
  leadName?: string;
  summary: string;
  before?: unknown;
  after?: unknown;
}

const AUDIT_KEY = "clube04_operational_audit_v1";
let cached: AuditEntry[] | null = null;
let listeners = new Set<() => void>();

function emit() { listeners.forEach((listener) => listener()); }

export function loadAudit(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    cached = raw ? JSON.parse(raw) : [];
  } catch {
    cached = [];
  }
  return cached ?? [];
}

export function addAudit(entry: Omit<AuditEntry, "id" | "at">) {
  const next: AuditEntry = {
    id: `A${Date.now()}${Math.floor(Math.random() * 1000)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  cached = [next, ...loadAudit()].slice(0, 500);
  if (typeof window !== "undefined") localStorage.setItem(AUDIT_KEY, JSON.stringify(cached));
  emit();
}

export function useAudit() {
  const React = require("react") as typeof import("react");
  const [entries, setEntries] = React.useState<AuditEntry[]>(() => loadAudit());
  React.useEffect(() => {
    const listener = () => setEntries([...loadAudit()]);
    listeners.add(listener);
    listener();
    return () => { listeners.delete(listener); };
  }, []);
  return { entries };
}

export function resetAudit() {
  cached = [];
  if (typeof window !== "undefined") localStorage.setItem(AUDIT_KEY, JSON.stringify([]));
  emit();
}
