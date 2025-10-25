export interface AttendanceTicket {
  qr_svg: string;
  jti: string;
  expires_at: string;
}

export interface Attendance {
  id: string;
  academy_id: number;
  student_id: string;
  class_date: string;
  class_type: string;
  instructor_user_id: string | null;
  source: 'QR' | 'MANUAL';
  jti: string;
  created_at: string;
}
