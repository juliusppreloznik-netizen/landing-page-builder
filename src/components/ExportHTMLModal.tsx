"use client";

import { useState, useEffect } from "react";

type ExportHTMLModalProps = {
  isOpen: boolean;
  onClose: () => void;
  iframeRef?: HTMLIFrameElement | null;
};

function extractHTML(): string {
  const iframe = document.querySelector("#preview-frame") as HTMLIFrameElement;
  if (!iframe?.contentDocument) return "<!-- No content available -->";

  const body = iframe.contentDocument.body;
  const root = body.querySelector("[data-puck-entry]");
  if (!root) return "<!-- No content found -->";

  // Clone the content to strip Puck editor overlays
  const clone = root.cloneNode(true) as HTMLElement;

  // Remove all Puck editor UI overlays
  clone.querySelectorAll("[data-puck-overlay]").forEach((el) => el.remove());
  clone.querySelectorAll("[class*='_DropZone-indicator']").forEach((el) => el.remove());
  clone.querySelectorAll("[class*='_DraggableComponent-overlay']").forEach((el) => el.remove());
  clone.querySelectorAll("[class*='_DropZone_']").forEach((el) => {
    // Keep the DropZone children but remove the wrapper attributes
    el.removeAttribute("data-puck-dropzone");
    el.removeAttribute("data-testid");
  });

  // Get computed styles from the iframe
  const iframeDoc = iframe.contentDocument;
  const styles: string[] = [];
  for (const sheet of Array.from(iframeDoc.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        // Skip Puck internal styles
        if (rule.cssText.includes("_DropZone") || rule.cssText.includes("_DraggableComponent")) continue;
        styles.push(rule.cssText);
      }
    } catch {
      // Cross-origin stylesheets can't be read
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
    ${styles.join("\n    ")}
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body>
  ${clone.innerHTML}
</body>
</html>`;
}

export function ExportHTMLModal({ isOpen, onClose }: ExportHTMLModalProps) {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Extract HTML after a brief delay to ensure iframe is accessible
      setTimeout(() => {
        setHtml(extractHTML());
      }, 100);
    } else {
      setHtml("");
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl w-[90vw] max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
          <h2 className="text-white font-semibold text-lg">Export HTML</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              disabled={!html}
              className="px-4 py-2 bg-[#7C5CFC] hover:bg-[#6A4AEA] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {copied ? "Copied!" : "Copy HTML"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#888] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* HTML Content */}
        <div className="flex-1 overflow-hidden p-4">
          {html ? (
            <textarea
              readOnly
              value={html}
              className="w-full h-full bg-[#0D0D0D] border border-[#333] rounded-lg p-4 text-[#AAA] text-xs font-mono resize-none focus:outline-none focus:border-[#7C5CFC]"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#666]">
              <div className="w-5 h-5 border-2 border-[#7C5CFC] border-t-transparent rounded-full animate-spin mr-3" />
              Extracting HTML...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
