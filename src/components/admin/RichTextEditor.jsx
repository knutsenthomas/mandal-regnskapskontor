import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Eraser } from 'lucide-react';

const TOOLBAR_BUTTON =
  'inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100';

const normalizeHtml = (html) => {
  if (!html || html === '<br>') return '';
  return html;
};

const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder = 'Skriv her...',
  minHeight = 180,
}) => {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const next = normalizeHtml(value);
    if (editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(normalizeHtml(editorRef.current.innerHTML));
  };

  const saveSelection = () => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  useEffect(() => {
    const onSelectionChange = () => saveSelection();
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  const execCommand = (command, value = null) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    // Restore selection if it was lost
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    document.execCommand(command, false, value);
    emitChange();
  };

  const setLink = () => {
    const url = window.prompt('Lim inn lenke (https://...)');
    if (url === null) return;
    if (!url.trim()) {
      execCommand('unlink');
    } else {
      execCommand('createLink', url.trim());
    }
  };

  const clearFormatting = () => {
    execCommand('removeFormat');
    execCommand('formatBlock', 'p');
  };

  const handleToolbar = (fn) => (e) => {
    e.preventDefault();
    fn();
  };

  const toolbarButtonProps = {
    type: 'button',
    className: TOOLBAR_BUTTON,
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}

      <div className="rounded-md border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <div className="flex flex-wrap gap-1 border-b border-gray-100 p-1.5 bg-gray-50/50">
          <button {...toolbarButtonProps} onMouseDown={handleToolbar(() => execCommand('bold'))} title="Fet">
            <Bold className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onMouseDown={handleToolbar(() => execCommand('italic'))} title="Kursiv">
            <Italic className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onMouseDown={handleToolbar(() => execCommand('underline'))} title="Understrek">
            <Underline className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

          <button {...toolbarButtonProps} onMouseDown={handleToolbar(() => execCommand('insertUnorderedList'))} title="Punktliste">
            <List className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onMouseDown={handleToolbar(() => execCommand('insertOrderedList'))} title="Nummerert liste">
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

          <button {...toolbarButtonProps} onMouseDown={handleToolbar(() => execCommand('formatBlock', 'h2'))} title="Overskrift H2">
            <span className="text-xs font-bold leading-none">H2</span>
          </button>
          <button {...toolbarButtonProps} onMouseDown={handleToolbar(() => execCommand('formatBlock', 'p'))} title="Brødtekst">
            <span className="text-xs font-bold leading-none">P</span>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

          <button {...toolbarButtonProps} onMouseDown={handleToolbar(setLink)} title="Lenke">
            <Link2 className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onMouseDown={handleToolbar(clearFormatting)} title="Fjern formatering">
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        <style>{`
          .rte-content {
            outline: none;
            font-family: 'Inter', sans-serif;
          }
          /* Force all pasted content to follow the site's typography */
          .rte-content * {
            font-family: 'Inter', sans-serif !important;
            background-color: transparent !important;
          }
          .rte-content span {
            font-size: inherit !important;
            color: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          .rte-content ul {
            list-style-type: disc;
            margin-left: 1.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .rte-content ol {
            list-style-type: decimal;
            margin-left: 1.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .rte-content h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: var(--primary);
          }
          .rte-content p {
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
            font-size: 1.125rem;
          }
          .rte-content a {
            color: var(--primary);
            text-decoration: underline;
          }
          .rte-content:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            cursor: text;
          }
        `}</style>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={() => {
            saveSelection();
            emitChange();
          }}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onFocus={saveSelection}
          className="rte-content w-full p-4 min-h-[180px] max-w-none text-gray-800 leading-relaxed font-sans text-lg"
          style={{ minHeight, fontFamily: 'inherit' }}
          data-placeholder={placeholder}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
          }}
        />
      </div>

      <p className="text-[10px] text-gray-400">Rich text lagres som HTML. Ingen tegnbegrensning.</p>
    </div>
  );
};

export default RichTextEditor;
