import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Bem-vindo ao Sistema Dojo</h1>
        <p className="text-slate-300">
          Um MVP SaaS mobile-first para academias de jiu-jitsu. Portal do aluno, hub de pagamentos com PIX, torneios e mensageria.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard
          title="Portal do Aluno"
          description="Pagamentos, agenda, QR de presença, torneio e graduação em um único lugar."
        />
        <FeatureCard
          title="Hub de Pagamentos"
          description="Administre comprovantes PIX, aprove pagamentos e acompanhe métricas em tempo real."
        />
        <FeatureCard
          title="PIX Pro-Ready"
          description="Fluxo estático imediato com upload de comprovante e camada preparada para Pix Dinâmico."
        />
        <FeatureCard
          title="Mensageria"
          description="Envios mock de WhatsApp com templates de lembretes e confirmações."
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
        <Link
          href="/aluno"
          className="px-6 py-3 rounded-lg bg-primary text-slate-950 font-semibold text-center"
        >
          Entrar como aluno
        </Link>
        <Link
          href="/admin/pagamentos"
          className="px-6 py-3 rounded-lg border border-slate-700 text-slate-200 text-center"
        >
          Entrar como admin
        </Link>
      </div>
    </section>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm space-y-2">
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="text-sm text-slate-300">{description}</p>
    </article>
  );
}
