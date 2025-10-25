export type InvoiceStatus = 'PENDING' | 'PAID' | 'LATE';
export type InvoiceReviewStatus = 'NONE' | 'PROOF_UPLOADED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Invoice {
  id: string;
  academy_id: number;
  student_id: string;
  due_date: string;
  amount_numeric: number;
  status: InvoiceStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  review_status: InvoiceReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_reason: string | null;
}

export interface InvoicePix {
  id: string;
  academy_id: number;
  invoice_id: string;
  txid: string;
  brcode_payload: string;
  qr_svg: string | null;
  status: 'AWAITING' | 'PAID_MANUAL';
  proof_url: string | null;
  created_at: string;
}

export interface InvoiceWithPix extends Invoice {
  student?: {
    id: string;
    name: string;
  };
  invoice_pix?: InvoicePix | null;
}
