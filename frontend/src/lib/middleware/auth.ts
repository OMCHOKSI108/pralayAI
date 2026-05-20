import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type UserRole = 'student' | 'mentor' | 'reviewer' | 'admin';

export async function requireAuth(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return { user };
}

export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  const auth = await requireAuth(request);
  if ('json' in auth) return auth;

  const supabase = createServerClient();
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (!userData || !allowedRoles.includes(userData.role as UserRole)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: insufficient permissions' },
      { status: 403 }
    );
  }

  return { user: auth.user, role: userData.role };
}

export async function requireAdmin(request: NextRequest) {
  return requireRole(request, ['admin']);
}

export async function requireReviewer(request: NextRequest) {
  return requireRole(request, ['admin', 'reviewer']);
}

export async function requireStudent(request: NextRequest) {
  return requireRole(request, ['student']);
}
