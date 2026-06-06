import { MessageCircle, PhoneOff, Clock, AlertTriangle } from "lucide-react";
import { type Lead, formatDate, RESULTADO_LABEL } from "@/lib/mock-data";
import { StatusChip } from "./StatusChip";
import { ProximaAcaoChip } from "./ProximaAcaoChip";
import { toast } from "sonner";
import { useLeads } from "@/lib/leads-store";
import { useAuth } from "@/lib/auth-store";
import { addAudit } from "@/lib/audit-store";
import { calcularProximaTentativa, classifyUrgencia, getLeadProximaAcao, nextActionForResultado, resultadoParaStatusOperacional } from "@/lib/lead-operational";
import { loadConfig } from "@/lib/operational-config";

const URGENCY_COLOR: Record<string, string> = {
  sem_data: "bg-amber-100 text-amber-800 border-amber-200",
  hoje: "bg-primary/15 text-primary border-primary/30",
  vencido: "bg-destructive/10 text-destructive border-destructive/25",
  backlog: "bg-destructive/15 text-destructive border-destructive/30",
  futuro: "bg-muted text-muted-foreground border-border",
  sem_acao: "bg-muted text-muted-foreground border-border",
};

export function LeadCard({ lead, onOpen, compact = false }: { lead: Lead; onOpen: (l: Lead) => void; compact?: boolean }) {
  const { update } = useLeads();
  const { currentUser, can } = useAuth();
  const urgencia = classifyUrgencia(lead);
  const proximaAcao = getLeadProximaAcao(lead);
  const limiteTentativas = loadConfig().tentativas.limiteSemResposta;

  const handleSemResposta = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!can("leads:registrar_interacao")) {
      toast.error("Seu perfil não pode registrar interação.");
      return;
    }
    if (!confirm("Registrar sem resposta e calcular a próxima tentativa?")) return;
    update((prev) => prev.map((l) => {
      if (l.id !== lead.id) return l;
      const novasTentativas = l.tentativas + 1;
      const statusAnterior = l.status;
      const acaoAnterior = getLeadProximaAcao(l);
      const finalStatus = resultadoParaStatusOperacional("sem_resposta", l.status, novasTentativas);
      const acaoNova = nextActionForResultado("sem_resposta", novasTentativas);
      const proxData = acaoNova === "revisar_lideranca" ? new Date().toISOString() : calcularProximaTentativa(novasTentativas);
      const atualizado: Lead = {
        ...l,
        tentativas: novasTentativas,
        status: finalStatus,
        proximaAcao: acaoNova,
        dataProximoContato: proxData,
        dataUltimoContato: new Date().toISOString(),
        ultimoResultado: "sem_resposta",
        motivoAnalise: acaoNova === "revisar_lideranca" ? "Tentativas excedidas" : l.motivoAnalise,
        historico: [{
          id: `${l.id}-h${l.historico.length+1}`,
          data: new Date().toISOString(),
          resultado: "sem_resposta",
          atendente: currentUser?.nome ?? l.atendente,
          statusAnterior,
          statusNovo: finalStatus,
          proximaAcaoAnterior: acaoAnterior,
          proximaAcaoNova: acaoNova,
          observacao: "Sem resposta — registrado via ação rápida",
        }, ...l.historico],
      };
      addAudit({
        action: "sem_resposta",
        actorName: currentUser?.nome ?? "Usuário local",
        actorRole: currentUser?.papel ?? "sistema",
        leadId: l.id,
        leadName: `${l.tutor} · ${l.pet}`,
        summary: `Sem resposta registrada (${novasTentativas}/${limiteTentativas})`,
        before: { status: statusAnterior, proximaAcao: acaoAnterior, tentativas: l.tentativas },
        after: { status: finalStatus, proximaAcao: acaoNova, tentativas: novasTentativas },
      });
      return atualizado;
    }));
    toast.success(`Sem resposta registrada (${lead.tentativas + 1}/${limiteTentativas})`);
  };

  const tel = lead.telefone.replace(/\D/g,"");

  return (
    <div
      onClick={() => onOpen(lead)}
      className="group cursor-pointer rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate">{lead.tutor}</div>
          <div className="text-xs text-muted-foreground truncate">🐾 {lead.pet} · {lead.telefone}</div>
        </div>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${URGENCY_COLOR[urgencia.tipo]}`}>
          {urgencia.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <ProximaAcaoChip acao={proximaAcao} />
        <StatusChip status={lead.status} />
      </div>

      {!compact && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-2.5">
          <span className="truncate">{lead.origem} · {lead.atendente}</span>
          <span className="flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            {lead.tentativas}/{limiteTentativas}
          </span>
        </div>
      )}

      {lead.ultimoResultado && !compact && (
        <div className="text-[11px] text-muted-foreground mb-2 truncate">
          <Clock className="w-3 h-3 inline mr-1" />
          {RESULTADO_LABEL[lead.ultimoResultado]} · {formatDate(lead.dataUltimoContato)}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
        <a
          href={`https://wa.me/55${tel}`} target="_blank" rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
        {can("leads:registrar_interacao") && (
          <button
            onClick={handleSemResposta}
            className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-md bg-muted hover:bg-amber-50 hover:text-amber-700 text-muted-foreground transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" /> Sem resposta
          </button>
        )}
      </div>
    </div>
  );
}
