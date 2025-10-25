import { describe, expect, it } from 'vitest';
import { buildPixPayload } from '@/features/payments_pix/brcode';

describe('buildPixPayload', () => {
  it('gera payload válido com crc16', () => {
    const payload = buildPixPayload({
      pixKey: 'test@pix.com',
      merchantName: 'Academia Dojo',
      merchantCity: 'Belem',
      amount: 15000,
      txid: '1234567890123456789012345'.slice(0, 25),
      description: 'Mensalidade',
    });
    expect(payload).toMatch(/6304[A-F0-9]{4}$/);
  });
});
