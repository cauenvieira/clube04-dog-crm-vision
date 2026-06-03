import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, MockBadge } from "@/components/layout/AppLayout";
import { useLeads } from "@/lib/leads-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Megaphone, ArrowLeft, Tag, Trash2, Download } from "lucide-react";
import { formatDate } from "@/lib/mock-data";

export const Route = createFileRoute("/nutricao")({
  head: () => ({ meta: [{ title: "Nutrição e Campanhas · CRM Clube04" }] }),
  component: Nutricao,
});

const CATEGORIAS = ["Todas","Lista de transmissão","Rebranding","Campanha sazonal","Promoção futura","Recuperação futura","Sem urgência","Interesse frio"];

function Nutricao() {
  const { leads } = useLeads();
  const lista = leads.filter((l) => l.status === "nutricao");

  return (
    <>
      <PageHeader title="Nutrição e Campanhas" subtitle="Leads que não consomem energia diária, mas podem ser ativados em campanhas futuras." badge={<MockBadge />} />
      <div className="px-8 py-6 space-y-5">
        <Tabs defaultValue="Todas">
          <TabsList className="flex flex-wrap h-auto">
            {CATEGORIAS.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="Todas" className="mt-5">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lista.map((l) => (
                <div key={l.id} className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{l.tutor}</div>
                      <div className="text-xs text-muted-foreground">🐾 {l.pet} · {l.telefone}</div>
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">{l.campanha ?? "Sem tag"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Origem: <span className="text-foreground">{l.origem}</span></div>
                    <div>Motivo: <span className="text-foreground">{l.motivoNutricao ?? "—"}</span></div>
                    <div>Última interação: <span className="text-foreground">{formatDate(l.dataUltimoContato)}</span></div>
                    <div className="flex items-center gap-1 text-sky-700"><Megaphone className="w-3 h-3" /> Próxima: Campanha sazonal</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><ArrowLeft className="w-3 h-3" />Mesa</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"><Tag className="w-3 h-3" />Tag</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive gap-1"><Trash2 className="w-3 h-3" />Remover</Button>
                  </div>
                </div>
              ))}
              {lista.length === 0 && <div className="md:col-span-3 text-center text-muted-foreground py-12 rounded-xl border border-dashed border-border">Nenhum lead em nutrição.</div>}
            </div>
          </TabsContent>
          {CATEGORIAS.slice(1).map((c) => (
            <TabsContent key={c} value={c} className="mt-5">
              <div className="text-sm text-muted-foreground p-8 text-center rounded-xl border border-dashed border-border">Categoria mockada — leads serão filtrados aqui.</div>
            </TabsContent>
          ))}
        </Tabs>

        <Button variant="outline" className="gap-1.5"><Download className="w-4 h-4" />Exportar lista</Button>
      </div>
    </>
  );
}
