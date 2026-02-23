import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Eraser } from 'lucide-react';

const TOOLBAR_BUTTON =
  'inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50';

const normalizeHtml = (html) => {
  if (!html) return '';
  if (html === '<br>') return '';
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
  const selectionRef = useRef(null);

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
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    const range = selectionRef.current;
    if (!sel || !range) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const runCommand = (command, commandValue = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    saveSelection();
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt('Lim inn lenke (https://...)');
    if (!url) return;
    runCommand('createLink', url);
  };

  const toolbarButtonProps = {
    type: 'button',
    className: TOOLBAR_BUTTON,
    onMouseDown: (e) => e.preventDefault(),
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}

      <div className="rounded-md border border-gray-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-2">
          <button {...toolbarButtonProps} onClick={() => runCommand('bold')} title="Fet">
            <Bold className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onClick={() => runCommand('italic')} title="Kursiv">
            <Italic className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onClick={() => runCommand('underline')} title="Understrek">
            <Underline className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onClick={() => runCommand('insertUnorderedList')} title="Punktliste">
            <List className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onClick={() => runCommand('insertOrderedList')} title="Nummerert liste">
            <ListOrdered className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onClick={() => runCommand('formatBlock', '<h2>')} title="Overskrift">
            <span className="text-xs font-bold">H2</span>
          </button>
          <button {...toolbarButtonProps} onClick={() => runCommand('formatBlock', '<p>')} title="Brødtekst">
            <span className="text-xs font-bold">P</span>
          </button>
          <button {...toolbarButtonProps} onClick={insertLink} title="Lenke">
            <Link2 className="h-4 w-4" />
          </button>
          <button {...toolbarButtonProps} onClick={() => runCommand('removeFormat')} title="Fjern formatering">
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={saveSelection}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onFocus={saveSelection}
          className="w-full p-3 outline-none prose prose-sm max-w-none"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      </div>

      <p className="text-xs text-gray-500">Rich text lagres som HTML. Ingen tegnbegrensning i editoren.</p>
    </div>
  );
};

export default RichTextEditor;
