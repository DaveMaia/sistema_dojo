export interface ClassWithReservation {
  id: string;
  academy_id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  instructor_user_id: string | null;
  capacity: number;
  reservations_count: number;
  is_reserved: boolean;
}
