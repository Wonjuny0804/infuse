import React, { useEffect, useLayoutEffect, useRef } from "react";
import Quill, { Delta, EmitterSource, Op, Range } from "quill";
import "quill/dist/quill.snow.css";

interface Props {
  editorRef: React.RefObject<Quill | null>;
  readOnly?: boolean;
  defaultValue?: Delta | Op[];
  onTextChange?: (
    delta: Delta,
    oldContent: Delta,
    source: EmitterSource
  ) => void;
  onSelectionChange?: (
    range: Range | null,
    oldRange: Range | null,
    source: EmitterSource
  ) => void;
  placeholder?: string;
  className?: string;
  showAttachmentTools?: boolean;
  recipientEmail?: string;
}

const QuillEditor = ({
  readOnly = false,
  editorRef,
  defaultValue,
  onTextChange,
  onSelectionChange,
  placeholder = "Type Message...",
  className = "",
  showAttachmentTools = true,
  recipientEmail,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultValueRef = useRef(defaultValue);
  const onTextChangeRef = useRef(onTextChange);
  const onSelectionChangeRef = useRef(onSelectionChange);

  useLayoutEffect(() => {
    onTextChangeRef.current = onTextChange;
    onSelectionChangeRef.current = onSelectionChange;
  });

  useEffect(() => {
    editorRef.current?.enable(!readOnly);
  }, [editorRef, readOnly]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create recipient area if email is provided
    if (recipientEmail) {
      const recipientDiv = document.createElement("div");
      recipientDiv.className = "email-recipient py-4 text-gray-500 ";
      recipientDiv.innerHTML = `To: ${recipientEmail}`;
      container.appendChild(recipientDiv);
    }

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    editorContainer.className = "editor-main-container";

    // Simplified toolbar options matching the image
    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      ["bold", "italic", "underline"],
    ];

    // Initialize Quill with custom options
    const quill = new Quill(editorContainer, {
      theme: "snow",
      modules: {
        toolbar: {
          container: toolbarOptions,
        },
      },
      placeholder: placeholder,
      bounds: container,
      readOnly: readOnly,
    });

    editorRef.current = quill;

    if (defaultValueRef.current) {
      quill.setContents(defaultValueRef.current);
    }

    // Add custom CSS to match the design
    const style = document.createElement("style");
    style.textContent = `
      .ql-toolbar.ql-snow {
        border: none !important;
        padding: 8px !important;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background-color: #ffffff;
        border-radius: 8px 8px 0 0;
      }
      .ql-container.ql-snow {
        border: none !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      .ql-editor {
        min-height: 100px;
        font-size: 0.95rem;
        padding: 16px !important;
      }
      .ql-editor.ql-blank::before {
        font-style: normal;
        color: #9ca3af;
      }
      .ql-formats {
        margin-right: 10px !important;
      }
      .ql-toolbar button {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .email-recipient {
        font-size: 12px;
        padding-bottom: 12px;
        background-color: #f9fafb;
      }
      .attachment-tools {
        display: flex;
        padding: 8px 16px;
        background-color: #f9fafb;
      }
      .attachment-tools button {
        background: none;
        border: none;
        cursor: pointer;
        margin-right: 16px;
        padding: 4px;
        color: #6b7280;
      }
      .attachment-tools button:hover {
        color: #4b5563;
      }
    `;
    document.head.appendChild(style);

    quill.on(Quill.events.TEXT_CHANGE, (...args) => {
      onTextChangeRef.current?.(...args);
    });

    quill.on(Quill.events.SELECTION_CHANGE, (range, oldRange, source) => {
      onSelectionChangeRef.current?.(range, oldRange, source);
    });

    // Add attachment tools if enabled
    if (showAttachmentTools) {
      const attachmentToolsDiv = document.createElement("div");
      attachmentToolsDiv.className = "attachment-tools";

      // Add attachment buttons similar to the image
      attachmentToolsDiv.innerHTML = `
        <button class="attachment-btn" title="Attach file">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        </button>
        <button class="image-btn" title="Insert image">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>
        <button class="link-btn" title="Insert link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </button>
        <button class="delete-btn" title="Delete message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      container.appendChild(attachmentToolsDiv);
    }

    return () => {
      editorRef.current = null;
      container.innerHTML = "";
      // Remove the style element when unmounting
      document.head.removeChild(style);
    };
  }, [editorRef, readOnly, placeholder, showAttachmentTools, recipientEmail]);

  return (
    <div
      ref={containerRef}
      className={`quill-email-editor ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    ></div>
  );
};

export default QuillEditor;
