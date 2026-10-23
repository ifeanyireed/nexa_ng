import BlogListClient from '@/components/BlogListClient';

export const revalidate = 60;

export const metadata = {
  title: 'Blog & Editorial | Ofia Platform',
  description: 'Latest insights, updates, and engineering innovations across the Ofia commerce ecosystem.',
};

const SEED_FALLBACK_POSTS = [
  {
    id: 'post-seed-01',
    title: 'Unveiling Ofia: Autonomous AI Voice Intelligence & Next-Gen African Commerce',
    slug: 'unveiling-ofia-autonomous-ai-voice',
    excerpt: 'How Ofia is transforming enterprise commerce in Nigeria through autonomous voice outreach, real-time escrow, and intelligent multi-tenant workflows.',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
    category: 'Ecosystem & AI',
    status: 'PUBLISHED',
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-02',
    title: 'How Ofia Digital Storefronts Bridge Offline Merchants with Escrow Commerce',
    slug: 'how-ofia-storefronts-bridge-offline-merchants',
    excerpt: 'Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png',
    category: 'Retail & Commerce',
    status: 'PUBLISHED',
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-03',
    title: 'Real-Time Fleet Dispatch: Scaling Nationwide Last-Mile Logistics',
    slug: 'real-time-fleet-dispatch-last-mile-logistics',
    excerpt: 'Inside Ofia dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks.',
    cover_image: 'https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg',
    category: 'Fleet & Logistics',
    status: 'PUBLISHED',
    published_at: new Date().toISOString(),
  },
];

async function getBlogPosts() {
  try {
    const rawApi = process.env.NEXT_PUBLIC_USERS_API || process.env.USERS_API_URL || 'https://ofia-user-service.onrender.com';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    
    // 1. Try USERS_API (Render microservice)
    if (USERS_API && USERS_API.startsWith('http')) {
      try {
        const [postsRes, catRes] = await Promise.all([
          fetch(`${USERS_API}/api/v1/cms/blog/posts`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(2000) }),
          fetch(`${USERS_API}/api/v1/cms/blog/categories`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(2000) })
        ]);
        
        if (postsRes.ok) {
          const posts = await postsRes.json();
          if (Array.isArray(posts) && posts.length > 0) {
            const published = posts.filter((p: any) => p.status === 'PUBLISHED');
            if (catRes.ok) {
              const categories = await catRes.json();
              published.forEach((p: any) => {
                const cat = categories.find((c: any) => c.id === p.category_id);
                if (cat) p.category = cat.name;
              });
            }
            if (published.length > 0) return published;
          }
        }
      } catch {}
    }

    // 2. Try Admin API proxy (direct connection to live Neon PostgreSQL database)
    const adminRaw = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:3003';
    const ADMIN_API = adminRaw.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    if (ADMIN_API && ADMIN_API.startsWith('http')) {
      try {
        const adminRes = await fetch(`${ADMIN_API}/api/v1/cms/blog/posts`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(2000) });
        if (adminRes.ok) {
          const posts = await adminRes.json();
          if (Array.isArray(posts) && posts.length > 0) {
            const published = posts.filter((p: any) => p.status === 'PUBLISHED');
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

  return (
    <main className="min-h-screen bg-nexa-bg-base pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-nexa-brand/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[50%] right-[-10%] w-[500px] h-[500px] bg-nexa-accent/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <BlogListClient posts={posts} />
      </div>
    </main>
  );
}
