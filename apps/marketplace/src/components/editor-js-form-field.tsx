"use client";

import type { EditorConfig, OutputData } from "@editorjs/editorjs";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  emptyEditorJsOutputData,
  normalizeToEditorJs,
  parseEditorJsOutputData,
} from "@nimara/ui/lib/richText";

import { cn } from "@/lib/utils";

/**
 * Editor.js injects `max-width: 650px` / `.cdx-block` padding into `document.head`, usually after
 * the app CSS — Tailwind utilities lose. Scoped `!important` rules fix full width + tight Enter spacing.
 */
const EDITOR_LAYOUT_OVERRIDES_CSS = `
/* Keep editor full width and allow natural growth like Saleor Dashboard */
[data-nimara-editorjs] {
  position: relative;
  overflow: visible !important;
}
[data-nimara-editorjs] .codex-editor {
  width: 100% !important;
  max-width: none !important;
  overflow: visible !important;
}
[data-nimara-editorjs] .codex-editor__redactor {
  width: 100% !important;
  max-width: none !important;
  max-height: none !important;
  overflow: visible !important;
}
[data-nimara-editorjs] .codex-editor--narrow .codex-editor__redactor {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
[data-nimara-editorjs] .ce-block__content,
[data-nimara-editorjs] .ce-toolbar__content {
  max-width: none !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
[data-nimara-editorjs] .cdx-block {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
[data-nimara-editorjs] .ce-block {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
[data-nimara-editorjs] .ce-paragraph,
[data-nimara-editorjs] .ce-header {
  line-height: 1.35 !important;
  margin: 0 !important;
}
[data-nimara-editorjs] .ce-paragraph {
  font-size: 1rem !important;
  font-weight: 400 !important;
}
[data-nimara-editorjs] h2.ce-header {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
}
[data-nimara-editorjs] h3.ce-header {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
}
[data-nimara-editorjs] h4.ce-header {
  font-size: 1.125rem !important;
  font-weight: 700 !important;
}
/* Keep block controls inside the input on the right side */
[data-nimara-editorjs] .ce-toolbar {
  left: auto !important;
  right: 0.25rem !important;
}
[data-nimara-editorjs] .ce-toolbar__actions {
  right: 0 !important;
}
[data-nimara-editorjs] .ce-toolbar__plus {
  left: auto !important;
  right: 0 !important;
}
[data-nimara-editorjs] .ce-toolbar__settings-btn {
  left: auto !important;
  right: 2rem !important;
}
/* Default Editor.js z-index is low; product shell uses z-40 fixed bars */
[data-nimara-editorjs] .ce-toolbar,
[data-nimara-editorjs] .ce-inline-toolbar,
[data-nimara-editorjs] .ce-settings,
[data-nimara-editorjs] .ce-toolbox {
  z-index: 60 !important;
}
/* Block toolbox popovers are appended to document.body — parent scope does not apply */
.ce-popover.ce-popover--opened {
  z-index: 60 !important;
}
`.trim();

export type EditorJsFormFieldProps = {
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  /** Initial Editor.js JSON string (or content normalized the same way as Saleor). */
  initialJson: string;
  onBlur?: () => void;
  onChange: (json: string) => void;
};

/**
 * Vendor-panel Editor.js field for Saleor rich text.
 * Editor packages are loaded with `import()` inside `useEffect` so Next/Turbopack never evaluates
 * them during SSR or in the wrong graph — no extra install beyond `@editorjs/*` on `marketplace`.
 */
export function EditorJsFormField({
  initialJson,
  onChange,
  onBlur,
  disabled = false,
  className,
  id,
  "aria-label": ariaLabel,
}: EditorJsFormFieldProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<import("@editorjs/editorjs").default | null>(null);
  const onChangeRef = useRef(onChange);
  const disabledRef = useRef(disabled);

  onChangeRef.current = onChange;
  disabledRef.current = disabled;

  const initialJsonAtMountRef = useRef(initialJson);

  const initialData = useMemo(() => {
    const normalized = normalizeToEditorJs(initialJsonAtMountRef.current);

    return parseEditorJsOutputData(normalized) ?? emptyEditorJsOutputData();
  }, []);

  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const holder = holderRef.current;

    if (!holder) {
      return;
    }

    let cancelled = false;

    setInitError(null);
    holder.innerHTML = "";

    void (async () => {
      try {
        const [
          { default: EditorJS },
          { default: Header },
          { default: List },
          { default: Paragraph },
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header"),
          import("@editorjs/list"),
          import("@editorjs/paragraph"),
        ]);

        if (cancelled || holderRef.current !== holder) {
          return;
        }

        holder.innerHTML = "";

        const editor = new EditorJS({
          holder,
          data: initialData as unknown as OutputData,
          readOnly: disabledRef.current,
          minHeight: 0,
          tools: {
            header: {
              class: Header,
              config: {
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            list: List,
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
              config: {},
            },
          } as unknown as EditorConfig["tools"],
          onChange: async () => {
            if (cancelled || !editorRef.current) {
              return;
            }

            const out = await editorRef.current.save();

            onChangeRef.current(JSON.stringify(out));
          },
        });

        if (cancelled || holderRef.current !== holder) {
          void editor.isReady
            .then(() => {
              try {
                editor.destroy();
              } catch {
                /* noop */
              }
            })
            .catch(() => {
              /* noop */
            });

          return;
        }

        editorRef.current = editor;

        void editor.isReady.then(() => {
          if (cancelled) {
            return;
          }

          void editor.readOnly.toggle(disabledRef.current);
        });
      } catch (e) {
        console.error("[EditorJsFormField] Editor.js failed to load", e);
        if (!cancelled) {
          setInitError(
            e instanceof Error ? e.message : "Editor failed to initialize",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      const ed = editorRef.current;

      editorRef.current = null;
      if (ed) {
        void ed.isReady
          .then(() => {
            try {
              ed.destroy();
            } catch {
              /* noop */
            }
          })
          .catch(() => {
            /* noop */
          });
      }
    };
  }, [initialData]);

  useEffect(() => {
    const ed = editorRef.current;

    if (!ed) {
      return;
    }

    void ed.isReady.then(() => {
      void ed.readOnly.toggle(disabled);
    });
  }, [disabled]);

  return (
    <div
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {initError ? (
        <p className="text-xs text-destructive">{initError}</p>
      ) : null}
      <div className={cn("w-full")} data-nimara-editorjs="">
        <style
          dangerouslySetInnerHTML={{ __html: EDITOR_LAYOUT_OVERRIDES_CSS }}
        />
        <div
          ref={holderRef}
          id={id}
          aria-label={ariaLabel}
          onBlur={onBlur}
          className={cn(
            "w-full text-foreground",
            "[&_.codex-editor]:text-foreground",
            "[&_.ce-block]:!opacity-100",
            "[&_.ce-header]:!text-foreground [&_.ce-paragraph]:!text-foreground",
            "[&_[contenteditable='true']]:!text-foreground",
            "[&_[contenteditable='true']]:![caret-color:hsl(var(--foreground))]",
          )}
        />
      </div>
    </div>
  );
}
