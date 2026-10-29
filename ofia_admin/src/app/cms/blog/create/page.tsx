'use client';

import React, { useState, useEffect } from 'react';

import { RichTextEditor } from '@/components/RichTextEditor';
import { TagsInput } from '@/components/TagsInput';
import { ArrowLeft, Save, Send, Copy, Check, ExternalLink, Eye, Globe, Search, Sparkles } from 'lucide-react';
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
            setMetaTitle(post.meta_title || '');
            setMetaDescription(post.meta_description || '');
            setCanonicalUrl(post.canonical_url || '');
            setOgImage(post.og_image || '');
            setViewCount(post.view_count !== undefined && post.view_count !== null ? Number(post.view_count) : 0);
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
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [viewCount, setViewCount] = useState<number | null>(null);
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
        author_id,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
        og_image: ogImage.trim() || coverImage.trim() || null,
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
            {viewCount !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold shadow-xs">
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>{viewCount.toLocaleString()} {viewCount === 1 ? 'View' : 'Views'}</span>
              </div>
            )}
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

            {/* SEO & Meta Optimization Card */}
            <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">SEO &amp; Search Engine Optimization</h3>
                    <p className="text-xs text-slate-500">Fine-tune how this article appears on Google, social media, and search indexes</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Schema.org Article Ready
                </span>
              </div>

              {/* Live SERP Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  Google Search Snippet Preview
                </label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">O</div>
                    <span className="truncate">https://ofia.ng &rsaquo; blog &rsaquo; {slug || slugify(title) || 'article-slug'}</span>
                  </div>
                  <h4 className="text-blue-700 text-base font-semibold hover:underline cursor-pointer leading-snug truncate">
                    {metaTitle || title || 'Your Article Headline | Ofia Blog'}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {metaDescription || excerpt || 'Add a compelling meta description below to optimize how this article is previewed by search engine users and social network cards.'}
                  </p>
                </div>
              </div>

              {/* Meta Title Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Meta Title
                  </label>
                  <span className={`text-[11px] font-mono ${metaTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {metaTitle.length}/60 chars
                  </span>
                </div>
                <input 
                  type="text" 
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "e.g. 10 Essential Scaling Tips for Nigerian Merchants | Ofia"}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">Recommended: 50–60 characters. Defaults to post title if left blank.</p>
              </div>

              {/* Meta Description Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Meta Description
                  </label>
                  <span className={`text-[11px] font-mono ${
                    metaDescription.length >= 140 && metaDescription.length <= 160 
                      ? 'text-emerald-600 font-bold' 
                      : metaDescription.length > 160 
                      ? 'text-amber-600 font-bold' 
                      : 'text-slate-400'
                  }`}>
                    {metaDescription.length}/160 chars
                  </span>
                </div>
                <textarea 
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter a concise, compelling summary for Google and social previews (recommended 140-160 characters)..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-slate-800 resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Recommended: 140–160 characters. Defaults to the excerpt if left blank.</p>
              </div>

              {/* Canonical URL & OG Image in a 2-column subgrid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                    Canonical URL (Optional)
                  </label>
                  <input 
                    type="url" 
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://ofia.ng/blog/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs text-slate-800 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Leave empty to use the standard Ofia blog URL canonical.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                    OG / Social Share Image URL (Optional)
                  </label>
                  <input 
                    type="url" 
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="Defaults to cover image..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs text-slate-800 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used for 1200x630 Facebook, Twitter &amp; LinkedIn rich cards.</p>
                </div>
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

            {/* SEO Health & Article Analytics */}
            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                SEO Health &amp; Analytics
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Readership Views</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    {viewCount !== null ? viewCount.toLocaleString() : '0'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Word Count</span>
                  <span className="font-semibold text-slate-800">
                    {content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reading Time</span>
                  <span className="font-semibold text-slate-800">
                    ~{Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length / 200))} min read
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Meta Description</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${
                    metaDescription.trim().length >= 120 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : metaDescription.trim().length > 0 
                      ? 'bg-amber-50 text-amber-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {metaDescription.trim().length >= 120 ? 'Optimal' : metaDescription.trim().length > 0 ? 'Short' : 'Missing'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Social Graph</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${
                    ogImage || coverImage ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ogImage || coverImage ? 'Ready' : 'No Image'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </SuperAdminShell>
  );
}
