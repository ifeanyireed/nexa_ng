import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';

export const revalidate = 60;

export const metadata = {
  title: 'Blog | ResultsPRO Suite',
  description: 'Latest insights, updates, and stories from the ResultsPRO team.',
};

async function getBlogPosts() {
  try {
    const rawApi = process.env.NEXT_PUBLIC_USERS_API || '';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '');
    if (!USERS_API || !USERS_API.startsWith('http')) return [];
    
    const [postsRes, catRes] = await Promise.all([
      fetch(`${USERS_API}/api/v1/cms/blog/posts`, { next: { revalidate: 60 } }),
      fetch(`${USERS_API}/api/v1/cms/blog/categories`, { next: { revalidate: 60 } })
    ]);
    
    let posts = [];
    if (postsRes.ok) posts = await postsRes.json();
    if (!posts || !Array.isArray(posts)) return [];
    
    const published = posts.filter((p: any) => p.status === 'PUBLISHED');
    
    if (catRes.ok) {
      const categories = await catRes.json();
      published.forEach((p: any) => {
        const cat = categories.find((c: any) => c.id === p.category_id);
        if (cat) p.category = cat.name;
      });
    }
    
    return published;
  } catch (error) {
    console.error('Failed to fetch blog posts', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-light" style={{ background: 'var(--color-nets-light)' }}>
      <section className="bg-navy text-white" style={{ background: 'var(--color-nets-navy-dark)', paddingTop: '12rem', paddingBottom: '6rem' }}>
        <div className="container-nets">
          <div className="max-w-3xl">
            <div className="overline-dark" style={{ marginBottom: '1.5rem' }}>Our Blog</div>
            <h1 className="fw-300" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Insights, Updates <br />&amp; <span style={{ fontWeight: 700 }}>Transformations.</span>
            </h1>
            <p className="text-body-lg text-white/70">
              Read the latest news from the ResultsPRO suite, deep-dives into educational technology, and success stories from our partner schools.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="container-nets">
          {posts.length === 0 ? (
            <div className="text-center text-muted py-12">No blog posts found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => {
                return (
                  <article key={post.id} className="bg-white rounded-sm shadow-sm hover:shadow-card-lg transition-shadow overflow-hidden flex flex-col border border-gray-200">
                    <div className="relative h-48 overflow-hidden bg-nets-light">
                      <img 
                        src={post.cover_image 
                          ? (post.cover_image.includes('res.cloudinary.com') 
                              ? post.cover_image 
                              : `https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/${post.cover_image.split('/').pop()}`)
                          : 'https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg'} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-navy text-xs fw-600 px-3 py-1 rounded-sm">
                          {post.category || 'Blog'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between text-xs text-muted mb-3">
                        <span>
                          {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>ResultsPRO</span>
                      </div>
                      <h2 className="text-xl fw-600 mb-3 text-navy leading-tight line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted mb-6 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 text-sm fw-600 text-red hover:opacity-80 transition-opacity" style={{ color: 'var(--color-nets-red)' }}>
                          Read Article <IconArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center">
            <button className="btn btn-outline-navy">
              Load More Articles
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
