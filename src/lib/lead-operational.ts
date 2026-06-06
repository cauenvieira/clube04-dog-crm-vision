import { daysDiff, type Lead, type ResultadoInteracao, type StatusOperacional } from "./mock-data";
import { loadConfig } from "./operational-config";

export type ProximaAcao =
  | "novo_lead"
  | "retomar_atendimento"
  | "fazer_follow_up"
  | "aguardando_resposta"
  | "registrar_agendamento"
  | "revisar_lideranca"
  | "sem_proxima_acao";

export const PROXIMA_ACAO_LABEL: Record<ProximaAcao, string> = {
  novo_lead: "Novo lead",
  retomar_atendimento: "Retomar atendimento",
  fazer_follow_up: "Fazer follow-up",
  aguardando_resposta: "Aguardando resposta",
  registrar_agendamento: "Registrar agendamento",
  revisar_lideranca: "Revisar na liderança",
  sem_proxima_acao: "Sem próxima ação",
};

export const PROXIMA_ACAO_COLORS: Record<ProximaAcao, string> = {
  novo_lead: "bg-info/10 text-info border-info/20",
  retomar_atendimento: "bg-primary/10 text-primary border-primary/20",
  fazer_follow_up: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  aguardando_resposta: "bg-warning/15 text-amber-700 border-warning/30",
  registrar_agendamento: "bg-success/15 text-emerald-700 border-success/25",
  revisar_lideranca: "bg-destructive/10 text-destructive border-destructive/20",
  sem_proxima_acao: "bg-muted text-muted-foreground border-border",
};

export const RESULTADOS_TERMINAIS: ResultadoInteracao[] = ["convertido", "perdido", "desqualificado", "nutricao"];

export function isStatusTerminal(status: StatusOperacional): boolean {
  return ["convertido", "perdido", "desqualificado", "nutricao"].includes(status);
}

export function getLeadProximaAcao(lead: Lead): ProximaAcao {
  const explicit = (lead as Lead & { proximaAcao?: ProximaAcao }).proximaAcao;
  if (explicit) return explicit;
  if (lead.status === "analise_lideranca") return "revisar_lideranca";
  if (isStatusTerminal(lead.status)) return "sem_proxima_acao";
  if (lead.status === "agendado") return "registrar_agendamento";
  if (lead.status === "novo") return "novo_lead";
  if (!lead.dataProximoContato) return "retomar_atendimento";
  const diff = daysDiff(lead.dataProximoContato);
  if (diff !== null && diff < 0) return "retomar_atendimento";
  if (diff === 0) return lead.status === "aguardando_resposta" ? "aguardando_resposta" : "fazer_follow_up";
  return lead.status === "aguardando_resposta" ? "aguardando_resposta" : "fazer_follow_up";
}

export function classifyUrgencia(lead: Lead): { label: string; tipo: "hoje" | "vencido" | "backlog" | "sem_data" | "futuro" | "sem_acao" } {
  const acao = getLeadProximaAcao(lead);
  if (acao === "sem_proxima_acao") return { label: "Sem ação", tipo: "sem_acao" };
  if (!lead.dataProximoContato) return { label: "Sem data", tipo: "sem_data" };
  const config = loadConfig();
  const diff = daysDiff(lead.dataProximoContato);
  if (diff === 0) return { label: "Hoje", tipo: "hoje" };
  if (diff !== null && diff < -config.tentativas.backlogDias) return { label: "Backlog", tipo: "backlog" };
  if (diff !== null && diff < 0) return { label: `Vencido ${Math.abs(diff)}d`, tipo: "vencido" };
  if (diff !== null && diff > 0) return { label: `Em ${diff}d`, tipo: "futuro" };
  return { label: "Sem data", tipo: "sem_data" };
}

export function nextActionForResultado(resultado: ResultadoInteracao, tentativas: number): ProximaAcao {
  const config = loadConfig();
  if (resultado === "sem_resposta") {
    return tentativas >= config.tentativas.limiteSemResposta && config.tentativas.enviarParaLiderancaNoLimite
      ? "revisar_lideranca"
      : "aguardando_resposta";
  }
  if (resultado === "continuar") return "fazer_follow_up";
  if (resultado === "agendamento") return "registrar_agendamento";
  if (resultado === "analise_lideranca") return "revisar_lideranca";
  return "sem_proxima_acao";
}

export function resultadoParaStatusOperacional(r: ResultadoInteracao, prev: StatusOperacional, tentativas: number): StatusOperacional {
  const config = loadConfig();
  switch (r) {
    case "continuar": return "em_atendimento";
    case "agendamento": return "agendado";
    case "sem_resposta": return tentativas >= config.tentativas.limiteSemResposta && config.tentativas.enviarParaLiderancaNoLimite ? "analise_lideranca" : "aguardando_resposta";
    case "convertido": return "convertido";
    case "analise_lideranca": return "analise_lideranca";
    case "perdido": return "perdido";
    case "desqualificado": return "desqualificado";
    case "nutricao": return "nutricao";
    default: return prev;
  }
}

export function calcularProximaTentativa(tentativas: number): string {
  const dias = Math.min(Math.max(tentativas, 1), 5);
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}
