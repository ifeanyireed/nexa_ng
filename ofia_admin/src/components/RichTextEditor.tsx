'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  List, 
  ListOrdered, 
  Quote, 
  SquareCode, 
  Minus, 
  Link as LinkIcon, 
  Unlink, 
  ImageIcon, 
  Undo, 
  Redo 
} from 'lucide-react';

// Custom Heading extension rendering distinct Tailwind typography classes directly on the DOM node
const CustomHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level || 1;
    const classes: Record<number, string> = {
      1: 'editor-h1 text-3xl font-extrabold text-slate-900 mt-6 mb-3 tracking-tight block',
      2: 'editor-h2 text-2xl font-bold text-slate-900 mt-5 mb-2.5 tracking-tight block',
      3: 'editor-h3 text-xl font-bold text-slate-800 mt-4 mb-2 block',
    };

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        class: classes[level] || 'font-bold block' 
      }),
      0,
    ];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  // Re-render toolbar when editor transaction or selection updates
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => setTick((t) => t + 1);
    editor.on('transaction', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    return () => {
      editor.off('transaction', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Web URL', previousUrl || 'https://');
    
    if (url === null) {
      return;
    }
    
    if (url === '' || url === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const loadingToast = toast.loading('Uploading image...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_path', 'blog/content');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (res.ok && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
          toast.success('Image added', { id: loadingToast });
        } else {
          toast.error(data.error || 'Upload failed', { id: loadingToast });
        }
      } catch (err) {
        toast.error('Something went wrong', { id: loadingToast });
      }
    };
    
    input.click();
  };

  const buttonClass = (isActive: boolean, disabled: boolean = false) => `
    p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center
    ${disabled 
      ? 'text-slate-300 cursor-not-allowed' 
      : isActive 
        ? 'bg-blue-100 text-blue-700 shadow-xs font-semibold' 
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 cursor-pointer'
    }
  `;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/90 rounded-t-lg select-none">
      {/* 1. Document Structure / Headings */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setParagraph().run();
          }}
          className={buttonClass(editor.isActive('paragraph'))}
          title="Normal Text (Paragraph)"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={buttonClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1 (Large Title)"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={buttonClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2 (Section Subtitle)"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={buttonClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3 (Small Subheading)"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* 2. Inline Text Formatting */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={buttonClass(editor.isActive('bold'))}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={buttonClass(editor.isActive('italic'))}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          className={buttonClass(editor.isActive('underline'))}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
          className={buttonClass(editor.isActive('strike'))}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCode().run();
          }}
          className={buttonClass(editor.isActive('code'))}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* 3. Lists & Blocks */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={buttonClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={buttonClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={buttonClass(editor.isActive('blockquote'))}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCodeBlock().run();
          }}
          className={buttonClass(editor.isActive('codeBlock'))}
          title="Code Block"
        >
          <SquareCode className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setHorizontalRule().run();
          }}
          className={buttonClass(false)}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* 4. Links & Images */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            toggleLink();
          }}
          className={buttonClass(editor.isActive('link'))}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {editor.isActive('link') && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().unsetLink().run();
            }}
            className={buttonClass(false)}
            title="Remove Link"
          >
            <Unlink className="w-4 h-4 text-red-500" />
          </button>
        )}

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            addImage();
          }}
          className={buttonClass(false)}
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* 5. Undo & Redo */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={!editor.can().undo()}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          className={buttonClass(false, !editor.can().undo())}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={!editor.can().redo()}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          className={buttonClass(false, !editor.can().redo())}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false, // Replaced by CustomHeading with direct class output
      }),
      CustomHeading,
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap ProseMirror rich-editor-content focus:outline-none min-h-[400px] p-5 text-slate-800',
      },
    },
  });

  // Keep editor in sync with external content updates without resetting selection during typing
  useEffect(() => {
    if (!editor) return;
    const isSame = editor.getHTML() === content || (content === '' && editor.isEmpty);
    if (!isSame) {
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      <MenuBar editor={editor} />
      <div className="rich-editor-wrapper bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Embedded scoped stylesheet to guarantee visual formatting regardless of font or global CSS caching */}
      <style>{`
        .rich-editor-wrapper .editor-h1,
        .rich-editor-wrapper h1,
        .rich-editor-wrapper .ProseMirror h1,
        .rich-editor-wrapper .tiptap h1 {
          font-size: 2.25rem !important;
          font-weight: 800 !important;
          line-height: 1.25 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
          color: #0f172a !important;
          display: block !important;
          letter-spacing: -0.025em !important;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        .rich-editor-wrapper .editor-h2,
        .rich-editor-wrapper h2,
        .rich-editor-wrapper .ProseMirror h2,
        .rich-editor-wrapper .tiptap h2 {
          font-size: 1.75rem !important;
          font-weight: 700 !important;
          line-height: 1.35 !important;
          margin-top: 1.25rem !important;
          margin-bottom: 0.5rem !important;
          color: #0f172a !important;
          display: block !important;
          letter-spacing: -0.02em !important;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        .rich-editor-wrapper .editor-h3,
        .rich-editor-wrapper h3,
        .rich-editor-wrapper .ProseMirror h3,
        .rich-editor-wrapper .tiptap h3 {
          font-size: 1.35rem !important;
          font-weight: 600 !important;
          line-height: 1.4 !important;
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
          color: #1e293b !important;
          display: block !important;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        .rich-editor-wrapper p,
        .rich-editor-wrapper .ProseMirror p,
        .rich-editor-wrapper .tiptap p {
          font-size: 1rem !important;
          line-height: 1.75 !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.75rem !important;
          color: #334155 !important;
        }

        .rich-editor-wrapper ul,
        .rich-editor-wrapper .ProseMirror ul,
        .rich-editor-wrapper .tiptap ul {
          list-style-type: disc !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.75rem !important;
          padding-left: 1.75rem !important;
        }

        .rich-editor-wrapper ol,
        .rich-editor-wrapper .ProseMirror ol,
        .rich-editor-wrapper .tiptap ol {
          list-style-type: decimal !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.75rem !important;
          padding-left: 1.75rem !important;
        }

        .rich-editor-wrapper li,
        .rich-editor-wrapper .ProseMirror li,
        .rich-editor-wrapper .tiptap li {
          display: list-item !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
        }

        .rich-editor-wrapper blockquote,
        .rich-editor-wrapper .ProseMirror blockquote,
        .rich-editor-wrapper .tiptap blockquote {
          border-left: 4px solid #0069FF !important;
          padding: 0.75rem 1rem !important;
          margin: 1.25rem 0 !important;
          font-style: italic !important;
          color: #475569 !important;
          background-color: #f8fafc !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
        }

        .rich-editor-wrapper code,
        .rich-editor-wrapper .ProseMirror code,
        .rich-editor-wrapper .tiptap code {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          padding: 0.2rem 0.45rem !important;
          border-radius: 0.35rem !important;
          font-size: 0.875em !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          border: 1px solid #e2e8f0 !important;
        }

        .rich-editor-wrapper pre,
        .rich-editor-wrapper .ProseMirror pre,
        .rich-editor-wrapper .tiptap pre {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          padding: 1rem 1.25rem !important;
          border-radius: 0.75rem !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          overflow-x: auto !important;
          margin: 1.25rem 0 !important;
        }
      `}</style>
    </div>
  );
}
