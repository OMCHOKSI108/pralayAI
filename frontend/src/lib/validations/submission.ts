import { z } from 'zod';

const urlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));

export const submissionSchema = z.object({
  student_project_id: z.string().uuid('Invalid project ID'),
  github_url: urlSchema,
  deployment_url: urlSchema,
  video_url: urlSchema,
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
