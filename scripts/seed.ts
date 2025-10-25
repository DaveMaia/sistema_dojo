import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para usar o seed.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log('Inserindo seeds básicas...');
  const { data: academy1, error: academyError } = await supabase
    .from('academies')
    .insert({ name: 'Dojo Norte', owner_user_id: randomUUID() })
    .select('id')
    .single();
  if (academyError) throw academyError;
  const { data: academy2, error: academy2Error } = await supabase
    .from('academies')
    .insert({ name: 'Dojo Sul', owner_user_id: randomUUID() })
    .select('id')
    .single();
  if (academy2Error) throw academy2Error;
  const academies = [academy1.id, academy2.id];
  for (const academyId of academies) {
    const adminId = randomUUID();
    await supabase.from('profiles').upsert({ user_id: adminId, academy_id: academyId, role: 'ADMIN' });
    const instructorId = randomUUID();
    await supabase.from('profiles').upsert({ user_id: instructorId, academy_id: academyId, role: 'INSTRUCTOR' });
    const students = Array.from({ length: 5 }).map(() => ({
      academy_id: academyId,
      name: `Aluno ${Math.random().toString(36).slice(2, 6)}`,
      email: `${Math.random().toString(36).slice(2, 8)}@dojo.local`,
      phone: '+559199999999',
      status: 'ACTIVE',
    }));
    const { data: insertedStudents } = await supabase.from('students').insert(students).select('id');
    await supabase.from('plans').insert({ academy_id: academyId, name: 'Plano Mensal', price_numeric: 14900 });
    if (insertedStudents) {
      for (const student of insertedStudents) {
        await supabase.from('invoices').insert({
          academy_id: academyId,
          student_id: student.id,
          due_date: new Date().toISOString().slice(0, 10),
          amount_numeric: 14900,
        });
      }
    }
    await supabase.from('payment_settings').insert({ academy_id: academyId, pix_key: '', pix_receiver_name: '', pix_city: '' });
  }
  console.log('Seeds concluídas.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
