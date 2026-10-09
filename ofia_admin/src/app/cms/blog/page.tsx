'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { NexaBadge as Badge } from '@/components/nexa/NexaBadge';
import { AdminStatCard as StatCard } from '@/components/admin/AdminStatCard';
import { FileText, CheckCircle2, File, Plus, Tag, MessageSquare, Folder, Users } from 'lucide-react';
import { fetchBlogPosts } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import toast from 'react-hot-toast';
import { SuperAdminShell } from '@/components/admin/SuperAdminShell';

const TABS = [
  { id: 'posts', name: 'Posts', icon: FileText },
  { id: 'categories', name: 'Categories', icon: Folder },
  { id: 'tags', name: 'Tags', icon: Tag },
  { id: 'comments', name: 'Comments', icon: MessageSquare },
  { id: 'subscribers', name: 'Subscribers', icon: Users },
];

export default function BlogCMSPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchBlogPosts();
      try {
        const catRes = await fetch('/api/v1/cms/blog/categories');
        if (catRes.ok) {
          setCategories(await catRes.json());
        }
        const tagRes = await fetch('/api/v1/cms/blog/tags');
        if (tagRes.ok) {
          setTagsList(await tagRes.json());
        }
        
        try {
            const subRes = await fetch('/api/v1/cms/blog/subscribe');
            if (subRes.ok) setSubscribers(await subRes.json() || []);
        } catch(e) {}
        try {
            const comRes = await fetch('/api/v1/cms/blog/comments');
            if (comRes.ok) setComments(await comRes.json() || []);
        } catch(e) {}

      } catch (e) {}
      setPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  const totalPosts = posts.length;

  const handleCreateCategory = async () => {
    const name = window.prompt("Enter category name:");
    if (!name) return;
    try {
      const res = await fetch('/api/v1/cms/blog/categories', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories([...categories, newCat]);
        toast.success("Category added!");
      } else {
        toast.error("Failed to add category (might already exist)");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  
  const handleUpdateCommentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/v1/cms/blog/comments/status', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setComments(comments.map((c: any) => c.id === id ? { ...c, status } : c));
        toast.success(`Comment ${status.toLowerCase()}!`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Error updating comment");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/v1/cms/blog/comments/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter((c: any) => c.id !== id));
        toast.success("Comment deleted!");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (e) {
      toast.error("Error deleting comment");
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/v1/cms/blog/subscribe/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubscribers(subscribers.filter((s: any) => s.id !== id));
        toast.success("Subscriber removed!");
      } else {
        toast.error("Failed to remove subscriber");
      }
    } catch (e) {
      toast.error("Error removing subscriber");
    }
  };

  const handleCreateTag = async () => {
    const name = window.prompt("Enter tag name:");
    if (!name) return;
    try {
      const res = await fetch('/api/v1/cms/blog/tags', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newTag = await res.json();
        setTagsList([...tagsList, newTag]);
        toast.success("Tag added!");
      } else {
        toast.error("Failed to add tag (might already exist)");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/v1/cms/blog/posts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p: any) => p.id !== id));
        toast.success("Post deleted!");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (e) {
      toast.error("Error deleting post");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/v1/cms/blog/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c: any) => c.id !== id));
        toast.success("Category deleted!");
      } else {
        toast.error("Failed to delete category");
      }
    } catch (e) {
      toast.error("Error deleting category");
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      const res = await fetch(`/api/v1/cms/blog/tags?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setTagsList(tagsList.filter((t: any) => t.id !== id));
        toast.success("Tag deleted!");
      } else {
        toast.error("Failed to delete tag");
      }
    } catch (e) {
      toast.error("Error deleting tag");
    }
  };

  const published = posts.filter(p => p.status === 'PUBLISHED').length;
  const drafts = posts.filter(p => p.status === 'DRAFT').length;

  return (
    <SuperAdminShell title="Blog & Content CMS" subtitle="Manage articles, categories, comments, and newsletter subscribers">
      <div className="w-full">
      <div className="p-8 pb-0 border-b border-nexa-border/30">
        <h1 className="text-2xl font-bold text-nexa-text-primary">Suite Blog CMS</h1>
        <p className="text-nexa-text-secondary">Manage global articles, categories, tags, and comments across the suite</p>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-full shadow-inner border border-slate-200 overflow-x-auto whitespace-nowrap hide-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                    activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-2" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'posts' ? (
              <Link href="/cms/blog/create" className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </Link>
            ) : (
              <button onClick={activeTab === "categories" ? handleCreateCategory : activeTab === "tags" ? handleCreateTag : undefined} className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>
                  {activeTab === 'categories' ? 'Add Category' : activeTab === 'tags' ? 'Add Tag' : 'Settings'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Posts', value: loading ? '...' : totalPosts, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Published', value: loading ? '...' : published, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Drafts', value: loading ? '...' : drafts, icon: File, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${stat.bg}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800">All Posts</h3>
                <input 
                  type="text"
                  placeholder="Search posts..."
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-white border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading posts...</td>
                      </tr>
                    ) : posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No blog posts found. Create one to get started.</td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{post.title}</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">{post.excerpt}</p>
                          </td>
                          <td className="px-6 py-4">{typeof post.author === "string" ? post.author : (post.author?.full_name || "Admin")}</td>
                          <td className="px-6 py-4">{categories.find((c: any) => c.id === post.category_id)?.name || "-"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${post.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{post.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {post.published_at 
                              ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
                              : new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/cms/blog/create?edit=${post.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Edit</Link>
                            <button onClick={() => handleDeletePost(post.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Categories</h3>
              <input type="text" placeholder="Search categories..." className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Post Count</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No categories found. Add one to get started.</td></tr>
                ) : (
                  categories.map((cat: any) => (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                      <td className="px-6 py-4 text-slate-500">{cat.slug}</td>
                      <td className="px-6 py-4 text-slate-500">{posts.filter((p: any) => p.category_id === cat.id).length}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Tags</h3>
              <input type="text" placeholder="Search tags..." className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Post Count</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tagsList.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No tags found. Add one to get started.</td></tr>
                ) : (
                  tagsList.map((tag: any) => (
                    <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{tag.name}</td>
                      <td className="px-6 py-4 text-slate-500">{tag.slug}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {posts.filter((p: any) => p.tags && p.tags.includes(tag.name)).length}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteTag(tag.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Blog Comments</h3>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Content</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comments.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No comments found.</td></tr>
                ) : (
                  comments.map((comment: any) => (
                    <tr key={comment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{comment.user_name || "Guest"}</td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{comment.content}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${comment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {comment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {comment.status !== 'APPROVED' && (
                          <button onClick={() => handleUpdateCommentStatus(comment.id, 'APPROVED')} className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Approve</button>
                        )}
                        {comment.status === 'APPROVED' && (
                          <button onClick={() => handleUpdateCommentStatus(comment.id, 'PENDING')} className="text-amber-600 hover:text-amber-800 text-sm font-medium">Hide</button>
                        )}
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Newsletter Subscribers</h3>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscribers.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No subscribers found.</td></tr>
                ) : (
                  subscribers.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{sub.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => handleDeleteSubscriber(sub.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">Remove</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
    </SuperAdminShell>
  );
}
