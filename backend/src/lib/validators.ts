import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(["STUDENT", "ADMIN", "MANAGEMENT"]).optional(),
  adminSetupToken: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const applicationSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  college: z.string().optional(),
  gradYear: z.string().optional(),
  skills: z.array(z.string()).default([])
});

export const paymentProofSchema = z.object({
  studentId: z.string().uuid(),
  amountPaid: z.coerce.number().positive(),
  transactionHash: z.string().min(4).max(120)
});

export const applicationDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "VERIFIED"])
});

export const paymentDecisionSchema = z.object({
  status: z.enum(["SUCCESS", "FAILED"]),
  rejectionReason: z.string().optional()
});
