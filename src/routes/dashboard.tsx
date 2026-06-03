import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader, MockBadge } from "@/components/layout/AppLayout";
import { useLeads } from "@/lib/leads-store";
import { KpiCard } from "@/components/KpiCard";
import { TrendingUp, Users, Calendar, CheckCircle2, XCircle, UserX, Megaphone, AlertCircle, Inbox, Clock, Activity, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ATENDENTES, ORIGENS } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard de Leads · CRM Clube04" }] }),
  component: Dashboard,
});

function Bar({ label, value, max, color = "bg-primary" }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Dashboard() {
  const { leads } = useLeads();
  const stats = useMemo(() => {
    const total = leads.length;
    const convertidos = leads.filter((l) => l.status === "convertido").length;
    const agendados = leads.filter((l) => l.status === "agendado").length;
    const perdidos = leads.filter((l) => l.status === "perdido").length;
    const desq = leads.filter((l) => l.status === "desqualificado").length;
    const nut = leads.filter((l) => l.status === "nutricao").length;
    const semData = leads.filter((l) => ["novo","em_atendimento","aguardando_resposta","follow_up"].includes(l.status) && !l.dataProximoContato).length;

    const porOrigem: Record<string, number> = {};
    const porAtendente: Record<string, { tot: number; conv: number; agend: number }> = {};
    leads.forEach((l) => {
      porOrigem[l.origem] = (porOrigem[l.origem] ?? 0) + 1;
      if (!porAtendente[l.atendente]) porAtendente[l.atendente] = { tot: 0, conv: 0, agend: 0 };
      porAtendente[l.atendente].tot++;
      if (l.status === "convertido") porAtendente[l.atendente].conv++;
      if (l.status === "agendado") porAtendente[l.atendente].agend++;
    });

    const taxaAgend = total ? Math.round((agendados / total) * 100) : 0;
    const taxaConv = agendados ? Math.round((convertidos / Math.max(agendados+convertidos,1)) * 100) : 0;
    const taxaPerda = total ? Math.round((perdidos / total) * 100) : 0;
    const taxaDesq = total ? Math.round((desq / total) * 100) : 0;

    return { total, convertidos, agendados, perdidos, desq, nut, semData, porOrigem, porAtendente, taxaAgend, taxaConv, taxaPerda, taxaDesq };
  }, [leads]);

  const maxOrigem = Math.max(...Object.values(stats.porOrigem), 1);
  const maxAtend = Math.max(...Object.values(stats.porAtendente).map((a) => a.tot), 1);

  return (
    <>
      <PageHeader title="Dashboard de Leads" subtitle="Indicadores de conversão, produtividade e oportunidades." badge={<MockBadge />}
        actions={
          <div className="flex gap-2">
            <Select defaultValue="30"><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7d</SelectItem>
                <SelectItem value="30">Últimos 30d</SelectItem>
                <SelectItem value="90">Últimos 90d</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="todos"><SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos atendentes</SelectItem>{ATENDENTES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
            <Select defaultValue="todas"><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="todas">Todas origens</SelectItem>{ORIGENS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        }
      />
      <div className="px-8 py-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">KPIs Principais</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard icon={<Users className="w-4 h-4" />} label="Leads novos" value={stats.total} accent="text-primary" />
            <KpiCard icon={<Activity className="w-4 h-4" />} label="Atendidos" value={leads.filter((l) => l.dataUltimoContato).length} />
            <KpiCard icon={<Calendar className="w-4 h-4" />} label="Agendamentos" value={stats.agendados} accent="text-info" />
            <KpiCard icon={<CheckCircle2 className="w-4 h-4" />} label="Convertidos" value={stats.convertidos} accent="text-emerald-600" />
            <KpiCard icon={<XCircle className="w-4 h-4" />} label="Perdidos" value={stats.perdidos} accent="text-destructive" />
            <KpiCard icon={<UserX className="w-4 h-4" />} label="Desqualificados" value={stats.desq} />
            <KpiCard icon={<Megaphone className="w-4 h-4" />} label="Em nutrição" value={stats.nut} accent="text-sky-600" />
            <KpiCard icon={<AlertCircle className="w-4 h-4" />} label="Sem próximo contato" value={stats.semData} accent="text-amber-600" />
            <KpiCard icon={<Clock className="w-4 h-4" />} label="Vencidos" value={leads.filter((l) => l.dataProximoContato && new Date(l.dataProximoContato) < new Date(new Date().setHours(0,0,0,0))).length} accent="text-destructive" />
            <KpiCard icon={<Inbox className="w-4 h-4" />} label="Backlog" value={leads.filter((l) => { if (!l.dataProximoContato) return false; const d = (new Date(l.dataProximoContato).getTime() - Date.now())/86400000; return d < -7; }).length} accent="text-destructive" />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-3">
          <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Lead → Agendamento" value={`${stats.taxaAgend}%`} accent="text-info" />
          <KpiCard icon={<Zap className="w-4 h-4" />} label="Agendamento → Cliente" value={`${stats.taxaConv}%`} accent="text-emerald-600" />
          <KpiCard label="Taxa de perda" value={`${stats.taxaPerda}%`} accent="text-destructive" />
          <KpiCard label="Taxa de desqualificação" value={`${stats.taxaDesq}%`} accent="text-muted-foreground" />
          <KpiCard label="Tempo médio 1º contato" value="2h 15min" />
          <KpiCard label="Tempo médio agendamento" value="1d 4h" />
          <KpiCard label="Tentativas médias / conversão" value="3,2" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold mb-4">Conversão por origem</h3>
            <div className="space-y-3">
              {Object.entries(stats.porOrigem).map(([k, v]) => <Bar key={k} label={k} value={v} max={maxOrigem} />)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold mb-4">Performance por atendente</h3>
            <div className="space-y-4">
              {Object.entries(stats.porAtendente).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{k}</span><span className="text-muted-foreground">{v.tot} leads · {v.conv} convertidos</span></div>
                  <Bar label="Total" value={v.tot} max={maxAtend} color="bg-primary/70" />
                  <div className="mt-1"><Bar label="Agendamentos" value={v.agend} max={maxAtend} color="bg-info/70" /></div>
                  <div className="mt-1"><Bar label="Conversões" value={v.conv} max={maxAtend} color="bg-emerald-500/70" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display font-semibold mb-4">Funil de conversão</h3>
          <div className="flex items-end justify-around gap-4 h-44">
            {[
              { label: "Novo", value: leads.filter((l) => l.status === "novo").length, color: "bg-info" },
              { label: "Em atendimento", value: leads.filter((l) => ["em_atendimento","aguardando_resposta","follow_up"].includes(l.status)).length, color: "bg-primary" },
              { label: "Agendado", value: stats.agendados, color: "bg-emerald-500" },
              { label: "Convertido", value: stats.convertidos, color: "bg-emerald-700" },
            ].map((f, i) => {
              const max = Math.max(stats.total, 1);
              const h = (f.value / max) * 100;
              return (
                <div key={f.label} className="flex-1 flex flex-col items-center gap-2" style={{ opacity: 1 - i*0.1 }}>
                  <div className="text-xl font-bold">{f.value}</div>
                  <div className={`w-full ${f.color} rounded-t-lg transition-all`} style={{ height: `${Math.max(h, 8)}%` }} />
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-amber-50/60 border-amber-200 p-4">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-amber-900"><AlertCircle className="w-4 h-4" /> Alertas operacionais</h3>
          <ul className="text-sm text-amber-900/80 space-y-1.5">
            <li>· {stats.semData} leads sem próximo contato definido</li>
            <li>· Backlog acumulado precisa de atenção</li>
            <li>· Origem Fachada com taxa de desqualificação acima da média</li>
            <li>· Leads em análise da liderança há mais de 2 dias</li>
          </ul>
        </div>
      </div>
    </>
  );
}
