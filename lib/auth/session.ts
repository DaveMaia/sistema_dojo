import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

export interface SessionProfile {
  user_id: string;
  academy_id: number | null;
  role: 'ADMIN' | 'INSTRUCTOR' | 'ATHLETE';
  email: string;
}

export async function requireSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('academy_id, role')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!profile) {
    const service = createSupabaseServiceClient();
    await service.from('profiles').upsert({ user_id: session.user.id, role: 'ATHLETE' });
    return {
      user_id: session.user.id,
      academy_id: null,
      role: 'ATHLETE',
      email: session.user.email ?? '',
    } satisfies SessionProfile;
  }

  return {
    user_id: session.user.id,
    academy_id: profile.academy_id,
    role: profile.role,
    email: session.user.email ?? '',
  } as SessionProfile;
}
