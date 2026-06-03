import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, MockBadge } from "@/components/layout/AppLayout";
import { Sparkles, TrendingUp, Heart, Package, DollarSign, RefreshCw, MapPin, Tag } from "lucide-react";
import { useLeads } from "@/lib/leads-store";

export const Route = createFileRoute("/oportunidades")({
  head: () => ({ meta: [{ title: "Oportunidades · CRM Clube04" }] }),
  component: Oportunidades,
});

const CARDS = [
  { icon: RefreshCw, label: "Leads prontos para retomar", color: "text-primary", n: 8 },
  { icon: TrendingUp, label: "Alto potencial", color: "text-emerald-600", n: 5 },
  { icon: Heart, label: "Indicações", color: "text-pink-600", n: 4 },
  { icon: Package, label: "Pediram pacote", color: "text-info", n: 3 },
  { icon: DollarSign, label: "Pediram preço, não fecharam", color: "text-amber-600", n: 6 },
  { icon: Sparkles, label: "Reativação", color: "text-purple-600", n: 7 },
  { icon: MapPin, label: "Objeção localização", color: "text-muted-foreground", n: 2 },
  { icon: Tag, label: "Objeção preço", color: "text-muted-foreground", n: 4 },
];

function Oportunidades() {
  const { leads } = useLeads();
  const amostra = leads.slice(0, 8);

  return (
    <>
      <PageHeader title="Oportunidades" subtitle="Oportunidades geradas pela base." badge={<MockBadge />} />
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 cursor-pointer transition-all">
                <div className={`${c.color} mb-2`}><Icon className="w-5 h-5" /></div>
                <div className="text-2xl font-display font-bold">{c.n}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.label}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b"><h3 className="font-display font-semibold">Lista de oportunidades</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2.5 text-left">Lead</th><th className="px-4 py-2.5 text-left">Oportunidade</th><th className="px-4 py-2.5 text-left">Ação sugerida</th><th className="px-4 py-2.5 text-left">Prioridade</th><th className="px-4 py-2.5 text-left">Responsável</th></tr>
            </thead>
            <tbody>
              {amostra.map((l, i) => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3"><div className="font-medium">{l.tutor}</div><div className="text-xs text-muted-foreground">🐾 {l.pet}</div></td>
                  <td className="px-4 py-3 text-muted-foreground">{CARDS[i % CARDS.length].label}</td>
                  <td className="px-4 py-3 text-muted-foreground">Enviar follow-up com proposta de pacote</td>
                  <td className="px-4 py-3"><span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${i%3===0?"bg-destructive/15 text-destructive":i%3===1?"bg-amber-100 text-amber-700":"bg-muted text-muted-foreground"}`}>{i%3===0?"Alta":i%3===1?"Média":"Baixa"}</span></td>
                  <td className="px-4 py-3">{l.atendente}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
