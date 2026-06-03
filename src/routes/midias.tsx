import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, MockBadge, FuturoBadge } from "@/components/layout/AppLayout";
import { Image, Video, Music, FileText } from "lucide-react";

export const Route = createFileRoute("/midias")({
  head: () => ({ meta: [{ title: "Biblioteca de Mídias · CRM Clube04" }] }),
  component: Midias,
});

const ITENS = [
  { cat: "Tour do espaço", tipo: "video", icon: Video },
  { cat: "Banho relaxante", tipo: "video", icon: Video },
  { cat: "Secagem no colo", tipo: "imagem", icon: Image },
  { cat: "Cromoterapia", tipo: "imagem", icon: Image },
  { cat: "Prova social", tipo: "imagem", icon: Image },
  { cat: "Pacotes", tipo: "documento", icon: FileText },
  { cat: "Produtos", tipo: "imagem", icon: Image },
  { cat: "Música relaxante", tipo: "áudio", icon: Music },
];

function Midias() {
  return (
    <>
      <PageHeader title="Biblioteca de Mídias" subtitle="Mídias da unidade prontas para envio futuro." badge={<><MockBadge /><FuturoBadge /></>} />
      <div className="px-8 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {ITENS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.cat} className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 cursor-pointer transition-all">
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-amber-100/50 to-muted flex items-center justify-center">
                  <Icon className="w-10 h-10 text-primary/60" />
                </div>
                <div className="p-3 relative">
                  <div className="absolute top-3 right-3"><FuturoBadge /></div>
                  <div className="font-medium text-sm">{m.cat}</div>
                  <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{m.tipo}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
