import { z } from 'zod';

export const paymentSettingsSchema = z.object({
  pix_key: z.string().min(3),
  pix_receiver_name: z.string().min(3),
  pix_city: z.string().min(2),
  description_prefix: z.string().optional(),
});

export const pixChargeSchema = z.object({
  invoiceId: z.string().uuid(),
});
