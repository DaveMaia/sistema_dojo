'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import useSWR from 'swr';
import { showToast } from '@/components/toaster';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { StudentPortalSummary } from '@/features/students/types';
import { InvoiceWithPix } from '@/features/billing/types';
import { Note } from '@/features/notes/types';
import { TournamentSummary } from '@/features/tournament_se/types';
import { AttendanceTicket } from '@/features/attendance/types';
import { ClassWithReservation } from '@/features/schedule/types';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Falha na requisição');
  return res.json();
});

const tabs = [
  'dados',
  'recados',
  'pagamentos',
  'torneio',
  'presenca',
  'agenda',
  'graduacao',
] as const;

type Tab = (typeof tabs)[number];

export default function StudentPortalPage() {
  const [tab, setTab] = useState<Tab>('dados');
  const { data: me } = useSWR<StudentPortalSummary>('/api/student/me', fetcher);
  const { data: notes } = useSWR<Note[]>('/api/notes?target=me', fetcher);
  const { data: invoices, mutate: refreshInvoices } = useSWR<InvoiceWithPix[]>(
    '/api/invoices?mine=1',
    fetcher,
  );
  const { data: tournament } = useSWR<TournamentSummary>('/api/tournament/se/me', fetcher);
  const { data: classes, mutate: refreshClasses } = useSWR<ClassWithReservation[]>(
    '/api/classes?scope=me',
    fetcher,
  );
  const { data: ticket, mutate: refreshTicket } = useSWR<AttendanceTicket | null>(
    '/api/attendance/ticket',
    fetcher,
  );

  const tabContent = useMemo(() => {
    switch (tab) {
      case 'dados':
        return <DadosTab summary={me} />;
      case 'recados':
        return <RecadosTab notes={notes} />;
      case 'pagamentos':
        return <PagamentosTab invoices={invoices} onRefresh={refreshInvoices} />;
      case 'torneio':
        return <TorneioTab tournament={tournament} />;
      case 'presenca':
        return <PresencaTab ticket={ticket} onRefresh={refreshTicket} />;
      case 'agenda':
        return <AgendaTab classes={classes} onRefresh={refreshClasses} />;
      case 'graduacao':
        return <GraduacaoTab summary={me} />;
      default:
        return null;
    }
  }, [tab, me, notes, invoices, refreshInvoices, tournament, ticket, refreshTicket, classes, refreshClasses]);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <nav className="flex gap-3 pb-3">
          {tabs.map((item) => (
            <button
              key={item}
              className={`px-4 py-2 rounded-full border text-sm capitalize whitespace-nowrap ${
                tab === item ? 'bg-primary text-slate-950 border-primary' : 'border-slate-700'
              }`}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm min-h-[320px]">
        {tabContent}
      </div>
    </div>
  );
}

function DadosTab({ summary }: { summary?: StudentPortalSummary }) {
  if (!summary) {
    return <p className="text-sm text-slate-400">Carregando dados...</p>;
  }

  const { student, academy, rank } = summary;
  return (
    <div className="space-y-4 text-sm">
      <section className="space-y-1">
        <h2 className="font-semibold text-lg">Meus dados</h2>
        <p>{student.name}</p>
        <p className="text-slate-300">{student.email}</p>
        <p className="text-slate-300">{student.phone}</p>
        <p className="text-slate-400 text-xs">Academia: {academy.name}</p>
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold text-base">Skills obrigatórias</h3>
        <ul className="space-y-1">
          {rank.requiredSkills.map((skill) => (
            <li key={skill.name} className="flex items-center justify-between">
              <span>{skill.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${skill.completed ? 'bg-success/20 text-success' : 'bg-slate-800 text-slate-300'}`}>
                {skill.completed ? 'Concluído' : 'Pendente'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RecadosTab({ notes }: { notes?: Note[] }) {
  if (!notes) return <p className="text-sm text-slate-400">Carregando recados...</p>;
  if (notes.length === 0)
    return <p className="text-sm text-slate-400">Nenhum recado novo. Oss!</p>;

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="border border-slate-800 rounded-lg p-3 bg-slate-950/60">
          <h3 className="font-semibold">{note.title}</h3>
          <p className="text-sm text-slate-300">{note.message}</p>
          <p className="text-xs text-slate-500 mt-1">{formatDate(note.created_at)}</p>
        </li>
      ))}
    </ul>
  );
}

function PagamentosTab({
  invoices,
  onRefresh,
}: {
  invoices?: InvoiceWithPix[];
  onRefresh: () => void;
}) {
  if (!invoices) return <p className="text-sm text-slate-400">Carregando faturas...</p>;

  async function gerarPix(invoiceId: string) {
    const response = await fetch(`/api/payments/pix/${invoiceId}`, { method: 'POST' });
    if (!response.ok) {
      showToast('Não foi possível gerar o PIX.');
      return;
    }
    showToast('PIX gerado com sucesso!');
    onRefresh();
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <article key={invoice.id} className="border border-slate-800 rounded-xl p-4 space-y-3">
          <header className="flex items-center justify-between gap-2 text-sm">
            <div>
              <p className="font-semibold">Vencimento {formatDate(invoice.due_date)}</p>
              <p className="text-xs text-slate-400">{formatCurrency(invoice.amount_numeric)}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </header>
          {invoice.invoice_pix ? (
            <div className="space-y-2 text-xs">
              <p className="text-slate-300 break-words">{invoice.invoice_pix.brcode_payload}</p>
              <button
                onClick={() => navigator?.clipboard?.writeText(invoice.invoice_pix?.brcode_payload ?? '')}
                className="px-3 py-2 rounded-lg border border-primary text-primary text-sm"
              >
                Copiar código copia-e-cola
              </button>
            </div>
          ) : (
            <button
              onClick={() => gerarPix(invoice.id)}
              className="px-3 py-2 rounded-lg bg-primary text-slate-950 text-sm font-semibold"
            >
              Gerar PIX
            </button>
          )}
          <UploadComprovanteButton invoiceId={invoice.id} onUploaded={onRefresh} />
        </article>
      ))}
    </div>
  );
}

function UploadComprovanteButton({ invoiceId, onUploaded }: { invoiceId: string; onUploaded: () => void }) {
  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`/api/payments/pix/${invoiceId}/proof`, {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      showToast('Comprovante enviado!');
      onUploaded();
    } else {
      showToast('Falha ao enviar comprovante.');
    }
  }

  return (
    <label className="block text-sm">
      <span className="text-xs text-slate-400">Enviar comprovante (PDF ou imagem)</span>
      <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="mt-1 block w-full text-xs" />
    </label>
  );
}

function TorneioTab({ tournament }: { tournament?: TournamentSummary }) {
  if (!tournament) return <p className="text-sm text-slate-400">Sem chave disponível no momento.</p>;

  return (
    <div className="space-y-3 text-sm">
      <h2 className="text-lg font-semibold">{tournament.tournament?.name ?? 'Torneio'}</h2>
      {tournament.nextMatch ? (
        <p>
          Próxima luta: rodada {tournament.nextMatch.round_int} contra {tournament.nextMatch.opponent_name}
        </p>
      ) : (
        <p className="text-slate-400">Você não possui lutas agendadas.</p>
      )}
      {tournament.bracket_url && (
        <a href={tournament.bracket_url} target="_blank" className="text-primary text-sm underline">
          Ver chave completa
        </a>
      )}
    </div>
  );
}

function PresencaTab({ ticket, onRefresh }: { ticket?: AttendanceTicket | null; onRefresh: () => void }) {
  async function gerarQr() {
    const response = await fetch('/api/attendance/ticket', { method: 'POST' });
    if (response.ok) {
      showToast('QR atualizado!');
      onRefresh();
    } else {
      showToast('Não foi possível gerar o QR agora.');
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <button onClick={gerarQr} className="px-3 py-2 rounded-lg bg-primary text-slate-950 text-sm font-semibold">
        Gerar meu QR de presença
      </button>
      {ticket?.qr_svg ? (
        <div className="bg-white p-3 rounded-lg" dangerouslySetInnerHTML={{ __html: ticket.qr_svg }} />
      ) : (
        <p className="text-slate-400">Nenhum QR ativo. Gere agora para fazer check-in.</p>
      )}
      {ticket?.expires_at && (
        <p className="text-xs text-slate-400">Expira em {formatDate(ticket.expires_at)}</p>
      )}
    </div>
  );
}

function AgendaTab({
  classes,
  onRefresh,
}: {
  classes?: ClassWithReservation[];
  onRefresh: () => void;
}) {
  async function toggleReservation(cls: ClassWithReservation) {
    const method = cls.is_reserved ? 'DELETE' : 'POST';
    const res = await fetch(`/api/classes/${cls.id}/${cls.is_reserved ? 'cancel' : 'reserve'}`, { method });
    if (!res.ok) {
      showToast('Não foi possível atualizar reserva.');
      return;
    }
    showToast(cls.is_reserved ? 'Reserva cancelada.' : 'Reserva confirmada!');
    onRefresh();
  }

  if (!classes) return <p className="text-sm text-slate-400">Carregando agenda...</p>;

  return (
    <div className="space-y-3">
      {classes.map((cls) => (
        <article key={cls.id} className="border border-slate-800 rounded-xl p-3 space-y-2">
          <header className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base">{cls.title}</h3>
              <p className="text-xs text-slate-400">{formatDate(cls.start_time)}</p>
            </div>
            <span className="text-xs text-slate-300">
              {cls.reservations_count}/{cls.capacity} vagas
            </span>
          </header>
          <p className="text-xs text-slate-300">{cls.description}</p>
          <button
            onClick={() => toggleReservation(cls)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              cls.is_reserved ? 'border border-slate-600' : 'bg-primary text-slate-950'
            }`}
          >
            {cls.is_reserved ? 'Cancelar' : 'Reservar'}
          </button>
        </article>
      ))}
    </div>
  );
}

function GraduacaoTab({ summary }: { summary?: StudentPortalSummary }) {
  if (!summary) return <p className="text-sm text-slate-400">Carregando graduação...</p>;
  const { rank } = summary;
  return (
    <div className="space-y-3 text-sm">
      <section>
        <h3 className="text-lg font-semibold">Faixa atual</h3>
        <p>
          {rank.belt} ({rank.degree_int}º grau)
        </p>
      </section>
      <section className="space-y-1">
        <h4 className="font-semibold">Próximos passos</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-300">
          {rank.nextBelt ? <li>Próxima faixa: {rank.nextBelt}</li> : <li>Você já está no topo!</li>}
          {rank.requiredSkills.map((skill) => (
            <li key={skill.name}>
              {skill.name} - {skill.completed ? '✔️' : '❌'}
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-1">
        <h4 className="font-semibold">Histórico</h4>
        <ul className="space-y-1">
          {rank.history.map((item) => (
            <li key={item.changed_at} className="text-xs text-slate-400">
              {formatDate(item.changed_at)} — {item.belt} ({item.degree_int}º grau)
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'PAID':
      return 'bg-success/20 text-success';
    case 'LATE':
      return 'bg-danger/20 text-danger';
    case 'PROOF_UPLOADED':
      return 'bg-blue-500/20 text-blue-300';
    case 'IN_REVIEW':
      return 'bg-purple-500/20 text-purple-300';
    default:
      return 'bg-slate-800 text-slate-200';
  }
}
