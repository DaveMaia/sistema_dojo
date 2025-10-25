export interface Note {
  id: string;
  academy_id: number;
  student_id: string;
  title: string;
  message: string;
  admin_user_id: string;
  created_at: string;
  read_at: string | null;
}
