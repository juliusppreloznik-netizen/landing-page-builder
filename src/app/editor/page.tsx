"use client";

import { Puck, Data, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { puckConfig } from "@/lib/puck/config";
import { useState, useCallback, useEffect, useMemo } from "react";
import { AIChatSidebar } from "@/components/AIChatSidebar";

const usePuck = createUsePuck();

// Sample data with nested composable components
const initialData: Data = {
  content: [
    {
      type: "Heading",
      props: {
        id: "heading-1",
        text: "Transform Your Business Today",
        level: "h1",
        color: "#1e293b",
        marginBottom: "24px",
      },
    },
    {
      type: "Text",
      props: {
        id: "text-1",
        content: "Join thousands of companies already using our platform to accelerate growth and maximize results.",
        size: "lg",
        color: "#475569",
        opacity: "1",
        marginBottom: "32px",
        maxWidth: "640px",
      },
    },
    {
      type: "Button",
      props: {
        id: "button-1",
        text: "Get Started Now",
        link: "#",
        variant: "primary",
        size: "lg",
        backgroundColor: "#4f46e5",
        textColor: "#ffffff",
        marginTop: "0px",
        marginBottom: "48px",
        marginRight: "16px",
      },
    },
    {
      type: "Button",
      props: {
        id: "button-2",
        text: "Learn More",
        link: "#",
        variant: "outline",
        size: "lg",
        backgroundColor: "#4f46e5",
        textColor: "#4f46e5",
        marginTop: "0px",
        marginBottom: "48px",
        marginRight: "0px",
      },
    },
    {
      type: "Heading",
      props: {
        id: "heading-2",
        text: "Why Choose Us",
        level: "h2",
        color: "#1e293b",
        marginBottom: "16px",
      },
    },
    {
      type: "Text",
      props: {
        id: "text-2",
        content: "We provide everything you need to succeed.",
        size: "lg",
        color: "#64748b",
        opacity: "1",
        marginBottom: "48px",
        maxWidth: "100%",
      },
    },
    {
      type: "Icon",
      props: {
        id: "icon-1",
        icon: "bolt",
        size: "24px",
        color: "#ffffff",
        backgroundColor: "#4f46e5",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "16px",
      },
    },
    {
      type: "Heading",
      props: {
        id: "heading-3",
        text: "Lightning Fast",
        level: "h3",
        color: "#1e293b",
        marginBottom: "8px",
      },
    },
    {
      type: "Text",
      props: {
        id: "text-3",
        content: "Experience blazing speed with our optimized infrastructure.",
        size: "base",
        color: "#64748b",
        opacity: "1",
        marginBottom: "32px",
        maxWidth: "100%",
      },
    },
  ],
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
  const [data, setData] = useState<Data>(initialData);

  // Load generated page data from sessionStorage if redirected from /generate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") === "generated") {
      const stored = sessionStorage.getItem("generatedPageData");
      if (stored) {
        try {
          const generated = JSON.parse(stored) as Data;
          setData(generated);
          sessionStorage.removeItem("generatedPageData");
          // Clean URL without reload
          window.history.replaceState({}, "", "/editor");
        } catch {
          // Ignore parse errors, keep default data
        }
      }
    }
  }, []);

  const handlePublish = async (publishData: Data) => {
    console.log("Publishing:", publishData);
    setData(publishData);
  };

  return (
    <div className="h-screen flex">
      {/* Puck Editor - takes remaining space, leaving room for AI sidebar */}
      <div className="flex-1 h-full overflow-hidden" style={{ maxWidth: 'calc(100vw - 320px)' }}>
        <Puck
          config={puckConfig}
          data={data}
          onPublish={handlePublish}
          onChange={setData}
          ui={{ rightSideBarVisible: false }}
          overrides={{
            puck: ({ children }) => (
              <>
                {children}
                {/* AI Sidebar rendered inside Puck context for usePuck access */}
                <div className="fixed right-0 top-0 w-80 h-screen border-l border-slate-700 shadow-xl z-50">
                  <EditorWithAI />
                </div>
              </>
            ),
          }}
        />
      </div>
    </div>
  );
}
