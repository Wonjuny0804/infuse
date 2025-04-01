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
  recipientEmail?: string;
  onAttachFiles?: (files: File[]) => void;
}

const QuillEditor = ({
  readOnly = false,
  editorRef,
  defaultValue,
  onTextChange,
  onSelectionChange,
  placeholder = "Type Message...",
  className = "",
  recipientEmail,
  onAttachFiles,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultValueRef = useRef(defaultValue);
  const onTextChangeRef = useRef(onTextChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onAttachFilesRef = useRef(onAttachFiles);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    onTextChangeRef.current = onTextChange;
    onSelectionChangeRef.current = onSelectionChange;
    onAttachFilesRef.current = onAttachFiles;
  });

  useEffect(() => {
    editorRef.current?.enable(!readOnly);
  }, [editorRef, readOnly]);

  // Create a hidden file input for handling file selection
  useEffect(() => {
    // Create file input only if it doesn't exist yet
    if (!fileInputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.style.display = "none";
      input.accept = "*/*"; // Accept all file types

      input.addEventListener("change", (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0 && onAttachFilesRef.current) {
          onAttachFilesRef.current(files);
          // Reset the input so the same file can be selected again
          (e.target as HTMLInputElement).value = "";
        }
      });

      document.body.appendChild(input);
      fileInputRef.current = input;
    }

    // Clean up on unmount
    return () => {
      if (fileInputRef.current) {
        document.body.removeChild(fileInputRef.current);
        fileInputRef.current = null;
      }
    };
  }, []);

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
    `;
    document.head.appendChild(style);

    quill.on(Quill.events.TEXT_CHANGE, (...args) => {
      onTextChangeRef.current?.(...args);
    });

    quill.on(Quill.events.SELECTION_CHANGE, (range, oldRange, source) => {
      onSelectionChangeRef.current?.(range, oldRange, source);
    });

    return () => {
      editorRef.current = null;
      container.innerHTML = "";
      // Remove the style element when unmounting
      document.head.removeChild(style);
    };
  }, [editorRef, readOnly, placeholder, recipientEmail]);

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
