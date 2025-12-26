'use client';

import { useMemo, useState, useTransition } from 'react';
import { updateStudentClass } from '../actions';

interface ClassOption {
  id: string;
  title: string | null;
}

export interface StudentRow {
  id: string;
  name: string;
  belt: string;
  classId: string | null;
  classTitle: string;
  paymentStatus: 'ADIMPLENTE' | 'INADIMPLENTE';
}

interface StudentsTableProps {
  students: StudentRow[];
  classes: ClassOption[];
}

const paymentFilters = ['TODOS', 'ADIMPLENTE', 'INADIMPLENTE'] as const;

export function StudentsTable({ students, classes }: StudentsTableProps) {
  const [paymentFilter, setPaymentFilter] = useState<(typeof paymentFilters)[number]>('TODOS');
  const [beltFilter, setBeltFilter] = useState('TODAS');
  const [classFilter, setClassFilter] = useState('TODAS');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const beltOptions = useMemo(() => {
    const belts = new Set(students.map((student) => student.belt));
    return ['TODAS', ...Array.from(belts)];
  }, [students]);

  const classOptions = useMemo(() => {
    const options = classes.map((cls) => ({ id: cls.id, title: cls.title ?? 'Turma sem título' }));
    return [{ id: 'TODAS', title: 'Todas as turmas' }, ...options];
  }, [classes]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesPayment =
        paymentFilter === 'TODOS' || student.paymentStatus === paymentFilter;
      const matchesBelt = beltFilter === 'TODAS' || student.belt === beltFilter;
      const matchesClass =
        classFilter === 'TODAS' || student.classId === classFilter;
      return matchesPayment && matchesBelt && matchesClass;
    });
  }, [students, paymentFilter, beltFilter, classFilter]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs text-slate-400">
          Status de Pagamento
          <select
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2 text-sm"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value as (typeof paymentFilters)[number])}
          >
            {paymentFilters.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Faixa
          <select
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2 text-sm"
            value={beltFilter}
            onChange={(event) => setBeltFilter(event.target.value)}
          >
            {beltOptions.map((belt) => (
              <option key={belt} value={belt}>
                {belt}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Turma
          <select
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2 text-sm"
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
          >
            {classOptions.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message ? <p className="text-xs text-slate-400">{message}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Faixa</th>
              <th className="px-4 py-3">Status de Pagamento</th>
              <th className="px-4 py-3">Turma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="bg-slate-950/40">
                <td className="px-4 py-3 font-medium">{student.name}</td>
                <td className="px-4 py-3">{student.belt}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      student.paymentStatus === 'ADIMPLENTE'
                        ? 'bg-success/20 text-success'
                        : 'bg-danger/20 text-danger'
                    }`}
                  >
                    {student.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs"
                    value={student.classId ?? ''}
                    disabled={isPending}
                    onChange={(event) => {
                      const value = event.target.value || null;
                      startTransition(async () => {
                        setMessage(null);
                        try {
                          await updateStudentClass(student.id, value);
                          setMessage('Turma atualizada com sucesso.');
                        } catch {
                          setMessage('Erro ao atualizar turma.');
                        }
                      });
                    }}
                  >
                    <option value="">Sem turma</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.title ?? 'Turma sem título'}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!filteredStudents.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Nenhum aluno encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
