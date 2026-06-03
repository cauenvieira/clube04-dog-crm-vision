import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, MockBadge, FuturoBadge } from "@/components/layout/AppLayout";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/mensagens")({
  head: () => ({ meta: [{ title: "Biblioteca de Mensagens · CRM Clube04" }] }),
  component: Mensagens,
});

const CATEGORIAS = [
  { nome: "Primeiro contato", desc: "Boas-vindas e quebra de gelo" },
  { nome: "Follow-up", desc: "Retomar conversa parada" },
  { nome: "Objeção de preço", desc: "Responder dúvidas sobre valor" },
  { nome: "Objeção de localização", desc: "Tratar distância e logística" },
  { nome: "Sem táxi dog", desc: "Comunicar limitação de serviço" },
  { nome: "Agendamento", desc: "Confirmar horário do banho" },
  { nome: "Pós-atendimento", desc: "Acompanhamento após visita" },
  { nome: "Recuperação", desc: "Reativar tutores antigos" },
  { nome: "Pacotes", desc: "Apresentar planos mensais" },
];

function Mensagens() {
  return (
    <>
      <PageHeader title="Biblioteca de Mensagens" subtitle="Templates futuros de comunicação para a equipe." badge={<><MockBadge /><FuturoBadge /></>} />
      <div className="px-8 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIAS.map((c) => (
            <div key={c.nome} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 cursor-pointer transition-all relative">
              <div className="absolute top-3 right-3"><FuturoBadge /></div>
              <div className="text-primary mb-2"><MessageSquare className="w-5 h-5" /></div>
              <div className="font-display font-semibold">{c.nome}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
              <div className="mt-3 text-[11px] text-muted-foreground">{Math.floor(Math.random()*8)+2} templates</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
