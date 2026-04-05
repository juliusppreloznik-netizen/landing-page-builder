"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GeneratePage() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [inspirationUrls, setInspirationUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !inspirationUrls.includes(trimmed)) {
      setInspirationUrls([...inspirationUrls, trimmed]);
      setUrlInput("");
    }
  };

  const removeUrl = (url: string) => {
    setInspirationUrls(inspirationUrls.filter((u) => u !== url));
  };

  const handleGenerate = async () => {
    if (!brief.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: brief.trim(),
          inspirationUrls: inspirationUrls.length > 0 ? inspirationUrls : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const { data } = await res.json();

      // Store generated data in sessionStorage and redirect to editor
      sessionStorage.setItem("generatedPageData", JSON.stringify(data));
      router.push("/editor?source=generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Generate a Landing Page</h1>
          <p className="text-slate-400 text-lg">
            Describe your product or service and AI will create a complete
            landing page for you.
          </p>
        </div>

        <div className="space-y-8">
          {/* Brief Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="e.g. A SaaS platform that helps small businesses automate their invoicing. Target audience is freelancers and small agencies. Key features: automated recurring invoices, payment tracking, expense reports. Tone should be professional but friendly."
              rows={6}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Include your product name, target audience, key features, and
              desired tone.
            </p>
          </div>

          {/* Inspiration URLs */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Inspiration URLs{" "}
              <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
                placeholder="https://example.com"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={addUrl}
                type="button"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>

            {inspirationUrls.length > 0 && (
              <div className="mt-3 space-y-2">
                {inspirationUrls.map((url) => (
                  <div
                    key={url}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2"
                  >
                    <span className="flex-1 text-sm text-slate-300 truncate">
                      {url}
                    </span>
                    <button
                      onClick={() => removeUrl(url)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!brief.trim() || isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating your page...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Landing Page
              </>
            )}
          </button>

          {/* Back Link */}
          <div className="text-center">
            <button
              onClick={() => router.push("/editor")}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              or open the editor directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
