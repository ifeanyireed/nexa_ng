'use client';

import React, { useState, useEffect } from 'react';

import { RichTextEditor } from '@/components/RichTextEditor';
import { TagsInput } from '@/components/TagsInput';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { SuperAdminShell } from '@/components/admin/SuperAdminShell';

export default function CreateBlogPost() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CreateBlogPostContent />
    </React.Suspense>
  );
}

function CreateBlogPostContent() {
    const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    fetch('/api/v1/cms/blog/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

    if (editId) {
      fetch('/api/v1/cms/blog/posts')
        .then(res => res.json())
        .then(data => {
          const posts = Array.isArray(data) ? data : (data.posts || []);
          const post = posts.find((p: any) => p.id === editId);
          if (post) {
            setTitle(post.title || '');
            setExcerpt(post.excerpt || '');
            setCategory(post.category_id || '');
            setContent(post.content || '');
            setTags(post.tags || '');
            let imgUrl = post.cover_image || '';
            if (imgUrl && imgUrl.startsWith('/')) imgUrl = 'https://resultspro.ng' + imgUrl;
            setCoverImage(imgUrl);
          }
        })
        .catch(() => {});
    }
  }, [editId]);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_path', 'blog/covers');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        toast.success('Cover image uploaded!');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    setIsSaving(true);
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    try {
      const USERS_API = process.env.NEXT_PUBLIC_USERS_API || '';
      let author_id = "0eef95ef-57e0-4a7d-ae31-c8376fe28fd0";
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.id) author_id = u.id;
        }
      } catch(e) {}

      const payload: any = {
        title,
        excerpt,
        content,
        cover_image: coverImage,
        category_id: category || null,
        tags,
        status,
        author_id
      };

      let url = '/api/v1/cms/blog/posts';
      let method = 'POST';

      if (editId) {
        payload['id'] = editId;
      }

      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(`Post ${status === 'DRAFT' ? 'saved as draft' : 'published'} successfully!`);
        router.push('/cms/blog');
      } else {
        toast.error('Failed to save post');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SuperAdminShell title={editId ? "Edit Blog Post" : "Create Blog Post"} subtitle="Write and publish an article to the Ofia blog">
      <div className="w-full">
        <div className="p-8 pb-0 border-b border-nexa-border/30">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/cms/blog" className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-2xl font-bold text-nexa-text-primary">{editId ? "Edit Blog Post" : "Create Blog Post"}</h1>
          </div>
          <p className="text-nexa-text-secondary mb-4 ml-12">Write and publish an article to the Ofia platform blog</p>
        </div>

      <div className="p-8 space-y-6 max-w-[1200px] mx-auto w-full">
        {/* Actions Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <Link href="/cms/blog" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Posts
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-colors shadow-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm transition-colors shadow-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              <Send className="w-4 h-4" />
              {isSaving ? 'Publishing...' : (editId ? 'Update Post' : 'Publish Post')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Post Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10 Tips for Passing ICAN..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Content</label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Post Settings</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Excerpt</label>
                <textarea 
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A brief summary of the post..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-slate-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-slate-700 appearance-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Tags (Comma separated)</label>
                <TagsInput value={tags} onChange={setTags} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Cover Image</label>
                <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-blue-400 transition-colors cursor-pointer overflow-hidden">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Click to upload'}</span>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
                {coverImage && (
                  <button onClick={() => setCoverImage('')} className="text-xs text-rose-500 font-medium mt-2 hover:underline">
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </SuperAdminShell>
  );
}
