import type { MetadataRoute } from 'next';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ofia.ng';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    const rawApi = process.env.USERS_API_URL || process.env.NEXT_PUBLIC_USERS_API || '';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

    let posts: any[] = [];
    if (USERS_API && USERS_API.startsWith('http')) {
      try {
        const res = await fetch(`${USERS_API}/api/v1/cms/blog/posts`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            posts = data.filter((p: any) => p.status === 'PUBLISHED');
          }
        }
      } catch {}
    }

    if (posts.length === 0) {
      const adminRaw = process.env.NEXT_PUBLIC_ADMIN_API || '';
      const ADMIN_API = adminRaw.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
      if (ADMIN_API && ADMIN_API.startsWith('http')) {
        try {
          const res = await fetch(`${ADMIN_API}/api/v1/cms/blog/posts`, {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(3000),
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              posts = data.filter((p: any) => p.status === 'PUBLISHED');
            }
          }
        } catch {}
      }
    }

    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || post.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch (error) {
    console.warn('Error generating dynamic blog sitemap:', error);
    return staticRoutes;
  }
}
