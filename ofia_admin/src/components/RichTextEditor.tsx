'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { loadKaTeX, renderLatexInHtml } from '@/lib/math-renderer';
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
  Redo,
  Eye,
  FileCode,
  Columns,
  Edit3
} from 'lucide-react';

const SigmaIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 7V4H6l6 8-6 8h12v-3" />
  </svg>
);

// Configure marked with standard GFM rules
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Configure Turndown for clean ATX markdown generation
function createTurndownService() {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    hr: '---',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
  });

  td.addRule('strikethrough', {
    filter: ['del', 's'] as any,
    replacement: (content) => `~~${content}~~`,
  });

  return td;
}

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

// WYSIWYG Toolbar
const MenuBar = ({ 
  editor,
  wysiwygView,
  setWysiwygView 
}: { 
  editor: any;
  wysiwygView: 'edit' | 'preview';
  setWysiwygView: (v: 'edit' | 'preview') => void;
}) => {
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

  const addMath = () => {
    const formula = window.prompt(
      'Enter LaTeX math formula (e.g. E = mc^2, \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}, \\int_0^1 x^2 dx):',
      'E = mc^2'
    );
    if (!formula || !formula.trim()) return;

    const isBlock = window.confirm(
      'Insert as Display / Block formula ($$)?\n\nClick OK for centered Block ($$...$$)\nClick Cancel for Inline formula ($...$)'
    );

    const clean = formula.trim();
    if (isBlock) {
      editor.chain().focus().insertContent(`<p>$$${clean}$$</p>`).run();
    } else {
      editor.chain().focus().insertContent(` $${clean}$ `).run();
    }
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
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('nexa_auth_token') || localStorage.getItem('resultspro_admin_token')
          : null;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData
        });
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          const errText = await res.text().catch(() => '');
          data = { error: errText || `Upload failed with HTTP ${res.status}` };
        }
        
        if (res.ok && data?.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
          toast.success('Image added', { id: loadingToast });
        } else {
          toast.error(data?.error || 'Upload failed', { id: loadingToast });
        }
      } catch (err: any) {
        toast.error('Something went wrong: ' + (err?.message || 'Network error'), { id: loadingToast });
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
    <div className="flex flex-wrap items-center gap-1">
      {/* Headings */}
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

      {/* Formatting */}
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

      {/* Lists & Quotes */}
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
          title="Quote Block"
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
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* Media & Links */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            toggleLink();
          }}
          className={buttonClass(editor.isActive('link'))}
          title={editor.isActive('link') ? "Edit Link" : "Insert Link"}
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
            <Unlink className="w-4 h-4" />
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
          title="Upload & Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            addMath();
          }}
          className={buttonClass(false)}
          title="Insert LaTeX Math Formula ($$...$$)"
        >
          <SigmaIcon className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* History */}
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

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* WYSIWYG View Switcher (Edit vs Preview) */}
      <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs ml-auto">
        <button
          type="button"
          onClick={() => setWysiwygView('edit')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
            wysiwygView === 'edit' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Visual WYSIWYG Editor"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          type="button"
          onClick={() => setWysiwygView('preview')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
            wysiwygView === 'preview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Live LaTeX Math Preview"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>
    </div>
  );
};

