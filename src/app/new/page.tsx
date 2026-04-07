"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[]; // base64 data URLs for display
};

export default function NewProjectPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Tell me about the landing page you want to build. Describe your product, target audience, and key selling points.\n\nYou can also upload screenshots of landing pages you like — I'll extract the typography and color palette to match your design.",
    },
  ]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files];
    setImages(newImages);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed && images.length === 0) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      images: [...imagePreviews],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    scrollToBottom();

    // Add "thinking" message
    const thinkingMsg: ChatMessage = {
      id: "thinking",
      role: "assistant",
      content: "generating",
    };
    setMessages((prev) => [...prev, thinkingMsg]);
    setIsGenerating(true);
    scrollToBottom();

    try {
      // Build form data
      const formData = new FormData();
      formData.append("brief", trimmed);

      // Derive project name from first ~50 chars of brief
      const projectName =
        trimmed.length > 50 ? trimmed.substring(0, 50) + "..." : trimmed;
      formData.append("projectName", projectName);

      images.forEach((file, i) => {
        formData.append(`image${i}`, file);
      });

      const res = await fetch("/api/generate-with-images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const { data, page } = await res.json();

      // Replace thinking message with success
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "thinking"
            ? {
                ...m,
                id: "success",
                content: `Your landing page is ready! I've created it with ${data.content?.length || 0} sections${images.length > 0 ? ", styled to match your reference screenshots" : ""}. Opening the editor now...`,
              }
            : m
        )
      );

      // Redirect to editor with pageId — data is already saved to Supabase by the API
      setTimeout(() => {
        router.push(`/editor?pageId=${page.id}`);
      }, 1500);
    } catch (err) {
      // Replace thinking message with error
      setMessages((prev) => prev.filter((m) => m.id !== "thinking"));
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">New Project</h1>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                {msg.content === "generating" ? (
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                    <span className="text-sm text-slate-400">
                      {images.length > 0
                        ? "Analyzing screenshots and generating your page..."
                        : "Generating your landing page..."}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                )}

                {/* Show uploaded images in user message */}
                {msg.images && msg.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Reference ${i + 1}`}
                        className="w-32 h-20 object-cover rounded-lg border border-white/10"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6">
          <div className="max-w-3xl mx-auto bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm mb-4">
            {error}
          </div>
        </div>
      )}

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="px-6">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2 mb-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative group">
                <img
                  src={src}
                  alt={`Upload ${i + 1}`}
                  className="w-20 h-14 object-cover rounded-lg border border-slate-700"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-800 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            {/* Image Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
              className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl transition-colors flex-shrink-0"
              title="Upload reference screenshots"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Text Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Describe your landing page..."
              disabled={isGenerating}
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />

            {/* Send */}
            <button
              onClick={handleSubmit}
              disabled={isGenerating || (!input.trim() && images.length === 0)}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {images.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {images.length} screenshot{images.length !== 1 ? "s" : ""} attached — typography and colors will be extracted
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
