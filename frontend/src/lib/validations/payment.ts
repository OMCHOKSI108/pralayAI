import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.enum(['149', '199', '299'], 'Amount must be 149, 199, or 299'),
});

export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>;
