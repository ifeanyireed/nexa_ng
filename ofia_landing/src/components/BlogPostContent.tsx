'use client';
import React from "react";

import ScrollReveal from './ScrollReveal';
import Link from 'next/link';
import { IconArrowLeft, IconMessageCircle, IconBrandTwitter, IconBrandFacebook, IconBrandLinkedin, IconMail } from '@tabler/icons-react';

interface Comment {
  id: string | number;
  created_at: string;
  user_name: string;
  content: string;
}

interface BlogPost {
  id: string | number;
  created_at: string;
  title: string;
  slug: string;
  content: string;
  author: any;
  user_name?: string;
  comments?: Comment[];
  cover_image?: string;
  published_at?: string;
  category?: string;
}


const renderCommentContent = (text: string) => {
  if (!text) return text;
  return text.split(/(?=\s)|(?<=\s)/).map((word, idx) => {
    if (word.trim().startsWith('@')) {
      return <span key={idx} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{word}</span>;
    }
    return word;
  });
};

export default function BlogPostContent({ post }: { post: BlogPost }) {
    const [commentFirstName, setCommentFirstName] = React.useState('');
  const [commentLastName, setCommentLastName] = React.useState('');
  const [commentEmail, setCommentEmail] = React.useState('');
  const [commentContent, setCommentContent] = React.useState('');
  const [commentLoading, setCommentLoading] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);

  const [subEmail, setSubEmail] = React.useState('');
  const [subLoading, setSubLoading] = React.useState(false);

  const handleCommentSubmit = async () => {
    if (!commentFirstName || !commentContent) {
      alert("Name and comment are required");
      return;
    }
    setCommentLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_USERS_API || ''}/api/v1/cms/blog/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post.id,
          name: `${commentFirstName} ${commentLastName}`.trim(),
          email: commentEmail,
          content: commentContent,
          parent_id: replyingTo
        })
      });
      if (res.ok) {
        alert("Comment submitted successfully!");
        setCommentFirstName(''); setCommentLastName(''); setCommentEmail(''); setCommentContent(''); setReplyingTo(null);
      } else {
        alert("Failed to submit comment");
      }
    } catch(e) {
      alert("Network error");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title || "Check out this post from ResultsPRO");
    let shareUrl = "";

    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${title}&body=Check out this article: ${url}`;
      return;
    }

    // Open popup
    const width = 600;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    window.open(shareUrl, 'share_popup', `width=${width},height=${height},top=${top},left=${left},scrollbars=no,resizable=no`);
  };

    const handleReplyClick = (userName: string, commentId: string) => {
    setReplyingTo(commentId);
    setCommentContent(`@${userName} `);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubscribeSubmit = async () => {
    if (!subEmail) {
      alert("Email is required");
      return;
    }
    setSubLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_USERS_API || ''}/api/v1/cms/blog/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail })
      });
      if (res.ok) {
        alert("Subscribed successfully!");
        setSubEmail('');
      } else {
        alert("Failed to subscribe");
      }
    } catch(e) {
      alert("Network error");
    } finally {
      setSubLoading(false);
    }
  };

  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  
  return (
    <main className="min-h-screen bg-nets-light relative pb-24">
      {/* Back Button Floating */}
      <Link href="/blog" className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md text-sm fw-600 transition-all">
        <IconArrowLeft size={16} />
        Back to Blog
      </Link>

      {/* Featured Image Hero */}
      <div className="w-full h-[55vh] relative">
        <img 
          src={post.cover_image || "https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg"} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

            {/* Content Container Overlapping Image */}
      <div className="container-nets relative z-10" style={{ marginTop: '-25vh' }}>
        <div className="max-w-[1100px] mx-auto">
          
          <ScrollReveal animation="fade-up">
            {/* Card 1: Meta Header */}
            <div className="bg-white shadow-xl w-full p-8 md:p-16 mb-8">
              <span className="text-xs fw-700 tracking-widest uppercase text-muted mb-6 block">
                {post.category || 'Marketing'}
              </span>
              
              <h1 className="text-3xl md:text-5xl fw-700 text-navy mb-10 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://res.cloudinary.com/qsdwzejd/image/upload/v1789250545/landing_page/photo04.jpg" className="w-full h-full object-cover" alt={typeof post.author === "string" ? post.author : ((post.author as any)?.full_name || "Admin")} />
                  </div>
                  <div>
                    <p className="text-sm fw-600 text-navy mb-0.5">by: {typeof post.author === "string" ? post.author : ((post.author as any)?.full_name || "Admin")}</p>
                    <p className="text-xs text-muted">on: {formattedDate}</p>
                  </div>
                </div>
                <div className="text-xs text-muted fw-600">
                  5 minutes Read
                </div>
              </div>
            </div>

                            {/* Card 2: Main Prose Content */}
              <div className="bg-white shadow-xl w-full p-8 md:p-16 mb-8 relative">
                {/* Floating Share Side-Nav */}
              <div className="hidden lg:flex flex-col items-center gap-4 w-12 absolute top-8 -left-20">
                <span className="text-xs text-muted fw-600 mb-2">share</span>
                <button onClick={() => handleShare('facebook')} className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-navy hover:bg-gray-200 transition-colors">
                  <IconBrandFacebook size={18} />
                </button>
                <button onClick={() => handleShare('twitter')} className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-navy hover:bg-gray-200 transition-colors">
                  <IconBrandTwitter size={18} />
                </button>
                <button onClick={() => handleShare('linkedin')} className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-navy hover:bg-gray-200 transition-colors">
                  <IconBrandLinkedin size={18} />
                </button>
                <button onClick={() => handleShare('email')} className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-navy hover:bg-gray-200 transition-colors">
                  <IconMail size={18} />
                </button>
              </div>
                <div 
                  className="prose prose-lg prose-nets max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              </div>

              {/* Card 3: Author Bio */}
              <div className="bg-white shadow-xl w-full p-8 md:p-12 mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                <div className="w-24 h-24 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                  <img src="https://res.cloudinary.com/qsdwzejd/image/upload/v1789250545/landing_page/photo04.jpg" className="w-full h-full object-cover" alt={typeof post.author === "string" ? post.author : ((post.author as any)?.full_name || "Admin")} />
                </div>
                <div>
                  <h3 className="text-xl fw-700 text-navy mb-2">{typeof post.author === "string" ? post.author : ((post.author as any)?.full_name || "Admin")} - Author</h3>
                  <p className="text-sm text-muted mb-4 leading-relaxed">
                    ResultsPRO's dedicated content team bridging the gap between cutting edge ed-tech and practical classroom implementation.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-nets-light text-navy hover:bg-gray-200 transition-colors">
                      <IconBrandFacebook size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-nets-light text-navy hover:bg-gray-200 transition-colors">
                      <IconBrandTwitter size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-nets-light text-navy hover:bg-gray-200 transition-colors">
                      <IconBrandLinkedin size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 4: Comments List */}
              <div className="bg-white shadow-xl w-full p-8 md:p-12 mb-8">
                <h3 className="text-2xl fw-700 text-navy mb-8">Comments</h3>
                
                {post.comments && post.comments.length > 0 ? (
                  <div className="space-y-8">
                    {(post.comments || []).filter((c: any) => !c.parent_id).map((comment: any) => (
                      <div key={comment.id} className="flex flex-col gap-6">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                            <img src="https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="fw-700 text-navy text-sm">{comment.user_name || "Guest"}</span>
                              <button onClick={() => handleReplyClick(comment.user_name || "Guest", comment.id.toString())} className="text-xs font-bold text-muted hover:text-navy flex items-center gap-1 cursor-pointer">
                                <IconMessageCircle size={14} /> Reply
                              </button>
                            </div>
                            <span className="text-[10px] text-muted uppercase tracking-wider block mb-3">
                              {new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <p className="text-sm text-navy/80 leading-relaxed m-0 bg-nets-light p-4 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-200 whitespace-pre-wrap">
                              {renderCommentContent(comment.content)}
                            </p>
                          </div>
                        </div>

                        {/* Nested Replies */}
                        {(post.comments || []).filter((r: any) => r.parent_id === comment.id).length > 0 && (
                          <div className="ml-14 flex flex-col gap-6">
                            {(post.comments || []).filter((r: any) => r.parent_id === comment.id).map((reply: any) => (
                              <div key={reply.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                                  <img src="https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="fw-700 text-navy text-sm">{reply.user_name || "Guest"}</span>
                                    <button onClick={() => handleReplyClick(reply.user_name || "Guest", comment.id.toString())} className="text-xs font-bold text-muted hover:text-navy flex items-center gap-1 cursor-pointer">
                                      <IconMessageCircle size={14} /> Reply
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-muted uppercase tracking-wider block mb-3">
                                    {new Date(reply.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                  <p className="text-sm text-navy/80 leading-relaxed m-0 bg-nets-light p-4 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-200 whitespace-pre-wrap">
                                    {renderCommentContent(reply.content)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-nets-light border border-gray-200 rounded-xl p-8 text-center text-muted text-sm">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>

              {/* Card 5: Leave Comment Form */}
              <div className="bg-white shadow-xl w-full p-8 md:p-12 mb-8">
                <h3 className="text-2xl fw-700 text-navy mb-8">Leave your Comments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" value={commentFirstName} onChange={e => setCommentFirstName(e.target.value)} placeholder="First Name" className="w-full px-4 py-3 rounded-lg bg-nets-light border border-gray-200 text-sm focus:outline-none focus:border-blue-500" />
                  <input type="text" value={commentLastName} onChange={e => setCommentLastName(e.target.value)} placeholder="Last Name" className="w-full px-4 py-3 rounded-lg bg-nets-light border border-gray-200 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <input type="email" value={commentEmail} onChange={e => setCommentEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-3 rounded-lg bg-nets-light border border-gray-200 text-sm focus:outline-none focus:border-blue-500 mb-4" />
                {replyingTo && (
                  <div className="flex justify-between items-center bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-t-lg border border-b-0 border-blue-100">
                    <span className="font-semibold">Replying to comment...</span>
                    <button onClick={() => { setReplyingTo(null); setCommentContent(''); }} className="hover:text-blue-900 font-bold">&times; Cancel</button>
                  </div>
                )}
                <textarea ref={textareaRef} value={commentContent} onChange={e => setCommentContent(e.target.value)} placeholder="Your Comment" rows={5} className={`w-full px-4 py-3 bg-nets-light border border-gray-200 text-sm focus:outline-none focus:border-blue-500 mb-6 ${replyingTo ? 'rounded-b-lg border-t-0' : 'rounded-lg'}`}></textarea>
                <button onClick={handleCommentSubmit} disabled={commentLoading} className="btn" style={{ backgroundColor: "var(--color-nets-red)", color: "white", padding: "0.75rem 2rem", opacity: commentLoading ? 0.7 : 1 }}>
                  {commentLoading ? "Submitting..." : "Submit your Comment"}
                </button>
              </div>
              {/* Card 6: Subscribe */}
              <div className="bg-white shadow-xl w-full p-8 md:p-12 mb-8 text-center flex flex-col items-center">
                <h3 className="text-2xl fw-700 text-navy mb-4">Subscribe to our Blog</h3>
                <p className="text-sm text-muted mb-8 max-w-md mx-auto">
                  Get the latest educational insights, product updates, and thought leadership delivered straight to your inbox.
                </p>
                <div className="flex w-full max-w-md mx-auto relative">
                  <input type="email" value={subEmail} onChange={e => setSubEmail(e.target.value)} placeholder="Enter email address..." className="w-full px-5 py-3 rounded-full bg-nets-light border border-gray-200 text-sm focus:outline-none focus:border-blue-500 pr-32" />
                  <button onClick={handleSubscribeSubmit} disabled={subLoading} className="absolute right-1 top-1 bottom-1 px-6 rounded-full text-white text-xs fw-700 transition-colors" style={{ backgroundColor: "var(--color-nets-red)", opacity: subLoading ? 0.7 : 1 }}>
                    {subLoading ? "..." : "Subscribe"}
                  </button>
                </div>
              </div>

              {/* Card 7: Related Posts */}
              <div className="w-full mt-8">
                <h3 className="text-2xl fw-700 text-navy mb-6 text-center">Related Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Dummy Related Post 1 */}
                  <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                    <div className="h-32 bg-gray-200">
                      <img src="https://res.cloudinary.com/qsdwzejd/image/upload/v1789250545/landing_page/photo04.jpg" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-[10px] fw-700 text-muted uppercase tracking-widest mb-2">Education</span>
                      <h4 className="text-sm fw-700 text-navy leading-snug mb-3">Bridging the gap with Edge-Sync Learning</h4>
                      <div className="mt-auto">
                        <span className="text-xs fw-600 text-red" style={{ color: "var(--color-nets-red)" }}>Read full article</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dummy Related Post 2 */}
                  <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                    <div className="h-32 bg-gray-200">
                      <img src="https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-[10px] fw-700 text-muted uppercase tracking-widest mb-2">Product</span>
                      <h4 className="text-sm fw-700 text-navy leading-snug mb-3">How we built ExamsPRO for offline CBT</h4>
                      <div className="mt-auto">
                        <span className="text-xs fw-600 text-red" style={{ color: "var(--color-nets-red)" }}>Read full article</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dummy Related Post 3 */}
                  <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                    <div className="h-32 bg-gray-200">
                      <img src="https://res.cloudinary.com/qsdwzejd/image/upload/v1789250555/landing_page/photo08.jpg" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-[10px] fw-700 text-muted uppercase tracking-widest mb-2">Marketing</span>
                      <h4 className="text-sm fw-700 text-navy leading-snug mb-3">5 Ways to increase school admissions in 2026</h4>
                      <div className="mt-auto">
                        <span className="text-xs fw-600 text-red" style={{ color: "var(--color-nets-red)" }}>Read full article</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}