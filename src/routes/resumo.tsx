import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, MockBadge } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeads } from "@/lib/leads-store";
import { KpiCard } from "@/components/KpiCard";
import { ATENDENTES } from "@/lib/mock-data";
import { Copy, Download, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/resumo")({
  head: () => ({ meta: [{ title: "Resumo Diário · CRM Clube04" }] }),
  component: Resumo,
});

function Resumo() {
  const { leads } = useLeads();
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  const novos = leads.filter((l) => l.dataEntrada.slice(0,10) === data).length;
  const atendidos = leads.filter((l) => l.dataUltimoContato?.slice(0,10) === data).length;
  const agendamentos = leads.filter((l) => l.status === "agendado").length;
  const convertidos = leads.filter((l) => l.status === "convertido").length;

  const porAtendente = ATENDENTES.map((a) => {
    const list = leads.filter((l) => l.atendente === a);
    return {
      atendente: a,
      atendidos: list.filter((l) => l.dataUltimoContato?.slice(0,10) === data).length,
      agendamentos: list.filter((l) => l.status === "agendado").length,
      conversoes: list.filter((l) => l.status === "convertido").length,
      perdas: list.filter((l) => l.status === "perdido").length,
      pendencias: list.filter((l) => ["novo","em_atendimento","aguardando_resposta"].includes(l.status)).length,
    };
  });

  const copyResumo = () => {
    const txt = `📊 Resumo Clube04 — ${new Date(data).toLocaleDateString("pt-BR")}\n` +
      `🆕 Novos: ${novos}\n📞 Atendidos: ${atendidos}\n📅 Agendados: ${agendamentos}\n✅ Convertidos: ${convertidos}\n\nPor atendente:\n` +
      porAtendente.map((a) => `${a.atendente}: ${a.atendidos} atend · ${a.agendamentos} agend · ${a.conversoes} conv · ${a.pendencias} pend`).join("\n");
    navigator.clipboard.writeText(txt);
    toast.success("Resumo copiado!");
  };

  return (
    <>
      <PageHeader title="Resumo Diário" subtitle="Fechamento operacional do dia." badge={<MockBadge />}
        actions={<Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-44 h-9" />} />
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <KpiCard label="Leads novos" value={novos} accent="text-primary" />
          <KpiCard label="Atendidos" value={atendidos} />
          <KpiCard label="Agendamentos" value={agendamentos} accent="text-info" />
          <KpiCard label="Convertidos" value={convertidos} accent="text-emerald-600" />
          <KpiCard label="Perdidos" value={leads.filter((l) => l.status === "perdido").length} accent="text-destructive" />
          <KpiCard label="Desqualificados" value={leads.filter((l) => l.status === "desqualificado").length} />
          <KpiCard label="Nutrição" value={leads.filter((l) => l.status === "nutricao").length} accent="text-sky-600" />
          <KpiCard label="Sem resposta" value={leads.filter((l) => l.ultimoResultado === "sem_resposta").length} accent="text-amber-600" />
          <KpiCard label="Vencidos" value={leads.filter((l) => l.dataProximoContato && new Date(l.dataProximoContato) < new Date(new Date().setHours(0,0,0,0))).length} accent="text-destructive" />
          <KpiCard label="Backlog" value={leads.filter((l) => { if (!l.dataProximoContato) return false; return (new Date(l.dataProximoContato).getTime() - Date.now())/86400000 < -7; }).length} accent="text-destructive" />
          <KpiCard label="Sem próximo contato" value={leads.filter((l) => ["novo","em_atendimento","aguardando_resposta","follow_up"].includes(l.status) && !l.dataProximoContato).length} accent="text-amber-600" />
          <KpiCard label="Análise da liderança" value={leads.filter((l) => l.status === "analise_lideranca").length} accent="text-destructive" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="font-display font-semibold">Resumo por atendente</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2.5 text-left">Atendente</th><th className="px-4 py-2.5 text-left">Atendidos</th><th className="px-4 py-2.5 text-left">Agendamentos</th><th className="px-4 py-2.5 text-left">Conversões</th><th className="px-4 py-2.5 text-left">Perdas</th><th className="px-4 py-2.5 text-left">Pendências</th></tr>
            </thead>
            <tbody>
              {porAtendente.map((a) => (
                <tr key={a.atendente} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{a.atendente}</td>
                  <td className="px-4 py-3">{a.atendidos}</td>
                  <td className="px-4 py-3">{a.agendamentos}</td>
                  <td className="px-4 py-3 text-emerald-700 font-medium">{a.conversoes}</td>
                  <td className="px-4 py-3 text-destructive">{a.perdas}</td>
                  <td className="px-4 py-3">{a.pendencias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h3 className="font-display font-semibold mb-2 text-amber-900">Alertas do dia</h3>
          <ul className="text-sm text-amber-900/80 space-y-1">
            <li>· Leads sem próximo contato precisam de atenção</li>
            <li>· Casos enviados para liderança hoje</li>
            <li>· Backlog acumulado pede priorização</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={copyResumo} className="gap-1.5"><Copy className="w-4 h-4" />Copiar resumo</Button>
          <Button variant="outline" className="gap-1.5"><Download className="w-4 h-4" />Exportar resumo</Button>
          <Button variant="outline" disabled className="gap-1.5"><Send className="w-4 h-4" />Enviar automaticamente <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">Em breve</span></Button>
        </div>
      </div>
    </>
  );
}
