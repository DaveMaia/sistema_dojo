'use client';

import { ChangeEvent } from 'react';
import useSWR from 'swr';
import { showToast } from '@/components/toaster';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { StudentPortalSummary } from '@/features/students/types';
import { InvoiceWithPix } from '@/features/billing/types';
import { Note } from '@/features/notes/types';
import { TournamentSummary } from '@/features/tournament_se/types';
import { AttendanceTicket } from '@/features/attendance/types';
import { ClassWithReservation } from '@/features/schedule/types';
import { PixCopy } from './pix-copy';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Falha na requisição');
  return res.json();
});

export function useStudentPortalData() {
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

  return {
    me,
    notes,
    invoices,
    refreshInvoices,
    tournament,
    classes,
    refreshClasses,
    ticket,
    refreshTicket,
  };
}

export function MeuDojoSection() {
  const { me, notes, classes, refreshClasses, ticket, refreshTicket, tournament } = useStudentPortalData();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Meu Dojo</p>
        <h1 className="mt-2 text-2xl font-semibold">Status atual</h1>
        <p className="mt-2 text-sm text-slate-400">
          {me ? `${me.rank.belt} • ${me.rank.degree_int}º grau` : 'Carregando faixa...'}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Próximo treino</p>
          {classes?.[0] ? (
            <>
              <p className="mt-2 text-lg font-semibold">{classes[0].title}</p>
              <p className="text-sm text-slate-400">{formatDate(classes[0].start_time)}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Sem treinos agendados.</p>
          )}
          <button
            onClick={async () => {
              const response = await fetch('/api/attendance/ticket', { method: 'POST' });
              if (response.ok) {
                showToast('QR atualizado!');
                refreshTicket();
              } else {
                showToast('Não foi possível gerar o QR agora.');
              }
            }}
            className="mt-3 w-full rounded-full bg-primary px-3 py-2 text-sm font-semibold text-slate-950"
          >
            Gerar QR de check-in
          </button>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Avisos do mestre</p>
          {notes?.length ? (
            <p className="mt-2 text-sm text-slate-300">{notes[0].title}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Nenhum recado novo.</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Torneio</p>
          {tournament?.tournament ? (
            <p className="mt-2 text-sm text-slate-300">{tournament.tournament.name}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Nenhum torneio ativo.</p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="text-base font-semibold">Presença</h2>
        {ticket?.qr_svg ? (
          <div className="rounded-xl bg-white p-3" dangerouslySetInnerHTML={{ __html: ticket.qr_svg }} />
        ) : (
          <p className="text-sm text-slate-400">Nenhum QR ativo. Gere agora para check-in.</p>
        )}
        {ticket?.expires_at ? (
          <p className="text-xs text-slate-500">Expira em {formatDate(ticket.expires_at)}</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Agenda</h2>
        {classes ? (
          <AgendaList classes={classes} onRefresh={refreshClasses} />
        ) : (
          <p className="text-sm text-slate-400">Carregando agenda...</p>
        )}
      </section>
    </div>
  );
}

export function EvolucaoSection() {
  const { me } = useStudentPortalData();
  if (!me) {
    return <p className="text-sm text-slate-400">Carregando ficha...</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Evolução</p>
        <h1 className="mt-2 text-2xl font-semibold">Ficha técnica</h1>
        <p className="mt-2 text-sm text-slate-400">Acompanhe sua progressão e requisitos.</p>
      </section>
      <GraduacaoTab summary={me} />
    </div>
  );
}

export function PagamentosSection() {
  const { invoices, refreshInvoices } = useStudentPortalData();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Arsenal</p>
        <h1 className="mt-2 text-2xl font-semibold">Portal de Pagamentos</h1>
        <p className="mt-2 text-sm text-slate-400">Mensalidades e eventos concentrados em um lugar.</p>
      </section>
      <PagamentosTab invoices={invoices} onRefresh={refreshInvoices} />
    </div>
  );
}

export function RecadosSection() {
  const { notes } = useStudentPortalData();
  return <RecadosTab notes={notes} />;
}

function AgendaList({
  classes,
  onRefresh,
}: {
  classes: ClassWithReservation[];
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

  if (!classes.length) return <p className="text-sm text-slate-400">Nenhuma aula disponível.</p>;

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
            <PixCopy payload={invoice.invoice_pix.brcode_payload} />
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

function GraduacaoTab({ summary }: { summary: StudentPortalSummary }) {
  const { rank } = summary;
  return (
    <div className="space-y-3 text-sm rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
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
