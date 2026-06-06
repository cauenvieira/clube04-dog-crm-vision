import { useCallback, useEffect, useState } from "react";
import { addAudit } from "./audit-store";
import type { Papel } from "./auth-store";

export interface OperationalConfig {
  unidade: {
    nome: string;
    cidade: string;
    bairro: string;
    whatsappPrincipal: string;
    horarioSemana: string;
    horarioSabado: string;
    diasAtendimento: string[];
  };
  origens: string[];
  tentativas: {
    limiteSemResposta: number;
    vencidoRecenteDias: number;
    backlogDias: number;
    enviarParaLiderancaNoLimite: boolean;
    permitirProximoContatoSemData: boolean;
  };
  motivos: {
    perda: string[];
    desqualificacao: string[];
    lideranca: string[];
    nutricao: string[];
    prazo: string[];
  };
  mensagens: {
    primeiroContato: string;
    followUp: string;
    semResposta: string;
    ultimaTentativa: string;
    confirmacaoAgendamento: string;
  };
}

export const DEFAULT_CONFIG: OperationalConfig = {
  unidade: {
    nome: "Clube04 Mogi das Cruzes",
    cidade: "Mogi das Cruzes",
    bairro: "Vila Mogilar",
    whatsappPrincipal: "(11) 99999-9999",
    horarioSemana: "terça a sexta, 09h às 19h",
    horarioSabado: "sábado, 08h às 17h",
    diasAtendimento: ["terça", "quarta", "quinta", "sexta", "sábado"],
  },
  origens: [
    "Meta Ads",
    "WhatsApp",
    "Instagram orgânico",
    "Facebook",
    "Google",
    "Indicação",
    "Fachada",
    "Evento/ação local",
    "Cadastro manual",
    "Outro",
  ],
  tentativas: {
    limiteSemResposta: 12,
    vencidoRecenteDias: 7,
    backlogDias: 7,
    enviarParaLiderancaNoLimite: true,
    permitirProximoContatoSemData: false,
  },
  motivos: {
    perda: ["Preço", "Localização", "Fechou em outro lugar", "Sem horário compatível", "Sem interesse agora", "Não respondeu após tentativas", "Outro"],
    desqualificacao: ["Número inválido", "Duplicado", "Fora da área", "Precisa de táxi dog", "Serviço não atendido pela unidade", "Perfil não aderente", "Sem interesse real", "Outro"],
    lideranca: ["Tentativas excedidas", "Caso sensível", "Reclamação/problema", "Conflito de dados", "Telefone duplicado com nomes diferentes", "Dado impossível de classificar", "Outro"],
    nutricao: ["Ainda está avaliando", "Sem urgência", "Quer receber novidades", "Pode converter em campanha futura", "Aguardar campanha específica", "Outro"],
    prazo: ["Tutor pediu retorno nessa data", "Aguardando decisão da família", "Aguardando disponibilidade financeira", "Aguardando agenda do tutor", "Lead ainda está avaliando", "Outro"],
  },
  mensagens: {
    primeiroContato: "Oi! Tudo bem? Sou do Clube04 Mogi. Me conta o nome do seu doguinho, raça/peso aproximado e qual cuidado você está buscando hoje?",
    followUp: "Oi! Passando para retomar o atendimento do seu doguinho. Conseguiu avaliar a melhor data para o banho no clubinho?",
    semResposta: "Oi! Tentei falar com você sobre o atendimento do seu doguinho. Quando puder, me chama por aqui que eu te ajudo a escolher o melhor horário.",
    ultimaTentativa: "Oi! Vou deixar seu atendimento pausado por enquanto. Quando quiser retomar o cuidado do seu doguinho no Clube04, é só me chamar por aqui.",
    confirmacaoAgendamento: "Agendamento registrado. No dia, pedimos que o doguinho venha com tempo tranquilo para a experiência completa do banho relaxante.",
  },
};

const CONFIG_KEY = "clube04_operational_config_v1";
let cached: OperationalConfig | null = null;
let listeners = new Set<() => void>();

function emit() { listeners.forEach((listener) => listener()); }

export function loadConfig(): OperationalConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    cached = raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    cached = DEFAULT_CONFIG;
  }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cached));
  return cached;
}

export function saveConfig(config: OperationalConfig, actorName = "Sistema", actorRole: Papel | "sistema" = "sistema") {
  const before = loadConfig();
  cached = config;
  if (typeof window !== "undefined") localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  addAudit({ action: "config_alterada", actorName, actorRole, summary: "Configurações operacionais alteradas", before, after: config });
  emit();
}

export function useOperationalConfig() {
  const [config, setConfigState] = useState<OperationalConfig>(() => loadConfig());
  useEffect(() => {
    const listener = () => setConfigState({ ...loadConfig() });
    listeners.add(listener);
    listener();
    return () => { listeners.delete(listener); };
  }, []);

  const setConfig = useCallback((next: OperationalConfig, actorName?: string, actorRole?: Papel | "sistema") => {
    saveConfig(next, actorName, actorRole);
  }, []);

  return { config, setConfig };
}

export function resetConfigMock() {
  cached = DEFAULT_CONFIG;
  if (typeof window !== "undefined") localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  emit();
}
