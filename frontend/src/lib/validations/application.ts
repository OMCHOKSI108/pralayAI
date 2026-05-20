import { z } from 'zod';

const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+$/;
const linkedinUrlRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+$/;

export const applicationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be a 10-digit Indian number'),
  college: z.string().min(3, 'College name must be at least 3 characters'),
  graduation_year: z.coerce.number().int().min(2020).max(2030),
  domain: z.enum(['ai_ml', 'fullstack', 'cybersecurity', 'devops', 'automation', 'apis']),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  github_url: z.string().regex(githubUrlRegex, 'Invalid GitHub URL').optional().or(z.literal('')),
  linkedin_url: z.string().regex(linkedinUrlRegex, 'Invalid LinkedIn URL').optional().or(z.literal('')),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
