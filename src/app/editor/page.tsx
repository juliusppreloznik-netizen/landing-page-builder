"use client";

import { Puck, Data, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "./editor-dark-theme.css";
import { puckConfig } from "@/lib/puck/config";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AIChatSidebar } from "@/components/AIChatSidebar";
import { ExportHTMLModal } from "@/components/ExportHTMLModal";
import { ColorPickerField } from "@/components/fields/ColorPickerField";

const usePuck = createUsePuck();

// Default empty editor - users create content via generation or drag-and-drop
const initialData: Data = {
  content: [],
  root: { props: {} },
};

// Helper to find selected item - handles both top-level and nested items
function findSelectedItem(
  data: Data,
  itemSelector: { index: number; zone?: string } | null
): { type: string; props: Record<string, unknown>; path: string; zone?: string } | null {
  if (!itemSelector) return null;

  const { index, zone } = itemSelector;

  // Root content zone (empty string, undefined, "default-zone", or "root:default-zone")
  const isRootZone = !zone || zone === "" || zone === "default-zone" || zone.startsWith("root:");
  if (isRootZone) {
    const item = data.content[index];
    if (item) {
      return {
        type: item.type,
        props: item.props as Record<string, unknown>,
        path: `content[${index}]`,
        zone: zone,
      };
    }
    return null;
  }

  // Nested zone format: "ComponentType-componentId:zoneName"
  // Example: "Container-abc123:content" or "Grid-xyz789:column1"
  const zoneParts = zone.split(":");
  if (zoneParts.length === 2) {
    const [componentPath, zoneName] = zoneParts;
    // componentPath is like "Container-abc123"

    // Find the parent component in the content tree
    const findInContent = (
      content: typeof data.content,
      path: string
    ): { type: string; props: Record<string, unknown>; path: string; zone?: string } | null => {
      for (let i = 0; i < content.length; i++) {
        const item = content[i];
        const itemId = `${item.type}-${item.props.id}`;

        if (itemId === componentPath) {
          // Found the parent, now look in its zone
          const zoneContent = (item.props as Record<string, unknown>)[zoneName];
          if (Array.isArray(zoneContent) && zoneContent[index]) {
            const nestedItem = zoneContent[index] as { type: string; props: Record<string, unknown> };
            return {
              type: nestedItem.type,
              props: nestedItem.props,
              path: `${path}[${i}].props.${zoneName}[${index}]`,
              zone: zone,
            };
          }
        }

        // Recursively check nested zones in this item
        const props = item.props as Record<string, unknown>;
        for (const key in props) {
          const value = props[key];
          if (Array.isArray(value) && value.length > 0 && value[0]?.type) {
            const nested = findInContent(
              value as typeof data.content,
              `${path}[${i}].props.${key}`
            );
            if (nested) return nested;
          }
        }
      }
      return null;
    };

    return findInContent(data.content, "content");
  }

  // Fallback: try treating zone as direct content access
  const item = data.content[index];
  if (item) {
    return {
      type: item.type,
      props: item.props as Record<string, unknown>,
      path: `content[${index}]`,
      zone: zone,
    };
  }

  return null;
}

