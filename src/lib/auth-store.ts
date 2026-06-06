import { useCallback, useEffect, useMemo, useState } from "react";

export type Papel = "administrador" | "lider" | "atendente";

export type Permissao =
  | "leads:ver"
  | "leads:criar"
  | "leads:editar"
  | "leads:registrar_interacao"
  | "leads:concluir"
  | "leads:reatribuir"
  | "lideranca:revisar"
  | "base:exportar"
  | "mensagens:gerenciar"
  | "config:ver"
  | "config:editar"
  | "usuarios:gerenciar"
  | "auditoria:ver";

export interface AppUser {
  id: string;
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
  ativo: boolean;
  apareceComoAtendente: boolean;
  permissoesExtra: Permissao[];
  permissoesNegadas: Permissao[];
}

export const PAPEL_LABEL: Record<Papel, string> = {
  administrador: "Administrador",
  lider: "Líder",
  atendente: "Atendente",
};

export const PERMISSAO_LABEL: Record<Permissao, string> = {
  "leads:ver": "Ver leads",
  "leads:criar": "Criar lead",
  "leads:editar": "Editar dados do lead",
  "leads:registrar_interacao": "Registrar interação",
  "leads:concluir": "Concluir lead",
  "leads:reatribuir": "Reatribuir responsável",
  "lideranca:revisar": "Tratar análise da liderança",
  "base:exportar": "Exportar base",
  "mensagens:gerenciar": "Gerenciar modelos de mensagem",
  "config:ver": "Ver configurações",
  "config:editar": "Editar configurações",
  "usuarios:gerenciar": "Gerenciar usuários e permissões",
  "auditoria:ver": "Ver auditoria",
};

export const PERMISSOES: Permissao[] = Object.keys(PERMISSAO_LABEL) as Permissao[];

const PAPEL_PERMISSOES: Record<Papel, Permissao[]> = {
  atendente: [
    "leads:ver",
    "leads:criar",
    "leads:editar",
    "leads:registrar_interacao",
  ],
  lider: [
    "leads:ver",
    "leads:criar",
    "leads:editar",
    "leads:registrar_interacao",
    "leads:concluir",
    "leads:reatribuir",
    "lideranca:revisar",
    "base:exportar",
    "mensagens:gerenciar",
    "config:ver",
  ],
  administrador: [
    "leads:ver",
    "leads:criar",
    "leads:editar",
    "leads:registrar_interacao",
    "leads:concluir",
    "leads:reatribuir",
    "lideranca:revisar",
    "base:exportar",
    "mensagens:gerenciar",
    "config:ver",
    "config:editar",
    "usuarios:gerenciar",
    "auditoria:ver",
  ],
};

const DEFAULT_USERS: AppUser[] = [
  {
    id: "u-admin",
    nome: "Cauê",
    email: "admin@clube04.local",
    senha: "123456",
    papel: "administrador",
    ativo: true,
    apareceComoAtendente: true,
    permissoesExtra: [],
    permissoesNegadas: [],
  },
  {
    id: "u-lider",
    nome: "Etiene",
    email: "lider@clube04.local",
    senha: "123456",
    papel: "lider",
    ativo: true,
    apareceComoAtendente: true,
    permissoesExtra: [],
    permissoesNegadas: [],
  },
  {
    id: "u-atendente",
    nome: "Atendente WhatsApp",
    email: "atendente@clube04.local",
    senha: "123456",
    papel: "atendente",
    ativo: true,
    apareceComoAtendente: true,
    permissoesExtra: [],
    permissoesNegadas: [],
  },
];

const USERS_KEY = "clube04_operational_users_v1";
const SESSION_KEY = "clube04_operational_session_v1";

let usersCache: AppUser[] | null = null;
let sessionUserId: string | null = null;
let listeners = new Set<() => void>();

function emit() { listeners.forEach((listener) => listener()); }

function safeParseUsers(raw: string | null): AppUser[] | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as AppUser[]; } catch { return null; }
}

export function loadUsers(): AppUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  if (usersCache) return usersCache;
  const stored = safeParseUsers(localStorage.getItem(USERS_KEY));
  usersCache = stored?.length ? stored : DEFAULT_USERS;
  localStorage.setItem(USERS_KEY, JSON.stringify(usersCache));
  sessionUserId = localStorage.getItem(SESSION_KEY);
  return usersCache;
}

export function saveUsers(users: AppUser[]) {
  usersCache = users;
  if (typeof window !== "undefined") localStorage.setItem(USERS_KEY, JSON.stringify(users));
  emit();
}

export function getEffectivePermissions(user: AppUser): Permissao[] {
  const base = new Set<Permissao>(PAPEL_PERMISSOES[user.papel]);
  user.permissoesExtra.forEach((p) => base.add(p));
  user.permissoesNegadas.forEach((p) => base.delete(p));
  return Array.from(base);
}

function getCurrentUser(): AppUser | null {
  const users = loadUsers();
  if (typeof window !== "undefined") sessionUserId = localStorage.getItem(SESSION_KEY);
  return users.find((u) => u.id === sessionUserId && u.ativo) ?? null;
}

export function useAuth() {
  const [users, setUsersState] = useState<AppUser[]>(() => loadUsers());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());

  useEffect(() => {
    const listener = () => {
      setUsersState([...(usersCache ?? loadUsers())]);
      setCurrentUser(getCurrentUser());
    };
    listeners.add(listener);
    listener();
    return () => { listeners.delete(listener); };
  }, []);

  const login = useCallback((email: string, senha: string): { ok: boolean; message?: string } => {
    const user = loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.senha !== senha) return { ok: false, message: "Usuário ou senha inválidos." };
    if (!user.ativo) return { ok: false, message: "Usuário inativo." };
    sessionUserId = user.id;
    if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, user.id);
    emit();
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    sessionUserId = null;
    if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
    emit();
  }, []);

  const can = useCallback((permissao: Permissao) => {
    const user = getCurrentUser();
    if (!user) return false;
    return getEffectivePermissions(user).includes(permissao);
  }, [currentUser?.id, currentUser?.papel, currentUser?.permissoesExtra, currentUser?.permissoesNegadas]);

  const updateUser = useCallback((userId: string, updater: (user: AppUser) => AppUser) => {
    saveUsers(loadUsers().map((u) => u.id === userId ? updater(u) : u));
  }, []);

  const atendentesAtivos = useMemo(
    () => users.filter((u) => u.ativo && u.apareceComoAtendente).map((u) => u.nome),
    [users],
  );

  return { users, currentUser, login, logout, can, updateUser, atendentesAtivos };
}

export function resetAuthMock() {
  usersCache = DEFAULT_USERS;
  sessionUserId = null;
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    localStorage.removeItem(SESSION_KEY);
  }
  emit();
}
