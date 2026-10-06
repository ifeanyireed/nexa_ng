import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';

export const revalidate = 60;

export const metadata = {
  title: 'Blog | Ofia Platform',
  description: 'Latest insights, updates, and innovations across the Ofia commerce ecosystem.',
};

const SEED_FALLBACK_POSTS = [
  {
    id: 'post-seed-01',
    title: 'Unveiling Ofia: Autonomous AI Swarms & Next-Gen African Commerce',
    slug: 'unveiling-ofia-autonomous-ai-swarms',
    excerpt: 'How Ofia is transforming enterprise commerce in Nigeria through autonomous lead qualification, real-time escrow, and intelligent multi-tenant workflows.',
    cover_image: 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png',
    category: 'Ecosystem & AI',
    status: 'PUBLISHED',
    published_at: new Date().toISOString(),
  },
  {
    id: 'post-seed-02',
    title: 'How Ofia Compass Bridges Offline Merchants with Escrow Commerce',
    slug: 'how-ofia-compass-bridges-offline-merchants',
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
    const rawApi = process.env.NEXT_PUBLIC_USERS_API || process.env.USERS_API_URL || 'http://localhost:8081';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    
    if (USERS_API && USERS_API.startsWith('http')) {
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
    }
  } catch (error) {
    console.warn('Unable to reach remote blog API, serving initial Ofia stories:', error);
  }
  return SEED_FALLBACK_POSTS;
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-light" style={{ background: 'var(--color-nets-light, #f8fafc)' }}>
      <section className="bg-navy text-white" style={{ background: '#0F172A', paddingTop: '10rem', paddingBottom: '5rem' }}>
        <div className="container-nets max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-4">Ofia Journal &amp; Insights</div>
            <h1 className="font-light text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
              Commerce, Logistics <br />&amp; <span className="font-bold text-white">Autonomous AI.</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Read the latest engineering breakthroughs, merchant success stories, and updates driving the new digital economy across Nigeria and Africa.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center text-slate-500 py-16">No blog posts found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => {
                return (
                  <article key={post.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-200 group">
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img 
                        src={post.cover_image || 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png'} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                          {post.category || 'Ofia'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-medium">
                        <span>
                          {new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>Ofia Editorial</span>
                      </div>
                      <h2 className="text-xl font-bold mb-3 text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                          Read Article <IconArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
