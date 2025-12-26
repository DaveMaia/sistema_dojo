'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function updateStudentClass(studentId: string, classId: string | null) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('students')
    .update({ class_id: classId })
    .eq('id', studentId);

  if (error) {
    throw new Error('Não foi possível atualizar a turma do aluno.');
  }

  revalidatePath('/dashboard/admin');
}
