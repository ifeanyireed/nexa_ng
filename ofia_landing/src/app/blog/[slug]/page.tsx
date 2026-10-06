import BlogPostContent from '@/components/BlogPostContent';
import { notFound } from 'next/navigation';

export const revalidate = 60;
export const dynamicParams = true;

const SEED_FALLBACK_POSTS = [
  {
    id: 'post-seed-01',
    title: 'Unveiling Ofia: Autonomous AI Swarms & Next-Gen African Commerce',
    slug: 'unveiling-ofia-autonomous-ai-swarms',
    excerpt: 'How Ofia is transforming enterprise commerce in Nigeria through autonomous lead qualification, real-time escrow, and intelligent multi-tenant workflows.',
    content: '<h2>The Future of African Commerce Has Arrived</h2><p>Today marks a major milestone as Ofia officially unveils our unified suite of enterprise tools built specifically for fast-growing businesses across Nigeria and West Africa.</p><p>From high-volume logistics and distributed point-of-sale systems to autonomous AI agents driving customer acquisition, the Ofia platform removes friction at every step of modern trade.</p><h3>Why Autonomous AI Matters for Emerging Markets</h3><p>Traditional CRM tools require endless manual data entry and disjointed communication channels. In high-velocity commercial environments like Lagos, Kano, and Port Harcourt, deals move rapidly across WhatsApp, direct calls, and store visits.</p><p>Our AI Swarm continuously monitors lead inquiries, automates customer follow-ups, and integrates directly with live inventory and escrow payouts.</p>',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
    category: 'Ecosystem & AI',
    status: 'PUBLISHED',
    author_name: 'Adeyemi Phillips',
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-02',
    title: 'How Ofia Compass Bridges Offline Merchants with Escrow Commerce',
    slug: 'how-ofia-compass-bridges-offline-merchants',
    excerpt: 'Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.',
    content: '<h2>Modernizing the Retail Storefront</h2><p>Thousands of trade merchants across computer villages and open markets rely on word-of-mouth and cash payments. Ofia Compass bridges this gap by providing instantly provisioned custom storefronts backed by verified merchant badges.</p><p>With built-in escrow, buyers across different states can transact confidently knowing their funds are protected until verified delivery.</p>',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png',
    category: 'Retail & Commerce',
    status: 'PUBLISHED',
    author_name: 'Ofia Editorial Team',
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
    published_at: new Date().toISOString(),
  },
];

async function getBlogPosts() {
  try {
    const rawApi = process.env.NEXT_PUBLIC_USERS_API || process.env.USERS_API_URL || 'http://localhost:8081';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    if (USERS_API && USERS_API.startsWith('http')) {
      const res = await fetch(`${USERS_API}/api/v1/cms/blog/posts`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const posts = await res.json();
        if (Array.isArray(posts) && posts.length > 0) {
          return posts.filter((p: any) => p.status === 'PUBLISHED');
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch remote blog posts for slug page:', error);
  }
  return SEED_FALLBACK_POSTS;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p: any) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const posts = await getBlogPosts();
  const post = posts.find((p: any) => p.slug === resolvedParams.slug);
  return {
    title: post ? `${post.title} | Ofia Platform` : 'Article Not Found | Ofia',
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const posts = await getBlogPosts();
  let post = posts.find((p: any) => p.slug === resolvedParams.slug);
  
  if (!post) {
    // If not found in memory, try direct fetch for this specific slug
    try {
      const rawApi = process.env.NEXT_PUBLIC_USERS_API || process.env.USERS_API_URL || 'http://localhost:8081';
      const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
      const res = await fetch(`${USERS_API}/api/v1/cms/blog/posts/${resolvedParams.slug}`);
      if (res.ok) {
        post = await res.json();
      }
    } catch {}
  }

  if (!post) {
    notFound();
  }

  // Map backend format to component format
  const authorName = typeof post.author === 'string'
    ? post.author
    : (post.author?.full_name || post.author_name || 'Ofia Editorial Team');

  const formattedPost = {
    ...post,
    author: authorName,
    date: new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
  };

  return <BlogPostContent post={formattedPost} />;
}