function EditorWithAI() {
  const appState = usePuck((s) => s.appState);
  const dispatch = usePuck((s) => s.dispatch);

  const selectedItem = useMemo(() => {
    return findSelectedItem(appState.data, appState.ui.itemSelector);
  }, [appState.data, appState.ui.itemSelector]);

  const handleApplyChanges = useCallback(
    (changes: Record<string, unknown>) => {
      if (!appState.ui.itemSelector || !selectedItem) return;

      const { index, zone } = appState.ui.itemSelector;

      // For root content
      const isRootZone = !zone || zone === "" || zone === "default-zone" || zone.startsWith("root:");
      if (isRootZone) {
        const newContent = [...appState.data.content];
        newContent[index] = {
          ...newContent[index],
          props: {
            ...newContent[index].props,
            ...changes,
          },
        };

        dispatch({
          type: "setData",
          data: {
            ...appState.data,
            content: newContent,
          },
        });
        return;
      }

      // For nested zones, use the path from selectedItem to update
      // This creates a deep copy and updates the nested item
      const updateNestedItem = (
        content: typeof appState.data.content,
        pathParts: string[],
        changes: Record<string, unknown>
      ): typeof appState.data.content => {
        const newContent = [...content];
        if (pathParts.length === 0) return newContent;

        const match = pathParts[0].match(/\[(\d+)\]/);
        if (!match) return newContent;

        const idx = parseInt(match[1], 10);
        const remaining = pathParts.slice(1);

        if (remaining.length === 0) {
          // Final item
          newContent[idx] = {
            ...newContent[idx],
            props: {
              ...newContent[idx].props,
              ...changes,
            },
          };
        } else {
          // Need to go deeper
          const propMatch = remaining[0].match(/props\.(\w+)/);
          if (propMatch) {
            const propName = propMatch[1];
            const nestedContent = (newContent[idx].props as Record<string, unknown>)[propName];
            if (Array.isArray(nestedContent)) {
              newContent[idx] = {
                ...newContent[idx],
                props: {
                  ...newContent[idx].props,
                  [propName]: updateNestedItem(
                    nestedContent as typeof content,
                    remaining.slice(1),
                    changes
                  ),
                },
              };
            }
          }
        }
        return newContent;
      };

      if (selectedItem.path) {
        const pathParts = selectedItem.path.split(/(?=\[)|\./).filter(Boolean);
        // Remove the leading "content" part
        if (pathParts[0] === "content") {
          pathParts.shift();
        }

        const newContent = updateNestedItem(
          appState.data.content,
          pathParts,
          changes
        );

        dispatch({
          type: "setData",
          data: {
            ...appState.data,
            content: newContent,
          },
        });
      }
    },
    [appState, dispatch, selectedItem]
  );

  return (
    <AIChatSidebar
      selectedElement={selectedItem?.type || null}
      elementProps={selectedItem?.props || null}
      onApplyChanges={handleApplyChanges}
    />
  );
}

export default function EditorPage() {
  const router = useRouter();
  const [data, setData] = useState<Data>(initialData);
  const [pageId, setPageId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Load page data from Supabase or sessionStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("pageId");
    const source = params.get("source");

    if (pid) {
      // Load from Supabase
      setPageId(pid);
      fetch(`/api/pages?id=${pid}`)
        .then((r) => r.json())
        .then(({ version }) => {
          if (version?.content_json) {
            setData(version.content_json as Data);
          }
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    } else if (source === "generated") {
      const stored = sessionStorage.getItem("generatedPageData");
      const storedPageId = sessionStorage.getItem("generatedPageId");
      if (stored) {
        try {
          setData(JSON.parse(stored) as Data);
          if (storedPageId) setPageId(storedPageId);
          sessionStorage.removeItem("generatedPageData");
          sessionStorage.removeItem("generatedPageId");
        } catch {}
      }
      window.history.replaceState({}, "", "/editor");
      setLoaded(true);
    } else {
      setLoaded(true);
    }
  }, []);

  // Auto-save to Supabase when data changes (debounced 2s)
  const handleChange = useCallback(
    (newData: Data) => {
      setData(newData);

      if (!pageId) return;

      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, contentJson: newData }),
        }).catch(() => {});
      }, 2000);
    },
    [pageId]
  );

  const handlePublish = async (publishData: Data) => {
    // Save immediately on publish
    if (pageId) {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, contentJson: publishData }),
      });
    }
    setData(publishData);
  };

  const handleManualSave = useCallback(async () => {
    if (!pageId) return;
    setSaveStatus("saving");
    try {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, contentJson: data }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, [pageId, data]);

  // Grab iframe ref after Puck mounts
  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = document.querySelector("#preview-frame") as HTMLIFrameElement;
      if (iframe) {
        iframeRef.current = iframe;
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [loaded]);

  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Puck Editor - takes remaining space, leaving room for AI sidebar */}
      <div className="flex-1 h-full overflow-hidden" style={{ maxWidth: 'calc(100vw - 320px)' }}>
        <Puck
          key={pageId || "default"}
          config={puckConfig}
          data={data}
          onPublish={handlePublish}
          onChange={handleChange}
          ui={{ rightSideBarVisible: false }}
          overrides={{
            fieldTypes: {
              text: ({ name, onChange, value, children }) => {
                const isColor = /color|Color|backgroundColor/.test(name);
                if (isColor) {
                  return (
                    <ColorPickerField
                      value={value as string || ""}
                      onChange={(v) => onChange(v)}
                    />
                  );
                }
                return <>{children}</>;
              },
            },
            headerActions: () => (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={handleManualSave}
                  disabled={!pageId || saveStatus === "saving"}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: saveStatus === "saved" ? "#1a3a1a" : "#1A1A1A",
                    color: saveStatus === "saved" ? "#4ade80" : "#FFFFFF",
                    border: "1px solid #333", fontSize: "12px", padding: "6px 14px",
                    borderRadius: "6px", cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
                    opacity: !pageId ? 0.4 : 1,
                  }}
                >
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => setShowExport(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "#1A1A1A", color: "#FFFFFF", border: "1px solid #333",
                    fontSize: "12px", padding: "6px 14px", borderRadius: "6px",
                    cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  Export HTML
                </button>
              </div>
            ),
            puck: ({ children }) => (
              <>
                {children}
                {/* Back to projects button — fixed over the Puck header left side */}
                <button
                  onClick={() => router.push("/")}
                  title="Back to projects"
                  style={{
                    position: "fixed", top: "10px", left: "12px", zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "28px", height: "28px", background: "transparent",
                    border: "none", borderRadius: "6px", cursor: "pointer", color: "#888",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#2A2A2A"; e.currentTarget.style.color = "#FFF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* AI Sidebar rendered inside Puck context for usePuck access */}
                <div className="fixed right-0 top-0 w-80 h-screen border-l border-[#222] shadow-xl z-50">
                  <EditorWithAI />
                </div>
                {/* Export HTML Modal */}
                <ExportHTMLModal
                  isOpen={showExport}
                  onClose={() => setShowExport(false)}
                  iframeRef={iframeRef.current}
                />
              </>
            ),
          }}
        />
      </div>
    </div>
  );
}
