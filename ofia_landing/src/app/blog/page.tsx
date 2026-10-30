import BlogListClient from '@/components/BlogListClient';
import type { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog & Editorial | Ofia Platform — Insights, Updates & Engineering',
  description:
    'Read the latest engineering breakthroughs, merchant playbooks, and platform updates driving the new digital economy across Nigeria and West Africa.',
  alternates: {
    canonical: 'https://ofia.ng/blog',
  },
  openGraph: {
    title: 'Ofia Journal & Engineering Blog',
    description:
      'Engineering breakthroughs, merchant commerce playbooks, and autonomous AI innovations across the Ofia multi-tenant ecosystem.',
    url: 'https://ofia.ng/blog',
    siteName: 'Ofia Platform',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
        width: 1200,
        height: 630,
        alt: 'Ofia Blog & Engineering',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ofia Journal & Engineering Blog',
    description:
      'Engineering breakthroughs, commerce playbooks, and autonomous AI innovations across the Ofia ecosystem.',
    site: '@Ofia_ng',
    images: ['https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png'],
  },
};

const SEED_FALLBACK_POSTS = [
  {
    id: 'post-seed-01',
    title: 'Unveiling Ofia: Autonomous AI Voice Intelligence & Next-Gen African Commerce',
    slug: 'unveiling-ofia-autonomous-ai-voice',
    excerpt: 'How Ofia is transforming enterprise commerce in Nigeria through autonomous voice outreach, real-time escrow, and intelligent multi-tenant workflows.',
    meta_description: 'How Ofia is transforming enterprise commerce in Nigeria through autonomous voice outreach, real-time escrow, and intelligent multi-tenant workflows.',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
    category: 'Ecosystem & AI',
    status: 'PUBLISHED',
    view_count: 1420,
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-02',
    title: 'How Ofia Digital Storefronts Bridge Offline Merchants with Escrow Commerce',
    slug: 'how-ofia-storefronts-bridge-offline-merchants',
    excerpt: 'Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.',
    meta_description: 'Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png',
    category: 'Retail & Commerce',
    status: 'PUBLISHED',
    view_count: 980,
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-03',
    title: 'Real-Time Fleet Dispatch: Scaling Nationwide Last-Mile Logistics',
    slug: 'real-time-fleet-dispatch-last-mile-logistics',
    excerpt: 'Inside Ofia dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks.',
    meta_description: 'Inside Ofia dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks.',
    cover_image: 'https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg',
    category: 'Fleet & Logistics',
    status: 'PUBLISHED',
    view_count: 1150,
    published_at: new Date().toISOString(),
  },
];

async function getBlogPosts() {
  // 1. Direct Lakebase Neon database query (highest priority & reliability)
  const dbUrl = process.env.USERS_DATABASE_URL || process.env.DATABASE_URL || '';
  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category_id, p.tags, p.status,
               p.author_id, p.author_name, p.published_at, p.created_at, p.updated_at,
               p.meta_title, p.meta_description, p.canonical_url, p.og_image, p.view_count,
               c.name as category
        FROM "BlogPost" p
        LEFT JOIN "BlogCategory" c ON p.category_id = c.id
        WHERE p.status = 'PUBLISHED'
        ORDER BY COALESCE(p.published_at, p.created_at) DESC;
      `;

      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          ...r,
          category: r.category || 'Commerce & AI',
          view_count: Number(r.view_count || 0),
        }));
      }
    } catch (dbErr) {
      console.warn('[Landing Blog] Neon DB query note:', dbErr);
    }
  }

  try {
    // 2. Try Admin API proxy (direct link to local or production admin)
    const adminRaw = process.env.NEXT_PUBLIC_ADMIN_API || '';
    const ADMIN_API = adminRaw.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    if (ADMIN_API && ADMIN_API.startsWith('http')) {
      try {
        const adminRes = await fetch(`${ADMIN_API}/api/v1/cms/blog/posts`, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(5000),
        });
        if (adminRes.ok) {
          const posts = await adminRes.json();
          if (Array.isArray(posts) && posts.length > 0) {
            const published = posts.filter((p: any) => p.status === 'PUBLISHED');
            if (published.length > 0) return published;
          }
        }
      } catch {}
    }

    // 3. Try USERS_API (microservice fallback)
    const rawApi = process.env.USERS_API_URL || process.env.NEXT_PUBLIC_USERS_API || '';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    if (USERS_API && USERS_API.startsWith('http')) {
      try {
        const [postsRes, catRes] = await Promise.all([
          fetch(`${USERS_API}/api/v1/cms/blog/posts`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(3000) }),
          fetch(`${USERS_API}/api/v1/cms/blog/categories`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(3000) })
        ]);
        
        if (postsRes.ok) {
          const posts = await postsRes.json();
          if (Array.isArray(posts) && posts.length > 0) {
            const published = posts.filter((p: any) => p.status === 'PUBLISHED');
            if (catRes.ok) {
              const categories = await catRes.json().catch(() => []);
              published.forEach((p: any) => {
                const cat = Array.isArray(categories) ? categories.find((c: any) => c.id === p.category_id) : null;
                if (cat) p.category = cat.name;
              });
            }
            if (published.length > 0) return published;
          }
        }
      } catch {}
    }
  } catch (error) {
    console.warn('Unable to reach remote blog API, serving initial Ofia stories:', error);
  }
  return SEED_FALLBACK_POSTS;
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  // Schema.org Blog / CollectionPage Structured Data
  const jsonLdBlog = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Ofia Platform Blog & Journal',
    url: 'https://ofia.ng/blog',
    description: 'Latest insights, updates, and engineering innovations across the Ofia commerce ecosystem.',
    publisher: {
      '@type': 'Organization',
      name: 'Ofia Platform',
      url: 'https://ofia.ng',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
      },
    },
    blogPost: posts.map((p: any) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.meta_description || p.excerpt,
      url: `https://ofia.ng/blog/${p.slug}`,
      datePublished: p.published_at || p.created_at,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlog) }}
      />
      <main className="min-h-screen bg-nexa-bg-base pt-32 pb-24 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-nexa-brand/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-80 -left-40 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BlogListClient posts={posts} />
        </div>
      </main>
    </>
  );
}
