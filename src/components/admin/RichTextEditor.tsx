import { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Heading2, Undo, Redo, Eye, Code } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({ value, onChange, placeholder, rows = 6 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHtml, setShowHtml] = useState(false);

  // Sync external value into editor on mount / when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback((command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = window.prompt('URL del enlace:');
    if (url) exec('createLink', url);
  }, [exec]);

  const btn = (icon: React.ReactNode, title: string, onClick: () => void, active = false) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-primary-100 text-primary-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="border border-ink-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-ink-200 bg-ink-50">
        {btn(<Bold className="w-4 h-4" />, 'Negrita', () => exec('bold'))}
        {btn(<Italic className="w-4 h-4" />, 'Cursiva', () => exec('italic'))}
        {btn(<Underline className="w-4 h-4" />, 'Subrayado', () => exec('underline'))}
        <span className="w-px h-5 bg-ink-200 mx-1" />
        {btn(<Heading2 className="w-4 h-4" />, 'Encabezado', () => exec('formatBlock', 'h3'))}
        {btn(<List className="w-4 h-4" />, 'Lista con viñetas', () => exec('insertUnorderedList'))}
        {btn(<ListOrdered className="w-4 h-4" />, 'Lista numerada', () => exec('insertOrderedList'))}
        <span className="w-px h-5 bg-ink-200 mx-1" />
        {btn(<Link2 className="w-4 h-4" />, 'Insertar enlace', insertLink)}
        <span className="w-px h-5 bg-ink-200 mx-1" />
        {btn(<Undo className="w-4 h-4" />, 'Deshacer', () => exec('undo'))}
        {btn(<Redo className="w-4 h-4" />, 'Rehacer', () => exec('redo'))}
        <span className="w-px h-5 bg-ink-200 mx-1" />
        {btn(<Eye className="w-4 h-4" />, 'Vista previa', () => setShowPreview((v) => !v), showPreview)}
        {btn(<Code className="w-4 h-4" />, 'Ver HTML', () => setShowHtml((v) => !v), showHtml)}
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="rich-content p-4 text-ink-800"
          style={{ minHeight: `${rows * 1.5}rem` }}
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-ink-400">Sin contenido</p>' }}
        />
      ) : showHtml ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 font-mono text-xs text-ink-800 bg-ink-50 focus:outline-none resize-none"
          style={{ minHeight: `${rows * 1.5}rem` }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          className="w-full p-4 text-ink-900 focus:outline-none rich-content"
          style={{ minHeight: `${rows * 1.5}rem` }}
        />
      )}
    </div>
  );
}
