import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, MockBadge } from "@/components/layout/AppLayout";
import { useLeads } from "@/lib/leads-store";
import { KpiCard } from "@/components/KpiCard";
import { LeadDrawer } from "@/components/LeadDrawer";
import { StatusChip } from "@/components/StatusChip";
import { ShieldAlert, AlertTriangle, UserX, RotateCw, HeartHandshake, CheckCircle2 } from "lucide-react";
import { type Lead, formatDate, formatDateTime } from "@/lib/mock-data";

export const Route = createFileRoute("/analise")({
  head: () => ({ meta: [{ title: "Análise da Liderança · CRM Clube04" }] }),
  component: AnaliseLideranca,
});

function AnaliseLideranca() {
  const { leads } = useLeads();
  const [selected, setSelected] = useState<Lead | null>(null);

  const casos = useMemo(() => leads.filter((l) => l.status === "analise_lideranca"), [leads]);
  const resumo = useMemo(() => ({
    aguardando: casos.length,
    falha: casos.filter((c) => c.motivoAnalise === "Possível falha de processo").length,
    desq: casos.filter((c) => c.motivoAnalise === "Lead desqualificado").length,
    tent: casos.filter((c) => c.motivoAnalise === "Tentativas excedidas").length,
    sensiveis: casos.filter((c) => c.motivoAnalise === "Caso sensível").length,
    resolvidos: 0,
  }), [casos]);

  return (
    <>
      <PageHeader title="Análise da Liderança" subtitle="Casos que exigem revisão, decisão ou correção de rota." badge={<MockBadge />} />
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={<ShieldAlert className="w-4 h-4" />} label="Aguardando análise" value={resumo.aguardando} accent="text-primary" />
          <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Possível falha" value={resumo.falha} accent="text-destructive" />
          <KpiCard icon={<UserX className="w-4 h-4" />} label="Desqualificado" value={resumo.desq} accent="text-muted-foreground" />
          <KpiCard icon={<RotateCw className="w-4 h-4" />} label="Tentativas excedidas" value={resumo.tent} accent="text-amber-600" />
          <KpiCard icon={<HeartHandshake className="w-4 h-4" />} label="Casos sensíveis" value={resumo.sensiveis} accent="text-purple-700" />
          <KpiCard icon={<CheckCircle2 className="w-4 h-4" />} label="Resolvidos hoje" value={resumo.resolvidos} accent="text-emerald-600" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {casos.length === 0 && (
            <div className="md:col-span-2 p-8 text-center text-muted-foreground rounded-xl border border-dashed border-border">
              Nenhum caso aguardando análise.
            </div>
          )}
          {casos.map((l) => (
            <div key={l.id} onClick={() => setSelected(l)}
              className="cursor-pointer rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">{l.tutor} <span className="text-sm text-muted-foreground font-normal">· 🐾 {l.pet}</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">{l.telefone} · {l.origem} · Atendente {l.atendente}</div>
                </div>
                <StatusChip status={l.status} />
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium">Motivo:</span> {l.motivoAnalise ?? "—"}
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Entrada na análise: <span className="text-foreground">{formatDateTime(l.dataUltimoContato)}</span></div>
                <div>Tentativas: <span className="text-foreground">{l.tentativas}/12</span></div>
                <div className="col-span-2 truncate">Última obs: <span className="text-foreground">{l.observacao}</span></div>
              </div>
              <div className="mt-3 text-[11px] text-primary font-medium">Clique para abrir o painel de decisão →</div>
            </div>
          ))}
        </div>
      </div>

      <LeadDrawer lead={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}
