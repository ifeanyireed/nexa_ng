import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Introducing the Ofia Master Product Blueprint",
      excerpt: "A deep dive into our vision for the digital infrastructure that Nigerian businesses run on.",
      date: "September 2026",
      category: "Company News"
    },
    {
      id: 2,
      title: "Why we aren't just another marketplace",
      excerpt: "Understanding the difference between listing directories and true multi-tenant business ecosystems.",
      date: "August 2026",
      category: "Product Strategy"
    },
    {
      id: 3,
      title: "The power of entering data once",
      excerpt: "How Ofia's unified tenant schema powers your ERP, Shop, and Logistics simultaneously.",
      date: "July 2026",
      category: "Engineering"
    }
  ];

  return (
    <div className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">The Ofia Blog</h1>
        <p className="text-xl text-slate-600">Thoughts, updates, and deep dives from the team.</p>
      </div>
      
      <div className="space-y-12">
        {posts.map(post => (
          <article key={post.id} className="group cursor-pointer">
            <span className="text-sm font-semibold text-blue-600 tracking-wide uppercase">{post.category}</span>
            <Link href={`/blog/${post.id}`} className="block mt-2">
              <h2 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                {post.title}
              </h2>
              <p className="text-lg text-slate-600 mb-4">{post.excerpt}</p>
              <div className="text-sm text-slate-400">{post.date}</div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
