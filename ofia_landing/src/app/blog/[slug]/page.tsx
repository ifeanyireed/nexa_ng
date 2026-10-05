import BlogPostContent from '@/components/BlogPostContent';
import { notFound } from 'next/navigation';

export const revalidate = 60;
export const dynamicParams = false;

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
    title: post ? `${post.title} | ResultsPRO Suite` : 'Article Not Found',
  };
}

async function getBlogPosts() {
  try {
    const rawApi = process.env.NEXT_PUBLIC_USERS_API || '';
    const USERS_API = rawApi.trim().replace(/^["']|["']$/g, '');
    if (!USERS_API || !USERS_API.startsWith('http')) return [];
    const res = await fetch(`${USERS_API}/api/v1/cms/blog/posts`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const posts = await res.json();
    if (!posts || !Array.isArray(posts)) return [];
    return posts.filter((p: any) => p.status === 'PUBLISHED');
  } catch (error) {
    console.error('Failed to fetch blog posts', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const posts = await getBlogPosts();
  const post = posts.find((p: any) => p.slug === resolvedParams.slug);
  
  if (!post) {
    notFound();
  }

  // Map backend format to component format
  const formattedPost = {
    ...post,
    author: "ResultsPRO Team", // In future map author_id to user
    date: new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  return <BlogPostContent post={formattedPost} />;
}
