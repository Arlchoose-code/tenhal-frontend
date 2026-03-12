"use client"

import { useEditor, EditorContent, useEditorState, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import { useEffect, useRef, useState } from "react"
import { getToken } from "@/lib/auth"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading2, Heading3, Minus, Undo, Redo, Quote, Code, ImageIcon, Loader2, Trash2,
} from "lucide-react"

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5 self-center flex-shrink-0" />
}

function ToolbarButton({ onMouseDown, active, title, disabled, children }: {
  onMouseDown: () => void
  active?: boolean
  title?: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onMouseDown()
      }}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-all flex-shrink-0
        ${active ? "bg-[#1a3c6e] text-white shadow-sm" : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  )
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

// Custom image node view dengan tombol hapus
function ImageNodeView({ node, deleteNode }: { node: any; deleteNode: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <NodeViewWrapper className="relative my-3">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-slate-200"
        style={{ aspectRatio: "16/9" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
        />
        {hovered && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode() }}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </NodeViewWrapper>
  )
}

const CustomImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isStrike: ctx.editor?.isActive("strike") ?? false,
      isH2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isH3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isBullet: ctx.editor?.isActive("bulletList") ?? false,
      isOrdered: ctx.editor?.isActive("orderedList") ?? false,
      isAlignLeft: ctx.editor?.isActive({ textAlign: "left" }) ?? false,
      isAlignCenter: ctx.editor?.isActive({ textAlign: "center" }) ?? false,
      isAlignRight: ctx.editor?.isActive({ textAlign: "right" }) ?? false,
      isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
      isCode: ctx.editor?.isActive("code") ?? false,
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
    }),
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const token = getToken()
    if (!token) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("image", file)
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const json = await res.json()
      if (json.success && json.data?.url) {
        const fullUrl = json.data.url.startsWith("http")
          ? json.data.url
          : `${BACKEND_URL}/${json.data.url}`
        editor.chain().focus().setImage({ src: fullUrl }).run()
      }
    } catch (err) {
      console.error("Upload gagal:", err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (!editor) return null

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
      <ToolbarButton onMouseDown={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editorState.canUndo}>
        <Undo className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editorState.canRedo}>
        <Redo className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleBold().run()} active={editorState.isBold} title="Bold">
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleItalic().run()} active={editorState.isItalic} title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleUnderline().run()} active={editorState.isUnderline} title="Underline">
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleStrike().run()} active={editorState.isStrike} title="Strikethrough">
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editorState.isH2} title="Heading 2">
        <Heading2 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editorState.isH3} title="Heading 3">
        <Heading3 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleBulletList().run()} active={editorState.isBullet} title="Bullet List">
        <List className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleOrderedList().run()} active={editorState.isOrdered} title="Numbered List">
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onMouseDown={() => editor.chain().focus().setTextAlign("left").run()} active={editorState.isAlignLeft} title="Rata Kiri">
        <AlignLeft className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().setTextAlign("center").run()} active={editorState.isAlignCenter} title="Rata Tengah">
        <AlignCenter className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().setTextAlign("right").run()} active={editorState.isAlignRight} title="Rata Kanan">
        <AlignRight className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleBlockquote().run()} active={editorState.isBlockquote} title="Blockquote">
        <Quote className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().toggleCode().run()} active={editorState.isCode} title="Code">
        <Code className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onMouseDown={() => editor.chain().focus().setHorizontalRule().run()} title="Garis Pembatas">
        <Minus className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <label
        title="Upload Gambar"
        className={`w-7 h-7 flex items-center justify-center rounded-md transition-all flex-shrink-0 cursor-pointer
          ${uploading ? "opacity-50 cursor-not-allowed" : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleImageUpload} />
      </label>
    </div>
  )
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const initialValueSet = useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Tulis di sini..." }),
      CustomImage.configure({ inline: false, allowBase64: false }),
    ],
    content: "",
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[180px] px-4 py-3 focus:outline-none text-slate-800 leading-relaxed",
      },
    },
  })

  useEffect(() => {
    if (editor && !initialValueSet.current && value) {
      editor.commands.setContent(value)
      initialValueSet.current = true
    }
  }, [editor, value])

  if (!editor) return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white min-h-[220px] animate-pulse" />
  )

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#1a3c6e]/20 focus-within:border-[#1a3c6e] transition">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}