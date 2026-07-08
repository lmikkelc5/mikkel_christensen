"use client";

import { Bold, Code, Heading1, Heading2, ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, Table2, UnderlineIcon, Video } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  const insertHtml = (html: string) => {
    run("insertHTML", html);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="surface overflow-hidden p-0">
        <div className="flex flex-wrap gap-2 border-b p-3">
          <ToolbarButton onClick={() => run("bold")} label="Bold"><Bold className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => run("italic")} label="Italic"><Italic className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => run("underline")} label="Underline"><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertHtml("<h2>Heading</h2>")} label="Heading 2"><Heading1 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertHtml("<h3>Subheading</h3>")} label="Heading 3"><Heading2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => run("formatBlock", "blockquote")} label="Quote"><Quote className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => run("insertUnorderedList")} label="Bullets"><List className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => run("insertOrderedList")} label="Numbered list"><ListOrdered className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertHtml("<pre><code>// code</code></pre>")} label="Code block"><Code className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertLink(run)} label="Link"><Link2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertHtml("<hr />")} label="Rule"><Minus className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertHtml("<table><thead><tr><th>Column</th><th>Column</th></tr></thead><tbody><tr><td>Value</td><td>Value</td></tr></tbody></table>")} label="Table"><Table2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertMedia("image", insertHtml)} label="Image"><ImageIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => insertMedia("video", insertHtml)} label="Video"><Video className="h-4 w-4" /></ToolbarButton>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="prose-custom min-h-[320px] max-w-none p-4 outline-none"
          dangerouslySetInnerHTML={{ __html: value }}
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
        />
      </div>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Content is stored as clean HTML in the content folder.
      </p>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border hover:bg-[var(--color-accent-soft)]"
    >
      {children}
    </button>
  );
}

function insertLink(run: (command: string, commandValue?: string) => void) {
  const href = window.prompt("Enter a URL");
  if (href) {
    run("createLink", href);
  }
}

function insertMedia(type: "image" | "video", insertHtml: (html: string) => void) {
  const src = window.prompt(`Enter the ${type} URL`);
  if (!src) return;
  if (type === "image") {
    insertHtml(`<img src="${src}" alt="" />`);
    return;
  }
  insertHtml(`<video controls src="${src}"></video>`);
}
