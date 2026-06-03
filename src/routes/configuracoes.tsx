import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, MockBadge, FuturoBadge } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ATENDENTES, ORIGENS, resetLeads } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · CRM Clube04" }] }),
  component: Configuracoes,
});

function Section({ title, children, futuro = false }: { title: string; children: React.ReactNode; futuro?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4"><h3 className="font-display font-semibold">{title}</h3>{futuro && <FuturoBadge />}</div>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function Configuracoes() {
  return (
    <>
      <PageHeader title="Configurações" subtitle="Configurações da unidade e do CRM." badge={<MockBadge />} />
      <div className="px-8 py-6 grid md:grid-cols-2 gap-4">
        <Section title="Modo demo">
          <div className="flex items-center justify-between"><Label>Usar dados mockados</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Persistir em localStorage</Label><Switch defaultChecked /></div>
          <Button variant="outline" size="sm" onClick={() => { resetLeads(); toast.success("Dados reiniciados. Recarregue a página."); }}>
            Reiniciar dados mockados
          </Button>
        </Section>

        <Section title="API futura" futuro>
          <div><Label className="text-xs">API base URL</Label><Input placeholder="https://api.clube04.com.br/crm" className="mt-1" /></div>
          <div><Label className="text-xs">API key</Label><Input type="password" defaultValue="••••••••••••" className="mt-1" /></div>
        </Section>

        <Section title="Usuários e atendentes">
          <div className="space-y-2">
            {ATENDENTES.map((a) => (
              <div key={a} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">{a[0]}</div>
                  <span>{a}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Atendente</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Origens de lead">
          <div className="flex flex-wrap gap-1.5">
            {ORIGENS.map((o) => <span key={o} className="text-xs px-2.5 py-1 rounded-md bg-muted">{o}</span>)}
          </div>
        </Section>

        <Section title="Regras de tentativas">
          <div className="flex items-center justify-between"><Label>Limite de tentativas sem resposta</Label><Input defaultValue="12" className="w-20 h-8" /></div>
          <div className="flex items-center justify-between"><Label>Vencidos recentes (dias)</Label><span className="text-muted-foreground text-xs">1 a 7</span></div>
          <div className="flex items-center justify-between"><Label>Backlog (dias)</Label><span className="text-muted-foreground text-xs">+ de 7</span></div>
        </Section>

        <Section title="Status e motivos">
          <div className="text-muted-foreground text-xs">Status e motivos são configuráveis em versão futura.</div>
        </Section>

        <Section title="Exportação">
          <div className="flex items-center justify-between"><Label>Separador</Label><span className="text-xs text-muted-foreground">Ponto-e-vírgula (;)</span></div>
          <div className="flex items-center justify-between"><Label>Codificação</Label><span className="text-xs text-muted-foreground">UTF-8 BOM</span></div>
        </Section>

        <Section title="Integrações futuras" futuro>
          <div className="text-muted-foreground text-xs">WhatsApp Business, Google Calendar, ERP da unidade, n8n, Meta Ads.</div>
        </Section>

        <div className="md:col-span-2 flex gap-2 justify-end">
          <Button variant="outline">Limpar</Button>
          <Button>Salvar</Button>
        </div>
      </div>
    </>
  );
}
