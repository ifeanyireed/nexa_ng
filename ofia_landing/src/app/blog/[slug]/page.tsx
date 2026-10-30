import BlogPostContent from '@/components/BlogPostContent';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';

export const revalidate = 60;
export const dynamicParams = true;

const SEED_FALLBACK_POSTS = [
  {
    id: 'post-seed-01',
    title: 'Unveiling Ofia: Autonomous AI Voice Intelligence & Next-Gen African Commerce',
    slug: 'unveiling-ofia-autonomous-ai-voice',
    excerpt: 'How Ofia is transforming enterprise commerce in Nigeria through autonomous voice outreach, real-time escrow, and intelligent multi-tenant workflows.',
    content: '<h2>The Future of African Commerce Has Arrived</h2><p>Today marks a major milestone as Ofia officially unveils our unified suite of enterprise tools built specifically for fast-growing businesses across Nigeria and West Africa.</p><p>From high-volume logistics and distributed point-of-sale systems to autonomous AI voice agents conducting sales qualification calls, the Ofia platform removes friction at every step of modern trade.</p><h3>Why Autonomous Voice AI Matters for Emerging Markets</h3><p>Traditional CRM tools require endless manual data entry and disjointed communication channels. In high-velocity commercial environments like Lagos, Kano, and Port Harcourt, deals move rapidly across direct phone calls and store visits.</p><p>Our AI Voice Agent conducts authorized outbound telephone outreach via Voicebip telecom lines (+234), automates lead qualification with natural objection handling, and logs transcripts and summaries directly into CRM.</p>',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
    category: 'Ecosystem & AI',
    status: 'PUBLISHED',
    author_name: 'Grace Jude',
    view_count: 1420,
    meta_title: 'Unveiling Ofia: Autonomous AI Voice Intelligence & African Commerce',
    meta_description: 'How Ofia transforms enterprise commerce in Nigeria through autonomous voice AI, real-time escrow, and intelligent multi-tenant logistics workflows.',
    tags: 'AI, Commerce, Nigeria, Logistics',
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-02',
    title: 'How Ofia Digital Storefronts Bridge Offline Merchants with Escrow Commerce',
    slug: 'how-ofia-storefronts-bridge-offline-merchants',
    excerpt: 'Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.',
    content: '<h2>Modernizing the Retail Storefront</h2><p>Thousands of trade merchants across computer villages and open markets rely on word-of-mouth and cash payments. Ofia Digital Storefronts bridge this gap by providing instantly provisioned custom storefronts backed by verified merchant badges.</p><p>With built-in escrow, buyers across different states can transact confidently knowing their funds are protected until verified delivery.</p>',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png',
    category: 'Retail & Commerce',
    status: 'PUBLISHED',
    author_name: 'Ofia Editorial Team',
    view_count: 980,
    meta_title: 'How Ofia Storefronts Bridge Offline Merchants with Escrow Commerce',
    meta_description: 'Empowering brick-and-mortar African retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.',
    tags: 'Retail, Escrow, Storefront, Payments',
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-03',
    title: 'Real-Time Fleet Dispatch: Scaling Nationwide Last-Mile Logistics',
    slug: 'real-time-fleet-dispatch-last-mile-logistics',
    excerpt: 'Inside Ofia dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks.',
    content: '<h2>Reliable Logistics is the Backbone of Trade</h2><p>Every commercial ecosystem succeeds or stumbles based on its logistics backbone. With the launch of our updated mobile rider and customer tracking applications, Ofia Logistics now offers automated rider dispatch and proof-of-delivery.</p><p>Merchants can track shipments across state corridors with complete transparency, minimizing transit delays and eliminating lost parcels.</p>',
    cover_image: 'https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg',
    category: 'Fleet & Logistics',
    status: 'PUBLISHED',
    author_name: 'Ibrahim Musa',
    view_count: 1150,
    meta_title: 'Real-Time Fleet Dispatch: Scaling Nationwide Last-Mile Logistics | Ofia',
    meta_description: 'Inside Ofia dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks across Nigeria.',
    tags: 'Fleet, Logistics, Dispatch, SupplyChain',
    published_at: new Date().toISOString(),
  },
];

async function getBlogPosts() {
  // 1. Direct Lakebase Neon database query
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
      console.warn('[Landing Blog Slug] DB query note:', dbErr);
    }
  }

  try {
    // 2. Try Admin API proxy
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

    // 3. Try USERS_API
    const rawApi = process.env.USERS_API_URL || process.env.NEXT_PUBLIC_USERS_API || '';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    if (USERS_API && USERS_API.startsWith('http')) {
      try {
        const res = await fetch(`${USERS_API}/api/v1/cms/blog/posts`, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const posts = await res.json();
          if (Array.isArray(posts) && posts.length > 0) {
            return posts.filter((p: any) => p.status === 'PUBLISHED');
          }
        }
      } catch {}
    }
  } catch (error) {
    console.warn('Failed to fetch remote blog posts for slug page:', error);
  }
  return SEED_FALLBACK_POSTS;
}

