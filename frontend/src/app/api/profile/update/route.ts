import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validations/profile';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown>;
    let avatarFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = Object.fromEntries(
        Array.from(formData.entries()).filter(([key]) => key !== 'avatar')
      );
      avatarFile = formData.get('avatar') as File | null;
    } else {
      body = await request.json();
    }

    const validation = profileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    let avatarUrl: string | undefined;
    if (avatarFile) {
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'Avatar must be an image' }, { status: 400 });
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'Avatar must be under 2MB' }, { status: 400 });
      }

      const filePath = `avatars/${user.id}-${Date.now()}.${avatarFile.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { contentType: avatarFile.type });

      if (uploadError) {
        return NextResponse.json({ success: false, error: 'Failed to upload avatar' }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
      avatarUrl = urlData.publicUrl;
    }

    const updateData: Record<string, unknown> = { ...validation.data };
    if (avatarUrl) updateData.avatar_url = avatarUrl;

    const { error: updateError } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
