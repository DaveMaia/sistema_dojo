import { formatDate } from '@/lib/utils/format';

interface StaffClass {
  id: string;
  title: string | null;
  start_time: string | null;
}

interface InstructorProfile {
  id: string;
  label: string;
  phone: string | null;
  classes: StaffClass[];
}

interface StaffGridProps {
  instructors: InstructorProfile[];
}

export function StaffGrid({ instructors }: StaffGridProps) {
  if (!instructors.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        Nenhum instrutor cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {instructors.map((instructor) => (
        <article key={instructor.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <header className="space-y-1">
            <h3 className="text-base font-semibold">{instructor.label}</h3>
            <p className="text-xs text-slate-400">Contato: {instructor.phone ?? 'Não informado'}</p>
          </header>
          <div className="mt-4 space-y-2">
            {instructor.classes.length ? (
              instructor.classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-xs">
                  <span>{cls.title ?? 'Turma sem título'}</span>
                  <span className="text-slate-400">
                    {cls.start_time ? formatDate(cls.start_time) : 'Horário pendente'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Sem turmas associadas.</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
