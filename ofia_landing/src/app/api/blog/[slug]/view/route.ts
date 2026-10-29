import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Post slug or ID is required' }, { status: 400 });
    }

    const rawUsersApi = process.env.USERS_API_URL || process.env.NEXT_PUBLIC_USERS_API || '';
    const cleanUsersApi = rawUsersApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

    if (cleanUsersApi && cleanUsersApi.startsWith('http')) {
      try {
        const res = await fetch(`${cleanUsersApi}/api/v1/cms/blog/posts/${encodeURIComponent(slug)}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (err: any) {
        console.warn('Microservice view increment error, falling back to admin proxy:', err.message);
      }
    }

    // Try admin proxy if users API is unreachable
    const rawAdminApi = process.env.NEXT_PUBLIC_ADMIN_API || '';
    const cleanAdminApi = rawAdminApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

    if (cleanAdminApi && cleanAdminApi.startsWith('http')) {
      try {
        const res = await fetch(`${cleanAdminApi}/api/v1/cms/blog/posts/${encodeURIComponent(slug)}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (err: any) {
        console.warn('Admin API view increment error:', err.message);
      }
    }

    return NextResponse.json({ success: true, message: 'View recorded' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to record view count: ' + error.message },
      { status: 500 }
    );
  }
}