async function getPostBySlug(slug: string) {
  const clean = decodeURIComponent(slug || '').trim();
  if (!clean) return null;

  // 1. Direct Lakebase Neon database query by slug OR id (allows previewing drafts)
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
        WHERE p.slug = ${clean}
           OR LOWER(p.slug) = LOWER(${clean})
           OR p.id = ${clean}
           OR LOWER(p.id) = LOWER(${clean})
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return {
          ...rows[0],
          category: rows[0].category || 'Commerce & AI',
          view_count: Number(rows[0].view_count || 0),
        };
      }
    } catch (dbErr) {
      console.warn('[Landing Blog Slug] DB single post query note:', dbErr);
    }
  }

  // 2. Search in preloaded posts (fallback)
  const posts = await getBlogPosts();
  let post = posts.find((p: any) => 
    p.slug === clean || 
    p.slug?.toLowerCase() === clean.toLowerCase() ||
    p.id === clean ||
    String(p.id)?.toLowerCase() === clean.toLowerCase()
  );

  // 3. Try Admin API proxy by query param or slug route
  if (!post) {
    try {
      const adminRaw = process.env.NEXT_PUBLIC_ADMIN_API || '';
      const ADMIN_API = adminRaw.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
      if (ADMIN_API && ADMIN_API.startsWith('http')) {
        const [resQuery, resPath] = await Promise.all([
          fetch(`${ADMIN_API}/api/v1/cms/blog/posts?id=${encodeURIComponent(clean)}`, {
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(4000),
          }).catch(() => null),
          fetch(`${ADMIN_API}/api/v1/cms/blog/posts/${encodeURIComponent(clean)}`, {
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(4000),
          }).catch(() => null),
        ]);

        if (resQuery && resQuery.ok) {
          const data = await resQuery.json().catch(() => null);
          if (data && (data.id || data.title)) post = data;
        }
        if (!post && resPath && resPath.ok) {
          const data = await resPath.json().catch(() => null);
          if (data && (data.id || data.title)) post = data;
        }
      }
    } catch {}
  }

  // 4. Try USERS_API
  if (!post) {
    try {
      const rawApi = process.env.USERS_API_URL || process.env.NEXT_PUBLIC_USERS_API || '';
      const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
      if (USERS_API && USERS_API.startsWith('http')) {
        const res = await fetch(`${USERS_API}/api/v1/cms/blog/posts/${encodeURIComponent(clean)}`, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          post = await res.json();
        }
      }
    } catch {}
  }

  // 5. Check SEED_FALLBACK_POSTS
  if (!post) {
    post = SEED_FALLBACK_POSTS.find((p: any) => 
      p.slug === clean || 
      p.slug?.toLowerCase() === clean.toLowerCase() ||
      p.id === clean
    );
  }

  return post || null;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p: any) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Ofia Platform',
      description: 'The requested Ofia blog article could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const title = post.meta_title || `${post.title} | Ofia Blog`;
  const description =
    post.meta_description ||
    post.excerpt ||
    'Latest insights, product breakthroughs, and commerce engineering playbooks from the Ofia platform.';
  const canonicalUrl = post.canonical_url || `https://ofia.ng/blog/${post.slug}`;
  const ogImage =
    post.og_image ||
    post.cover_image ||
    'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png';

  const authorName =
    typeof post.author === 'string'
      ? post.author
      : post.author?.full_name || post.author_name || 'Ofia Editorial Team';

  const tagsArray = post.tags
    ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : ['Ofia', 'Commerce', 'Nigeria', 'Logistics', 'Fintech'];

  return {
    title,
    description,
    keywords: tagsArray,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: 'Ofia Platform',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'en_NG',
      url: canonicalUrl,
      siteName: 'Ofia Platform',
      title,
      description,
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || post.published_at || post.created_at,
      authors: [authorName],
      section: post.category || 'Commerce',
      tags: tagsArray,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@Ofia_ng',
      creator: '@Ofia_ng',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Author resolution
  const authorName =
    typeof post.author === 'string'
      ? post.author
      : post.author?.full_name || post.author_name || 'Ofia Editorial Team';

  // Word count and reading time calculation
  const cleanText = (post.content || '').replace(/<[^>]*>/g, ' ').trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const canonicalUrl = post.canonical_url || `https://ofia.ng/blog/${post.slug}`;
  const ogImage =
    post.og_image ||
    post.cover_image ||
    'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png';

  // Schema.org BlogPosting Structured Data
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: [ogImage],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ofia Platform',
      url: 'https://ofia.ng',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    wordCount,
    articleSection: post.category || 'Commerce',
    keywords: post.tags || 'Commerce, Logistics, Nigeria, AI',
  };

  // Schema.org BreadcrumbList
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ofia.ng',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://ofia.ng/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  const formattedPost = {
    ...post,
    author: authorName,
    reading_time: readingTime,
    date: new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      {post.status === 'DRAFT' && (
        <div className="bg-amber-400 text-slate-900 font-bold text-xs py-2 px-4 text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>⚠️ EDITORIAL PREVIEW MODE — This article is currently saved as Draft in Ofia CMS and not listed on the public journal.</span>
        </div>
      )}
      <BlogPostContent post={formattedPost} />
    </>
  );
}
