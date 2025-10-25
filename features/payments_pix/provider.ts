import { z } from 'zod';

export type PixChargeStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED';

export interface PixProviderCharge {
  providerChargeId: string;
  txid: string;
  e2eid?: string | null;
}

export interface PixWebhookValidation {
  valid: boolean;
  eventId: string;
  providerChargeId: string;
  status: PixChargeStatus;
  amount: number;
  txid: string;
  e2eid?: string | null;
}

export interface PixProvider {
  createCharge(invoiceId: string, amount: number): Promise<PixProviderCharge>;
  getChargeStatus(providerChargeId: string): Promise<PixChargeStatus>;
  verifyWebhook(request: Request): Promise<PixWebhookValidation>;
  signatureHeaderName(): string;
}

export const mockWebhookSchema = z.object({
  event_id: z.string(),
  provider_charge_id: z.string(),
  amount: z.number(),
  status: z.enum(['PENDING', 'PAID', 'EXPIRED', 'CANCELED']),
  txid: z.string(),
  e2eid: z.string().optional(),
});

export class PixProviderMock implements PixProvider {
  async createCharge(invoiceId: string, amount: number): Promise<PixProviderCharge> {
    const txid = `MCK${invoiceId}`.slice(0, 25);
    return {
      providerChargeId: `mock-${invoiceId}`,
      txid,
    };
  }

  async getChargeStatus(): Promise<PixChargeStatus> {
    return 'PENDING';
  }

  async verifyWebhook(request: Request): Promise<PixWebhookValidation> {
    const payload = await request.json();
    const parsed = mockWebhookSchema.parse(payload);
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { valid: false, eventId: parsed.event_id, providerChargeId: parsed.provider_charge_id, status: parsed.status, amount: parsed.amount, txid: parsed.txid, e2eid: parsed.e2eid };
    }
    const secret = process.env.WEBHOOK_SECRET ?? '';
    const valid = authHeader.replace('Bearer ', '') === secret;
    return {
      valid,
      eventId: parsed.event_id,
      providerChargeId: parsed.provider_charge_id,
      status: parsed.status,
      amount: parsed.amount,
      txid: parsed.txid,
      e2eid: parsed.e2eid,
    };
  }

  signatureHeaderName(): string {
    return 'authorization';
  }
}

export function resolvePixProvider(): PixProvider {
  const mode = process.env.PIX_MODE ?? 'STATIC';
  if (mode !== 'PROVIDER') {
    return new PixProviderMock();
  }

  switch (process.env.PIX_PROVIDER) {
    case 'GERENCIANET':
    case 'MERCADOPAGO':
    case 'ASAAS':
    case 'STRIPE':
      // Future implementation hooks.
      return new PixProviderMock();
    default:
      return new PixProviderMock();
  }
}
