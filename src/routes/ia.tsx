import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, MockBadge, FuturoBadge } from "@/components/layout/AppLayout";
import { Bot, MessageSquare, FileText, Target, Compass, BookOpen, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/ia")({
  head: () => ({ meta: [{ title: "Assistente IA · CRM Clube04" }] }),
  component: AssistenteIA,
});

const CARDS = [
  { icon: MessageSquare, t: "Sugestão de resposta", d: "Sugerir resposta com base na conversa." },
  { icon: FileText, t: "Resumo da conversa", d: "Resumo automático para o atendente." },
  { icon: Target, t: "Classificação de intenção", d: "Detectar objeções e oportunidades." },
  { icon: Compass, t: "Próxima melhor ação", d: "Indicar o melhor passo no atendimento." },
  { icon: BookOpen, t: "Consulta à base interna", d: "Buscar informações dos doguinhos." },
  { icon: PlayCircle, t: "Simulação de atendimento", d: "Treinar atendentes em casos reais." },
];

function AssistenteIA() {
  return (
    <>
      <PageHeader title="Assistente IA" subtitle="Assistente para sugerir respostas, resumir conversa e classificar objeções." badge={<><MockBadge /><FuturoBadge /></>} />
      <div className="px-8 py-6 space-y-4">
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-amber-50/50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0"><Bot className="w-6 h-6" /></div>
          <div>
            <h2 className="font-display font-bold text-lg">Assistente em desenvolvimento</h2>
            <p className="text-sm text-muted-foreground mt-1">Esta visão mostra como o assistente vai apoiar a equipe no dia a dia. Sem IA real conectada no mockup.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.t} className="rounded-xl border border-border bg-card p-5 relative">
                <div className="absolute top-3 right-3"><FuturoBadge /></div>
                <div className="text-primary mb-2"><Icon className="w-5 h-5" /></div>
                <div className="font-display font-semibold">{c.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
