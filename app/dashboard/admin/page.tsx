import { format, endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';
import { FinanceDashboard } from './ui/finance-dashboard';
import { StaffGrid } from './ui/staff-grid';
import { StudentsTable } from './ui/students-table';

const MONTH_COUNT = 6;

function toDate(value?: string | null) {
  return value ? new Date(value) : null;
}

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();

  const [
    { data: payments },
    { data: invoices },
    { data: subscriptions },
    { data: students },
    { data: classes },
    { data: instructors },
  ] = await Promise.all([
    supabase
      .from('payments')
      .select('id, amount_numeric, status, billing_category, paid_at, created_at, student_id'),
    supabase.from('invoices').select('id, amount_numeric, status, due_date, student_id'),
    supabase.from('subscriptions').select('id, status, end_date'),
    supabase.from('students').select('id, name, belt, status, class_id, created_at'),
    supabase.from('classes').select('id, title, start_time, instructor_user_id'),
    supabase.from('profiles').select('user_id, phone, role').eq('role', 'INSTRUCTOR'),
  ]);

  const now = new Date();
  const months = Array.from({ length: MONTH_COUNT }, (_, index) =>
    startOfMonth(subMonths(now, MONTH_COUNT - 1 - index)),
  );

  const paymentsList = payments ?? [];
  const invoicesList = invoices ?? [];
  const subscriptionsList = subscriptions ?? [];
  const studentsList = students ?? [];
  const classesList = classes ?? [];
  const instructorsList = instructors ?? [];

  const mrrValue = paymentsList
    .filter((payment) =>
      payment.billing_category === 'MEMBERSHIP' &&
      payment.status === 'PAID' &&
      toDate(payment.paid_at)?.getMonth() === now.getMonth() &&
      toDate(payment.paid_at)?.getFullYear() === now.getFullYear(),
    )
    .reduce((sum, payment) => sum + (payment.amount_numeric ?? 0), 0);

  const dueInvoices = invoicesList.filter((invoice) => {
    const dueDate = toDate(invoice.due_date);
    return dueDate ? dueDate <= now : false;
  });
  const delinquentInvoices = dueInvoices.filter((invoice) =>
    ['LATE', 'PENDING'].includes(invoice.status ?? ''),
  );
  const delinquencyRate = dueInvoices.length
    ? (delinquentInvoices.length / dueInvoices.length) * 100
    : 0;

  const activeSubscriptions = subscriptionsList.filter((item) => item.status === 'ACTIVE');
  const cancelledSubscriptions = subscriptionsList.filter((item) => {
    const endDate = toDate(item.end_date);
    if (!endDate) return false;
    const diffDays = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);
    return item.status === 'CANCELLED' && diffDays <= 30;
  });
  const churnRate = activeSubscriptions.length + cancelledSubscriptions.length
    ? (cancelledSubscriptions.length / (activeSubscriptions.length + cancelledSubscriptions.length)) * 100
    : 0;

  const growthData = months.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    const monthKey = format(monthStart, 'MMM/yy');
    const monthlyPayments = paymentsList.filter((payment) => {
      const referenceDate = toDate(payment.paid_at) ?? toDate(payment.created_at);
      return (
        payment.billing_category === 'MEMBERSHIP' &&
        referenceDate &&
        referenceDate >= monthStart &&
        referenceDate <= monthEnd
      );
    });
    const revenue = monthlyPayments.reduce((sum, payment) => sum + (payment.amount_numeric ?? 0), 0) / 100;
    const newStudents = studentsList.filter((student) => {
      const createdAt = toDate(student.created_at);
      return createdAt ? createdAt >= monthStart && createdAt <= monthEnd : false;
    }).length;

    return {
      month: monthKey,
      revenue,
      students: newStudents,
    };
  });

  const classesById = new Map(classesList.map((item) => [item.id, item]));
  const invoiceByStudent = new Map<string, Array<{ status: string | null; due_date: string | null }>>();
  invoicesList.forEach((invoice) => {
    if (!invoice.student_id) return;
    const list = invoiceByStudent.get(invoice.student_id) ?? [];
    list.push({ status: invoice.status ?? null, due_date: invoice.due_date ?? null });
    invoiceByStudent.set(invoice.student_id, list);
  });

  const studentRows = studentsList.map((student) => {
    const classData = student.class_id ? classesById.get(student.class_id) : null;
    const invoicesForStudent = invoiceByStudent.get(student.id) ?? [];
    const hasLateInvoice = invoicesForStudent.some((invoice) =>
      ['LATE', 'PENDING'].includes(invoice.status ?? ''),
    );

    return {
      id: student.id,
      name: student.name,
      belt: student.belt ?? 'Sem faixa',
      classId: student.class_id ?? null,
      classTitle: classData?.title ?? 'Sem turma',
      paymentStatus: hasLateInvoice ? 'INADIMPLENTE' : 'ADIMPLENTE',
    };
  });

  const instructorProfiles = instructorsList.map((instructor) => {
    const instructorClasses = classesList.filter(
      (cls) => cls.instructor_user_id === instructor.user_id,
    );
    return {
      id: instructor.user_id,
      label: `Instrutor ${String(instructor.user_id).slice(0, 8)}`,
      phone: instructor.phone,
      classes: instructorClasses,
    };
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Gestão Estratégica</h1>
        <p className="text-sm text-slate-400">
          Visão executiva do dojô com indicadores financeiros, churn e dados para decisões rápidas.
        </p>
      </header>

      <FinanceDashboard
        metrics={[
          { label: 'MRR (Mensalidade)', value: formatCurrency(mrrValue), trend: 'Mensalidade não inclui torneios.' },
          { label: 'Taxa de Inadimplência', value: `${delinquencyRate.toFixed(1)}%`, trend: 'Baseado em faturas vencidas.' },
          { label: 'Churn Rate', value: `${churnRate.toFixed(1)}%`, trend: 'Cancelamentos nos últimos 30 dias.' },
        ]}
        growthData={growthData}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Gestão de Staff e Turmas</h2>
        <StaffGrid instructors={instructorProfiles} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tabela dinâmica de alunos</h2>
        <StudentsTable students={studentRows} classes={classesList} />
      </section>
    </div>
  );
}
