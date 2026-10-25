'use client';

import React, { useState, useEffect } from 'react';

import { RichTextEditor } from '@/components/RichTextEditor';
import { TagsInput } from '@/components/TagsInput';
import { ArrowLeft, Save, Send, Copy, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { SuperAdminShell } from '@/components/admin/SuperAdminShell';
import { getPublicBlogUrl, copyBlogUrlToClipboard, slugify } from '@/lib/blog-utils';

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
            setSlug(post.slug || '');
            let imgUrl = post.cover_image || '';
            if (imgUrl && imgUrl.startsWith('/')) imgUrl = 'https://resultspro.ng' + imgUrl;
            setCoverImage(imgUrl);
          }
        })
        .catch(() => {});
    }
  }, [editId]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [savedDraftSlug, setSavedDraftSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopyUrl = async (targetSlug?: string) => {
    const s = targetSlug || slug || slugify(title);
    if (!s) {
      toast.error('Please enter a post title first');
      return;
    }
    const res = await copyBlogUrlToClipboard(s);
    if (res.success) {
      setCopied(true);
      toast.success(`Copied blog URL: ${res.url}`);
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Could not copy link');
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

      if (editId) {
        payload['id'] = editId;
      }

      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedData = await res.json().catch(() => ({}));
        const finalSlug = savedData?.slug || slug || slugify(title);
        setSlug(finalSlug);

        if (status === 'DRAFT') {
          setSavedDraftSlug(finalSlug);
          if (!editId && savedData?.id) {
            window.history.replaceState(null, '', `/cms/blog/create?edit=${savedData.id}`);
          }
          toast.success('Post saved as draft! Blog URL is ready to copy.');
        } else {
          toast.success('Post published successfully!');
          router.push('/cms/blog');
        }
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
        <div className="px-1 py-3 sm:px-4 md:p-6 pb-0 border-b border-nexa-border/30">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <Link href="/cms/blog" className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-xl sm:text-2xl font-bold text-nexa-text-primary">{editId ? "Edit Blog Post" : "Create Blog Post"}</h1>
          </div>
          <p className="text-xs sm:text-sm text-nexa-text-secondary mb-4 ml-0 sm:ml-12">Write and publish an article to the Ofia platform blog</p>
        </div>

      <div className="px-0 sm:px-4 md:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 max-w-[1200px] mx-auto w-full">
        {/* Actions Header */}
        <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
          <Link href="/cms/blog" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-xs sm:text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Posts</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {(savedDraftSlug || slug || editId || title.trim().length > 0) && (
              <button 
                type="button"
                onClick={() => handleCopyUrl(savedDraftSlug || slug)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm ${
                  copied 
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-700' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Copy blog article URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'URL Copied!' : 'Copy Blog URL'}</span>
              </button>
            )}
            <button 
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors shadow-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button 
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSaving}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isSaving ? 'Publishing...' : (editId ? 'Update' : 'Publish')}</span>
            </button>
          </div>
        </div>

        {/* Saved Draft Alert Banner with 1-click Copy */}
        {savedDraftSlug && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Draft Saved Successfully</p>
                <p className="text-xs text-emerald-700 font-mono mt-0.5 truncate max-w-sm sm:max-w-md">
                  {getPublicBlogUrl(savedDraftSlug)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                type="button"
                onClick={() => handleCopyUrl(savedDraftSlug)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Blog URL'}</span>
              </button>
              <a
                href={getPublicBlogUrl(savedDraftSlug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-50 shadow-sm transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview</span>
              </a>
              <Link
                href={`/cms/blog?savedDraft=${encodeURIComponent(savedDraftSlug)}&title=${encodeURIComponent(title)}`}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
              >
                All Posts
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-4">
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
            <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-5">
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
                    <span className="text-sm font-medium">{isUploading ? 'Uploading to Cloudinary...' : 'Click to upload image file'}</span>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... or paste direct CDN image URL"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-slate-800"
                  />
                  <label className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#1A56DB] hover:bg-blue-700 text-white cursor-pointer shrink-0 flex items-center gap-1 shadow-xs">
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
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
