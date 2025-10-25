'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { InvoiceWithPix } from '@/features/billing/types';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { showToast } from '@/components/toaster';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Erro na API');
  return res.json();
});

const columns: Array<{ key: string; title: string; status: string }> = [
  { key: 'PENDING', title: 'Pendentes', status: 'PENDING' },
  { key: 'PROOF_UPLOADED', title: 'Comprovantes', status: 'PROOF_UPLOADED' },
  { key: 'IN_REVIEW', title: 'Em revisão', status: 'IN_REVIEW' },
  { key: 'PAID', title: 'Pagas', status: 'PAID' },
];

const REVIEW_COLUMNS = new Set(['PROOF_UPLOADED', 'IN_REVIEW']);

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState<string>('');
  const { data, mutate } = useSWR<InvoiceWithPix[]>(`/api/invoices${filter ? `?status=${filter}` : ''}`, fetcher);

  const grouped = useMemo(() => {
    const map = new Map<string, InvoiceWithPix[]>();
    for (const column of columns) {
      map.set(column.status, []);
    }
    for (const invoice of data ?? []) {
      const columnKey = REVIEW_COLUMNS.has(invoice.review_status) ? invoice.review_status : invoice.status;
      const list = map.get(columnKey) ?? [];
      list.push(invoice);
      map.set(columnKey, list);
    }
    return map;
  }, [data]);

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const response = await fetch(`/api/invoices/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      showToast('Erro ao atualizar invoice');
      return;
    }
    showToast('Atualizado!');
    mutate();
  }

  async function markPaid(id: string) {
    const response = await fetch(`/api/invoices/${id}/pay`, { method: 'POST' });
    if (!response.ok) {
      showToast('Erro ao confirmar pagamento');
      return;
    }
    showToast('Pagamento confirmado');
    mutate();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hub de Pagamentos</h1>
          <p className="text-slate-300 text-sm">Fluxo de aprovação manual dos comprovantes Pix.</p>
        </div>
        <div className="flex gap-2">
          <FilterButton value="" current={filter} onChange={setFilter} label="Todos" />
          <FilterButton value="PENDING" current={filter} onChange={setFilter} label="Pendentes" />
          <FilterButton value="PAID" current={filter} onChange={setFilter} label="Pagas" />
        </div>
      </header>
      <section className="grid md:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.key} className="border border-slate-800 rounded-xl p-3 bg-slate-900/70 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {column.title}
            </h2>
            <div className="space-y-3">
              {(grouped.get(column.status) ?? []).map((invoice) => (
                <article key={invoice.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2">
                  <header className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{invoice.student?.name ?? 'Aluno'}</p>
                      <p className="text-xs text-slate-400">{formatDate(invoice.due_date)}</p>
                    </div>
                    <span className="text-xs font-semibold">{formatCurrency(invoice.amount_numeric)}</span>
                  </header>
                  {invoice.invoice_pix?.proof_url && (
                    <a href={invoice.invoice_pix.proof_url} target="_blank" className="text-xs text-primary underline">
                      Ver comprovante
                    </a>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => markPaid(invoice.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-success/20 text-success text-xs font-semibold"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleAction(invoice.id, 'reject')}
                      className="flex-1 px-3 py-2 rounded-lg bg-danger/20 text-danger text-xs font-semibold"
                    >
                      Rejeitar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function FilterButton({ value, current, onChange, label }: { value: string; current: string; onChange: (value: string) => void; label: string }) {
  const isActive = value === current;
  return (
    <button
      onClick={() => onChange(value)}
      className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
        isActive ? 'border-primary text-primary' : 'border-slate-700 text-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
