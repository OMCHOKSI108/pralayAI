import { z } from 'zod';

export const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  college: z.string().min(3).optional(),
  graduation_year: z.coerce.number().int().min(2020).max(2030).optional(),
  skills: z.array(z.string()).optional(),
  github_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  domain: z.enum(['ai_ml', 'fullstack', 'cybersecurity', 'devops', 'automation', 'apis']).optional(),
  is_profile_public: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