// Markdown Toolbar with formatting snippets and preview switcher
const MarkdownToolbar = ({ 
  onInsert, 
  onUploadImage,
  markdownView, 
  setMarkdownView 
}: { 
  onInsert: (before: string, after?: string, defaultText?: string) => void;
  onUploadImage: () => void;
  markdownView: 'write' | 'preview' | 'split';
  setMarkdownView: (v: 'write' | 'preview' | 'split') => void;
}) => {
  const toolBtnClass = 'p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-center cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Markdown quick shortcuts */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onInsert('# ', '', 'Heading 1')}
          className={toolBtnClass}
          title="Heading 1 (# )"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('## ', '', 'Heading 2')}
          className={toolBtnClass}
          title="Heading 2 (## )"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('### ', '', 'Heading 3')}
          className={toolBtnClass}
          title="Heading 3 (### )"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onInsert('**', '**', 'bold text')}
          className={toolBtnClass}
          title="Bold (**text**)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('_', '_', 'italic text')}
          className={toolBtnClass}
          title="Italic (_text_)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('~~', '~~', 'strikethrough')}
          className={toolBtnClass}
          title="Strikethrough (~~text~~)"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('`', '`', 'code')}
          className={toolBtnClass}
          title="Inline Code (`code`)"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onInsert('- ', '', 'List item')}
          className={toolBtnClass}
          title="Bullet List (- item)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('1. ', '', 'First item')}
          className={toolBtnClass}
          title="Numbered List (1. item)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('> ', '', 'Quote')}
          className={toolBtnClass}
          title="Blockquote (> quote)"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('```\n', '\n```', 'code block')}
          className={toolBtnClass}
          title="Code Block (```)"
        >
          <SquareCode className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('\n---\n', '', '')}
          className={toolBtnClass}
          title="Horizontal Rule (---)"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onInsert('[', '](https://example.com)', 'link title')}
          className={toolBtnClass}
          title="Insert Markdown Link [title](url)"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onUploadImage}
          className={toolBtnClass}
          title="Upload & Insert Image ![alt](url)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const formula = window.prompt(
              'Enter LaTeX math formula (e.g. E = mc^2, \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}, \\int_0^1 x^2 dx):',
              'E = mc^2'
            );
            if (!formula || !formula.trim()) return;
            const isBlock = window.confirm(
              'Insert as Display / Block formula ($$)?\n\nClick OK for centered Block ($$...$$)\nClick Cancel for Inline formula ($...$)'
            );
            const clean = formula.trim();
            if (isBlock) {
              onInsert('\n$$\n', '\n$$\n', clean);
            } else {
              onInsert('$', '$', clean);
            }
          }}
          className={toolBtnClass}
          title="Insert LaTeX Math Formula ($$...$$)"
        >
          <SigmaIcon className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-1 self-center" />

      {/* Markdown View Switcher (Write / Preview / Split) */}
      <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
        <button
          type="button"
          onClick={() => setMarkdownView('write')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
            markdownView === 'write' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Raw Markdown Editor"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Write</span>
        </button>
        <button
          type="button"
          onClick={() => setMarkdownView('preview')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
            markdownView === 'preview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Live HTML Preview"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
        <button
          type="button"
          onClick={() => setMarkdownView('split')}
          className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
            markdownView === 'split' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Side-by-Side Split View"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split</span>
        </button>
      </div>
    </div>
  );
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg');
  const [markdownContent, setMarkdownContent] = useState('');
  const [markdownView, setMarkdownView] = useState<'write' | 'preview' | 'split'>('write');
  const [wysiwygView, setWysiwygView] = useState<'edit' | 'preview'>('edit');
  const [, setMathRenderTick] = useState(0);
  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadKaTeX().then(() => {
      setMathRenderTick((t) => t + 1);
    });
  }, []);

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
      if (editorMode === 'wysiwyg') {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap ProseMirror rich-editor-content focus:outline-none min-h-[420px] p-5 text-slate-800',
      },
    },
  });

  // Keep editor in sync with external content updates without resetting selection during typing
  useEffect(() => {
    if (!editor) return;
    if (editorMode === 'wysiwyg') {
      const isSame = editor.getHTML() === content || (content === '' && editor.isEmpty);
      if (!isSame) {
        editor.commands.setContent(content || '', { emitUpdate: false });
      }
    }
  }, [content, editor, editorMode]);

  // Mode Switch Handler
  const handleSwitchMode = (newMode: 'wysiwyg' | 'markdown') => {
    if (newMode === editorMode) return;

    if (newMode === 'markdown') {
      // Transition WYSIWYG -> Markdown
      const currentHtml = editor ? editor.getHTML() : content;
      if (!currentHtml || currentHtml === '<p></p>' || (editor && editor.isEmpty)) {
        setMarkdownContent('');
      } else {
        const td = createTurndownService();
        const md = td.turndown(currentHtml);
        setMarkdownContent(md);
      }
      setEditorMode('markdown');
      toast.success('Switched to Markdown mode');
    } else {
      // Transition Markdown -> WYSIWYG
      const parsedHtml = (marked.parse(markdownContent, { async: false }) as string) || '';
      onChange(parsedHtml);
      if (editor) {
        editor.commands.setContent(parsedHtml, { emitUpdate: false });
      }
      setEditorMode('wysiwyg');
      toast.success('Switched to WYSIWYG mode');
    }
  };

  // Markdown Textarea Change Handler
  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdownContent(newMarkdown);
    const parsedHtml = (marked.parse(newMarkdown, { async: false }) as string) || '';
    onChange(parsedHtml);
  };

  // Helper to insert markdown syntax at cursor position
  const insertMarkdownSnippet = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = markdownTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || defaultText;

    const replacement = `${before}${selected}${after}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    handleMarkdownChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  // Image uploader for Markdown mode
  const handleMarkdownImageUpload = () => {
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
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('nexa_auth_token') || localStorage.getItem('resultspro_admin_token')
          : null;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData
        });
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          const errText = await res.text().catch(() => '');
          data = { error: errText || `Upload failed with HTTP ${res.status}` };
        }
        
        if (res.ok && data?.url) {
          const imgMarkdown = `\n![${file.name.replace(/\.[^/.]+$/, "")}](${data.url})\n`;
          insertMarkdownSnippet(imgMarkdown, '', '');
          toast.success('Image inserted into Markdown', { id: loadingToast });
        } else {
          toast.error(data?.error || 'Upload failed', { id: loadingToast });
        }
      } catch (err: any) {
        toast.error('Something went wrong: ' + (err?.message || 'Network error'), { id: loadingToast });
      }
    };
    
    input.click();
  };

  // Word & character stats
  const currentText = editorMode === 'wysiwyg' 
    ? (editor ? editor.getText() : '')
    : markdownContent;
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const charCount = currentText.length;
  const latexMatches = (currentText || '').match(/\$\$[\s\S]+?\$\$|\$[^\$\s](?:[^\$]*?[^\$\s])?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g);
  const latexCount = latexMatches ? latexMatches.length : 0;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      {/* Top Toolbar Container */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-slate-200 bg-slate-50/90 select-none">
        {/* Left Formatting Tools */}
        <div className="flex-1 min-w-[280px]">
          {editorMode === 'wysiwyg' ? (
            <MenuBar 
              editor={editor} 
              wysiwygView={wysiwygView} 
              setWysiwygView={setWysiwygView} 
            />
          ) : (
            <MarkdownToolbar 
              onInsert={insertMarkdownSnippet}
              onUploadImage={handleMarkdownImageUpload}
              markdownView={markdownView}
              setMarkdownView={setMarkdownView}
            />
          )}
        </div>

        {/* Right Mode Toggle Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => handleSwitchMode('wysiwyg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              editorMode === 'wysiwyg'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
            title="Visual WYSIWYG Editor"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>WYSIWYG</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('markdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              editorMode === 'markdown'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
            title="Markdown Source Editor"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {editorMode === 'wysiwyg' ? (
        wysiwygView === 'edit' ? (
          <div className="rich-editor-wrapper bg-white">
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div className="rich-editor-wrapper p-6 min-h-[440px] bg-white overflow-y-auto">
            {(editor ? editor.getHTML() : content)?.trim() ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: renderLatexInHtml(editor ? editor.getHTML() : content) 
                }} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                <FileCode className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-semibold text-slate-500">Nothing to preview yet</p>
                <p className="text-xs text-slate-400 mt-1">Switch to Edit mode to type some content</p>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="bg-white">
          {/* Write Mode */}
          {markdownView === 'write' && (
            <textarea
              ref={markdownTextareaRef}
              value={markdownContent}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const val = target.value;
                  const nextVal = val.substring(0, start) + '  ' + val.substring(end);
                  handleMarkdownChange(nextVal);
                  setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 2;
                  }, 0);
                }
              }}
              placeholder="# Write your blog post in Markdown format...&#10;&#10;Use ## for sections, **bold**, _italic_, - lists, or ![images](url)."
              className="w-full min-h-[440px] p-5 font-mono text-sm leading-relaxed text-slate-800 bg-slate-50/30 focus:bg-white focus:outline-none resize-y"
              spellCheck={true}
            />
          )}

          {/* Preview Mode */}
          {markdownView === 'preview' && (
            <div className="rich-editor-wrapper p-6 min-h-[440px] bg-white overflow-y-auto">
              {markdownContent.trim() ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: renderLatexInHtml((marked.parse(markdownContent, { async: false }) as string) || '') 
                  }} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                  <FileCode className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-500">Nothing to preview yet</p>
                  <p className="text-xs text-slate-400 mt-1">Switch to Write mode to type some markdown</p>
                </div>
              )}
            </div>
          )}

          {/* Split Mode */}
          {markdownView === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <textarea
                ref={markdownTextareaRef}
                value={markdownContent}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const target = e.currentTarget;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const val = target.value;
                    const nextVal = val.substring(0, start) + '  ' + val.substring(end);
                    handleMarkdownChange(nextVal);
                    setTimeout(() => {
                      target.selectionStart = target.selectionEnd = start + 2;
                    }, 0);
                  }
                }}
                placeholder="# Type markdown here..."
                className="w-full min-h-[440px] p-5 font-mono text-sm leading-relaxed text-slate-800 bg-slate-50/30 focus:bg-white focus:outline-none resize-none"
                spellCheck={true}
              />
              <div className="rich-editor-wrapper p-5 min-h-[440px] bg-white overflow-y-auto">
                {markdownContent.trim() ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderLatexInHtml((marked.parse(markdownContent, { async: false }) as string) || '') 
                    }} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                    <p className="text-xs text-slate-400">Live preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span className="text-slate-300">•</span>
          <span>{charCount} characters</span>
          {latexCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[11px]">
                <SigmaIcon className="w-3 h-3" />
                {latexCount} {latexCount === 1 ? 'math formula' : 'math formulas'}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${editorMode === 'wysiwyg' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          <span className="capitalize">{editorMode} mode active</span>
        </div>
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

        .rich-editor-wrapper a,
        .rich-editor-wrapper .ProseMirror a,
        .rich-editor-wrapper .tiptap a {
          color: #0069FF !important;
          text-decoration: underline !important;
        }

        .rich-editor-wrapper img,
        .rich-editor-wrapper .ProseMirror img,
        .rich-editor-wrapper .tiptap img {
          border-radius: 0.5rem !important;
          max-width: 100% !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
        }

        .rich-editor-wrapper .katex-math-display {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          margin: 1.5rem 0 !important;
          padding: 1.25rem 1rem !important;
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0.75rem !important;
          overflow-x: auto !important;
        }

        .rich-editor-wrapper .katex-math-inline {
          display: inline-flex !important;
          align-items: center !important;
          vertical-align: middle !important;
          padding: 0 0.2rem !important;
        }

        .rich-editor-wrapper .katex {
          font-size: 1.15em !important;
          text-rendering: auto !important;
        }

        .rich-editor-wrapper .katex-display > .katex {
          display: inline-block !important;
          white-space: nowrap !important;
          text-align: initial !important;
        }
      `}</style>
    </div>
  );
}
