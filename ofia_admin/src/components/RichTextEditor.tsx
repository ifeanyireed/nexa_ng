'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';
import { 
  Bold, Italic, Strikethrough, Code, List, ListOrdered, 
  Quote, Undo, Redo, Heading1, Heading2, Link as LinkIcon, ImageIcon 
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
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

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike') },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code') },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote') },
    { icon: LinkIcon, action: toggleLink, isActive: editor.isActive('link') },
    { icon: ImageIcon, action: addImage, isActive: false },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), isActive: false },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), isActive: false },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg">
      {buttons.map((btn, idx) => {
        const Icon = btn.icon;
        return (
          <button
            key={idx}
            onClick={(e) => { e.preventDefault(); btn.action(); }}
            className={`p-2 rounded ${btn.isActive ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'} transition-colors`}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  );
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
