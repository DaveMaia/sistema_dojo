import { randomUUID } from 'node:crypto';

export function generateTxId(invoiceId: string) {
  const base = invoiceId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${base}${timestamp}`.slice(0, 25);
}

export function generateJti() {
  return randomUUID();
}
