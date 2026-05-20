-- ============================================================
-- Hellware — Full Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- ========================
-- ENUM TYPES
-- ========================

CREATE TYPE user_role AS ENUM ('student', 'mentor', 'reviewer', 'admin');
CREATE TYPE domain_type AS ENUM ('ai_ml', 'fullstack', 'cybersecurity', 'devops', 'automation', 'apis');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE difficulty_type AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE student_project_status AS ENUM ('assigned', 'in_progress', 'submitted', 'completed');
CREATE TYPE submission_status AS ENUM ('pending', 'under_review', 'approved', 'changes_requested', 'rejected');
CREATE TYPE referral_status AS ENUM ('pending', 'active');
CREATE TYPE contribution_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE resource_category AS ENUM ('dsa', 'resume', 'git', 'deployment', 'interview', 'ai_prompts', 'system_design');

-- ========================
-- TABLES
-- ========================

-- users (mirrors auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- student_profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  college TEXT,
  graduation_year INTEGER,
  skills TEXT[],
  github_url TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  domain domain_type,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  is_profile_public BOOLEAN DEFAULT TRUE,
  contribution_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  graduation_year INTEGER,
  domain domain_type NOT NULL,
  skills TEXT[],
  github_url TEXT,
  linkedin_url TEXT,
  resume_url TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  review_note TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  domain domain_type NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[],
  difficulty difficulty_type NOT NULL DEFAULT 'intermediate',
  milestones JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- student_projects
CREATE TABLE student_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  status student_project_status NOT NULL DEFAULT 'assigned'
);

-- milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_project_id UUID NOT NULL REFERENCES student_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);

-- submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_project_id UUID NOT NULL REFERENCES student_projects(id) ON DELETE CASCADE,
  github_url TEXT,
  deployment_url TEXT,
  video_url TEXT,
  notes TEXT,
  screenshot_urls TEXT[],
  status submission_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  feedback TEXT,
  status submission_status NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cert_id TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url TEXT
);

-- badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  trigger_condition TEXT
);

-- student_badges
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category resource_category NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  is_gated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES users(id),
  status referral_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- contributions
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status contribution_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- leaderboard_scores
CREATE TABLE leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  milestones_completed INTEGER NOT NULL DEFAULT 0,
  submissions_approved INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================
-- AUTH TRIGGER: auto-create users row on signup
-- ========================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'student');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- ROW LEVEL SECURITY
-- ========================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- users: read own, admins read all
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admins_read_all_users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- student_profiles: public readable, owners update, admins full access
CREATE POLICY "public_profiles_readable" ON student_profiles
  FOR SELECT USING (is_profile_public = TRUE);

CREATE POLICY "owners_update_profile" ON student_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "admins_read_all_profiles" ON student_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_update_all_profiles" ON student_profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- applications: applicants read own, admins/reviewers full access
CREATE POLICY "applicants_read_own" ON applications
  FOR SELECT USING (email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "admins_reviewers_manage_applications" ON applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'reviewer'))
  );

-- student_projects: students read own, admins/mentors read all
CREATE POLICY "students_read_own_projects" ON student_projects
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "admins_mentors_read_all_projects" ON student_projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'mentor'))
  );

-- submissions: students insert/read own, reviewers/admins full access
CREATE POLICY "students_manage_own_submissions" ON submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM student_projects
      WHERE student_projects.id = submissions.student_project_id
      AND student_projects.student_id = auth.uid()
    )
  );

CREATE POLICY "reviewers_admins_read_submissions" ON submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'reviewer'))
  );

CREATE POLICY "reviewers_admins_update_submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'reviewer'))
  );

-- notifications: users read/update own
CREATE POLICY "users_manage_own_notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- contributions: students read own, admins read all
CREATE POLICY "students_read_own_contributions" ON contributions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "admins_read_all_contributions" ON contributions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- audit_logs: only admins read, service role inserts
CREATE POLICY "admins_read_audit_logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- resources: all authenticated read non-gated
CREATE POLICY "authenticated_read_resources" ON resources
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (is_gated = FALSE OR auth.uid() IS NOT NULL)
  );

-- leaderboard_scores: public read
CREATE POLICY "public_read_leaderboard" ON leaderboard_scores
  FOR SELECT USING (TRUE);

-- ========================
-- STORAGE BUCKETS
-- ========================

INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', FALSE);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-screenshots', 'project-screenshots', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', FALSE);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

-- resumes: private, service role only
CREATE POLICY "resumes_service_role_only" ON storage.objects
  FOR ALL USING (bucket_id = 'resumes');

-- project-screenshots: public read, authenticated upload
CREATE POLICY "screenshots_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-screenshots');

CREATE POLICY "screenshots_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-screenshots' AND auth.role() = 'authenticated'
  );

-- certificates: private, service role only
CREATE POLICY "certificates_service_role_only" ON storage.objects
  FOR ALL USING (bucket_id = 'certificates');

-- avatars: public read, authenticated upload own
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

-- ========================
-- HELPER FUNCTION: recalculate leaderboard score
-- ========================

CREATE OR REPLACE FUNCTION recalculate_leaderboard_score(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestones INTEGER;
  v_submissions INTEGER;
  v_score INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_milestones
  FROM milestones m
  JOIN student_projects sp ON sp.id = m.student_project_id
  WHERE sp.student_id = p_student_id AND m.is_completed = TRUE;

  SELECT COUNT(*) INTO v_submissions
  FROM submissions s
  JOIN student_projects sp ON sp.id = s.student_project_id
  WHERE sp.student_id = p_student_id AND s.status = 'approved';

  v_score := (v_milestones * 10) + (v_submissions * 50);

  INSERT INTO leaderboard_scores (student_id, score, milestones_completed, submissions_approved, updated_at)
  VALUES (p_student_id, v_score, v_milestones, v_submissions, NOW())
  ON CONFLICT (student_id) DO UPDATE SET
    score = EXCLUDED.score,
    milestones_completed = EXCLUDED.milestones_completed,
    submissions_approved = EXCLUDED.submissions_approved,
    updated_at = EXCLUDED.updated_at;
END;
$$;
