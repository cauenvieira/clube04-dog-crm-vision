import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, MockBadge } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, Search, Columns3 } from "lucide-react";
import { useLeads } from "@/lib/leads-store";
import { LeadDrawer } from "@/components/LeadDrawer";
import { NewLeadModal } from "@/components/NewLeadModal";
import { StatusChip } from "@/components/StatusChip";
import { type Lead, type StatusOperacional, STATUS_LABEL, ATENDENTES, ORIGENS, RESULTADO_LABEL, formatDate } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/base")({
  head: () => ({ meta: [{ title: "Base de Leads · CRM Clube04" }] }),
  component: BaseLeads,
});

function BaseLeads() {
  const { leads } = useLeads();
  const [busca, setBusca] = useState("");
  const [fStatus, setFStatus] = useState("todos");
  const [fOrigem, setFOrigem] = useState("todos");
  const [fAtendente, setFAtendente] = useState("todos");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [openNew, setOpenNew] = useState(false);

  const filtrados = useMemo(() => leads.filter((l) => {
    if (fStatus !== "todos" && l.status !== fStatus) return false;
    if (fOrigem !== "todos" && l.origem !== fOrigem) return false;
    if (fAtendente !== "todos" && l.atendente !== fAtendente) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!l.tutor.toLowerCase().includes(q) && !l.pet.toLowerCase().includes(q) && !l.telefone.includes(q)) return false;
    }
    return true;
  }), [leads, busca, fStatus, fOrigem, fAtendente]);

  const exportCSV = () => {
    const headers = ["Data entrada","Tutor","Pet","Telefone","Origem","Atendente","Status","Próximo contato","Último resultado","Tentativas","Última atualização","Observação"];
    const rows = filtrados.map((l) => [
      formatDate(l.dataEntrada), l.tutor, l.pet, l.telefone, l.origem, l.atendente,
      STATUS_LABEL[l.status], formatDate(l.dataProximoContato),
      l.ultimoResultado ? RESULTADO_LABEL[l.ultimoResultado] : "", String(l.tentativas),
      formatDate(l.dataUltimoContato), (l.observacao ?? "").replace(/[\r\n;]/g," "),
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-clube04-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  return (
    <>
      <PageHeader
        title="Base de Leads"
        subtitle="Consulta, filtros, auditoria e exportação da base de leads."
        badge={<MockBadge />}
        actions={
          <>
            <Button variant="outline" onClick={exportCSV} className="gap-1.5"><Download className="w-4 h-4" />Exportar CSV</Button>
            <Button onClick={() => setOpenNew(true)} className="gap-1.5"><Plus className="w-4 h-4" />Novo lead</Button>
          </>
        }
      />

      <div className="px-8 py-6 space-y-4">
        <div className="rounded-xl border border-border bg-card p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="pl-10 h-9 border-0 bg-muted/40" />
          </div>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {(Object.keys(STATUS_LABEL) as StatusOperacional[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fOrigem} onValueChange={setFOrigem}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas origens</SelectItem>
              {ORIGENS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fAtendente} onValueChange={setFAtendente}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos atendentes</SelectItem>
              {ATENDENTES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" disabled><Columns3 className="w-3.5 h-3.5" />Colunas</Button>
        </div>

        <div className="text-xs text-muted-foreground">{filtrados.length} {filtrados.length === 1 ? "lead" : "leads"} encontrados</div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold">Data</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Tutor</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Pet</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Telefone</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Origem</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Atendente</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Próx. contato</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Últ. resultado</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Tent.</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Atualização</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Observação</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((l) => (
                  <tr key={l.id} onClick={() => setSelected(l)} className="border-t border-border hover:bg-muted/30 cursor-pointer">
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(l.dataEntrada)}</td>
                    <td className="px-3 py-2.5 font-medium">{l.tutor}</td>
                    <td className="px-3 py-2.5">{l.pet}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{l.telefone}</td>
                    <td className="px-3 py-2.5">{l.origem}</td>
                    <td className="px-3 py-2.5">{l.atendente}</td>
                    <td className="px-3 py-2.5"><StatusChip status={l.status} /></td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(l.dataProximoContato)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{l.ultimoResultado ? RESULTADO_LABEL[l.ultimoResultado] : "—"}</td>
                    <td className="px-3 py-2.5">{l.tentativas}/12</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(l.dataUltimoContato)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground max-w-48 truncate">{l.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LeadDrawer lead={selected} open={!!selected} onClose={() => setSelected(null)} />
      <NewLeadModal open={openNew} onClose={() => setOpenNew(false)} onOpenLead={setSelected} />
    </>
  );
}
