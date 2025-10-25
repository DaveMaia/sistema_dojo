export interface Student {
  id: string;
  academy_id: number;
  name: string;
  email: string;
  phone: string | null;
  belt: string | null;
  emergency_contact_name: string | null;
  emergency_phone: string | null;
  health_notes: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  photo_url: string | null;
  created_at: string;
}

export interface StudentRankSummary {
  belt: string;
  degree_int: number;
  nextBelt?: string | null;
  requiredSkills: Array<{ name: string; completed: boolean }>;
  history: Array<{ belt: string; degree_int: number; changed_at: string }>;
}

export interface StudentPortalSummary {
  student: Student;
  academy: {
    id: number;
    name: string;
  };
  rank: StudentRankSummary;
}
