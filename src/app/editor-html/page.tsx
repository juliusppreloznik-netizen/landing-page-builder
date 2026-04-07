"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColorPickerField } from "@/components/fields/ColorPickerField";

type SelectedElement = {
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  outerHTML: string;
  styles: Record<string, string>;
  path: number[]; // index path to find element in DOM
};

export default function HtmlEditorPage() {
  const router = useRouter();
  const [pageId, setPageId] = useState<string | null>(null);
  const [html, setHtml] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showExport, setShowExport] = useState(false);
  const [sections, setSections] = useState<{ name: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load page from Supabase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("pageId");
    if (!pid) { setLoaded(true); return; }
    setPageId(pid);

    fetch(`/api/pages?id=${pid}`)
      .then((r) => r.json())
      .then(({ version }) => {
        if (version?.content_json?.type === "raw_html" && version.content_json.html) {
          setHtml(version.content_json.html);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Parse sections from HTML
  useEffect(() => {
    if (!html) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const sectionEls = doc.querySelectorAll("[data-section], section, [id]");
    const parsed: { name: string; id: string }[] = [];
    sectionEls.forEach((el) => {
      const name = el.getAttribute("data-section") || el.id || el.tagName.toLowerCase();
      const id = el.id || `section-${parsed.length}`;
      if (name && !parsed.some((s) => s.id === id)) {
        parsed.push({ name, id });
      }
    });
    setSections(parsed);
  }, [html]);

  // Inject HTML into iframe when it changes
  useEffect(() => {
    if (!html || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html, loaded]);

  // Get the current full HTML from iframe (with edits)
  const getCurrentHtml = useCallback((): string => {
    if (!iframeRef.current?.contentDocument) return html;
    return "<!DOCTYPE html>\n" + iframeRef.current.contentDocument.documentElement.outerHTML;
  }, [html]);

  // Find element by path in iframe
  const findElementByPath = useCallback((path: number[]): HTMLElement | null => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;
    let el: HTMLElement = doc.body;
    for (const idx of path) {
      const children = Array.from(el.children) as HTMLElement[];
      if (idx >= children.length) return null;
      el = children[idx];
    }
    return el;
  }, []);

  // Build path to element from body
  const buildPath = (el: HTMLElement, doc: Document): number[] => {
    const path: number[] = [];
    let current = el;
    while (current && current !== doc.body && current.parentElement) {
      const parent = current.parentElement;
      const idx = Array.from(parent.children).indexOf(current);
      path.unshift(idx);
      current = parent;
    }
    return path;
  };

  // Handle click on iframe overlay
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const rect = iframe.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Account for iframe scroll
    const iframeDoc = iframe.contentDocument;
    const el = iframeDoc.elementFromPoint(x, y + iframeDoc.documentElement.scrollTop) as HTMLElement;
    if (!el || el === iframeDoc.body || el === iframeDoc.documentElement) return;

    // Remove previous highlight
    iframeDoc.querySelectorAll("[data-editor-selected]").forEach((prev) => {
      (prev as HTMLElement).style.outline = "";
      prev.removeAttribute("data-editor-selected");
    });

    // Highlight selected
    el.style.outline = "2px solid #7C5CFC";
    el.setAttribute("data-editor-selected", "true");

    const computed = iframe.contentWindow?.getComputedStyle(el);
    const path = buildPath(el, iframeDoc);

    setSelected({
      tagName: el.tagName.toLowerCase(),
      id: el.id || "",
      className: el.className || "",
      textContent: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
        ? el.textContent || ""
        : "",
      outerHTML: el.outerHTML,
      styles: {
        backgroundColor: el.style.backgroundColor || computed?.backgroundColor || "",
        color: el.style.color || computed?.color || "",
        fontSize: el.style.fontSize || computed?.fontSize || "",
        fontWeight: el.style.fontWeight || computed?.fontWeight || "",
        paddingTop: el.style.paddingTop || computed?.paddingTop || "",
        paddingRight: el.style.paddingRight || computed?.paddingRight || "",
        paddingBottom: el.style.paddingBottom || computed?.paddingBottom || "",
        paddingLeft: el.style.paddingLeft || computed?.paddingLeft || "",
        marginTop: el.style.marginTop || computed?.marginTop || "",
        marginRight: el.style.marginRight || computed?.marginRight || "",
        marginBottom: el.style.marginBottom || computed?.marginBottom || "",
        marginLeft: el.style.marginLeft || computed?.marginLeft || "",
        borderRadius: el.style.borderRadius || computed?.borderRadius || "",
        width: el.style.width || "",
        maxWidth: el.style.maxWidth || computed?.maxWidth || "",
      },
      path,
    });
  }, []);

  // Update a style on the selected element
  const updateStyle = useCallback((prop: string, value: string) => {
    if (!selected) return;
    const el = findElementByPath(selected.path);
    if (!el) return;
    (el.style as unknown as Record<string, string>)[prop] = value;
    setSelected((prev) => prev ? { ...prev, styles: { ...prev.styles, [prop]: value } } : null);
    setHtml(getCurrentHtml());
  }, [selected, findElementByPath, getCurrentHtml]);

  // Update text content
  const updateText = useCallback((text: string) => {
    if (!selected) return;
    const el = findElementByPath(selected.path);
    if (!el) return;
    el.textContent = text;
    setSelected((prev) => prev ? { ...prev, textContent: text } : null);
    setHtml(getCurrentHtml());
  }, [selected, findElementByPath, getCurrentHtml]);

  // Save to Supabase
  const handleSave = useCallback(async () => {
    if (!pageId) return;
    setSaveStatus("saving");
    const currentHtml = getCurrentHtml();
    setHtml(currentHtml);
    try {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          contentJson: { type: "raw_html", html: currentHtml, generatedAt: new Date().toISOString() },
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, [pageId, getCurrentHtml]);

  // AI chat: modify selected element
  const handleAiSubmit = useCallback(async () => {
    if (!selected || !aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `I have this HTML element selected:\n\n${selected.outerHTML}\n\nPlease: ${aiInput}\n\nReturn ONLY the updated outerHTML. No explanation, no markdown fences.`,
            },
          ],
        }),
      });
      // Read streaming response
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // Extract the HTML from the AI response (may contain data stream format)
      const htmlMatch = fullText.match(/<[a-z][\s\S]*>/i);
      if (htmlMatch) {
        const el = findElementByPath(selected.path);
        if (el && el.parentElement) {
          el.outerHTML = htmlMatch[0];
          setHtml(getCurrentHtml());
          setSelected(null);
        }
      }
    } catch {
      // ignore
    } finally {
      setAiLoading(false);
      setAiInput("");
    }
  }, [selected, aiInput, findElementByPath, getCurrentHtml]);

  // Handle iframe scroll passthrough
  const handleOverlayScroll = useCallback((e: React.WheelEvent) => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.documentElement.scrollTop += e.deltaY;
    }
  }, []);

  // Switch to mobile viewport
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  if (!loaded) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D0D0D" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #7C5CFC", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0D0D0D", color: "#FFF", fontFamily: "Inter, sans-serif" }}>
      {/* TOP TOOLBAR */}
      <div style={{ height: 48, minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", background: "#1A1A1A", borderBottom: "1px solid #2A2A2A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => router.push("/")} title="Back" style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", color: "#888" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ width: 1, height: 20, background: "#2A2A2A" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#FFF" }}>HTML Editor</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setViewport(viewport === "desktop" ? "mobile" : "desktop")} style={{ padding: "4px 10px", fontSize: 11, background: "#1A1A1A", border: "1px solid #333", borderRadius: 6, color: "#CCC", cursor: "pointer" }}>
            {viewport === "desktop" ? "Mobile" : "Desktop"}
          </button>
          <button onClick={handleSave} disabled={!pageId} style={{ padding: "6px 14px", fontSize: 12, background: saveStatus === "saved" ? "#1a3a1a" : "#1A1A1A", color: saveStatus === "saved" ? "#4ade80" : "#FFF", border: "1px solid #333", borderRadius: 6, cursor: "pointer" }}>
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Save"}
          </button>
          <button onClick={() => setShowExport(true)} style={{ padding: "6px 14px", fontSize: 12, background: "#1A1A1A", color: "#FFF", border: "1px solid #333", borderRadius: 6, cursor: "pointer" }}>
            Export HTML
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT PANEL — Elements Tree */}
        <div style={{ width: 240, minWidth: 240, background: "#111111", borderRight: "1px solid #222", overflowY: "auto", padding: "12px 0" }}>
          <div style={{ padding: "0 12px 8px", fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>Elements</div>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                const doc = iframeRef.current?.contentDocument;
                if (!doc) return;
                const el = doc.getElementById(s.id) || doc.querySelector(`[data-section="${s.name}"]`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  (el as HTMLElement).click?.();
                }
              }}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "6px 16px",
                fontSize: 12, color: "#CCC", background: "transparent", border: "none",
                cursor: "pointer", borderLeft: "2px solid transparent",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1F1F1F"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {s.name}
            </button>
          ))}
          {sections.length === 0 && (
            <div style={{ padding: "12px 16px", fontSize: 12, color: "#555" }}>No sections found</div>
          )}
        </div>

        {/* CENTER CANVAS */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 20, overflow: "auto", background: "#0D0D0D" }}>
          <div style={{ position: "relative", width: viewport === "mobile" ? 375 : "100%", maxWidth: viewport === "desktop" ? 900 : 375, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
            <iframe
              ref={iframeRef}
              style={{ width: "100%", height: "100vh", border: "none", background: "#FFF", display: "block" }}
              sandbox="allow-same-origin allow-scripts"
            />
            {/* Click capture overlay */}
            <div
              onClick={handleCanvasClick}
              onWheel={handleOverlayScroll}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "crosshair" }}
            />
          </div>
        </div>

        {/* RIGHT PANEL — Properties + AI Chat */}
        <div style={{ width: 300, minWidth: 300, background: "#111111", borderLeft: "1px solid #222", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {selected ? (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {/* Element info */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #222" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Selected Element</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#7C5CFC" }}>&lt;{selected.tagName}&gt;</div>
                {selected.id && <div style={{ fontSize: 11, color: "#888" }}>#{selected.id}</div>}
              </div>

              {/* Text content */}
              {selected.textContent && (
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #222" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Text Content</div>
                  <textarea
                    value={selected.textContent}
                    onChange={(e) => updateText(e.target.value)}
                    rows={3}
                    style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6, color: "#FFF", fontSize: 12, padding: 8, resize: "vertical" }}
                  />
                </div>
              )}

              {/* Colors */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #222" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Colors</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Background</div>
                  <ColorPickerField value={selected.styles.backgroundColor} onChange={(v) => updateStyle("backgroundColor", v)} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Text Color</div>
                  <ColorPickerField value={selected.styles.color} onChange={(v) => updateStyle("color", v)} />
                </div>
              </div>

              {/* Typography */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #222" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Typography</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Size</div>
                    <input value={selected.styles.fontSize} onChange={(e) => updateStyle("fontSize", e.target.value)} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6, color: "#FFF", fontSize: 12, padding: "4px 8px", height: 28 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Weight</div>
                    <select value={selected.styles.fontWeight} onChange={(e) => updateStyle("fontWeight", e.target.value)} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6, color: "#FFF", fontSize: 12, height: 28 }}>
                      <option value="400">Regular</option><option value="500">Medium</option><option value="600">SemiBold</option><option value="700">Bold</option><option value="800">ExtraBold</option><option value="900">Black</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spacing */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #222" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Padding</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {(["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const).map((p) => (
                    <div key={p}>
                      <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase" }}>{p.replace("padding", "")}</div>
                      <input value={selected.styles[p]} onChange={(e) => updateStyle(p, e.target.value)} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 4, color: "#FFF", fontSize: 11, padding: "2px 6px", height: 24 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #222" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Border Radius</div>
                <input value={selected.styles.borderRadius} onChange={(e) => updateStyle("borderRadius", e.target.value)} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6, color: "#FFF", fontSize: 12, padding: "4px 8px", height: 28 }} />
              </div>

              {/* AI Assist */}
              <div style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>AI Assist</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
                    placeholder="Change this element..."
                    disabled={aiLoading}
                    style={{ flex: 1, background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6, color: "#FFF", fontSize: 12, padding: "4px 8px", height: 28 }}
                  />
                  <button onClick={handleAiSubmit} disabled={aiLoading} style={{ padding: "4px 10px", background: "#7C5CFC", color: "#FFF", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                    {aiLoading ? "..." : "Go"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 16, color: "#555", fontSize: 13, textAlign: "center", marginTop: 40 }}>
              Click an element in the canvas to select and edit it
            </div>
          )}
        </div>
      </div>

      {/* EXPORT MODAL */}
      {showExport && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, width: "90vw", maxWidth: 900, height: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #333" }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Export HTML</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(getCurrentHtml()); }} style={{ padding: "6px 16px", background: "#7C5CFC", color: "#FFF", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Copy HTML</button>
                <button onClick={() => setShowExport(false)} style={{ padding: "4px 8px", background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "hidden", padding: 16 }}>
              <textarea readOnly value={getCurrentHtml()} style={{ width: "100%", height: "100%", background: "#0D0D0D", border: "1px solid #333", borderRadius: 8, color: "#AAA", fontSize: 11, fontFamily: "monospace", padding: 16, resize: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
