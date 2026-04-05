"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

type AIChatSidebarProps = {
  selectedElement: string | null;
  elementProps: Record<string, unknown> | null;
  onApplyChanges: (changes: Record<string, unknown>) => void;
};

const suggestionsByType: Record<string, string[]> = {
  Heading: [
    "Make this headline more compelling",
    "Change the color to match our brand",
    "Try a different heading level",
    "Rewrite for better SEO",
  ],
  Text: [
    "Make this copy more concise",
    "Rewrite for better conversions",
    "Change the font size",
    "Adjust the opacity or color",
  ],
  Button: [
    "Write a stronger call-to-action",
    "Change the button color and style",
    "Make it larger for better visibility",
    "Switch to outline variant",
  ],
  Icon: [
    "Change the icon color",
    "Make the icon larger",
    "Adjust the background color",
    "Change the border radius",
  ],
  Container: [
    "Add a background color",
    "Adjust the padding",
    "Change the layout direction",
    "Set a max width",
  ],
  Grid: [
    "Change the number of columns",
    "Adjust the gap between items",
    "Make it responsive",
    "Add a background color",
  ],
  Card: [
    "Add a shadow or border",
    "Change the background color",
    "Adjust the padding",
    "Round the corners more",
  ],
  Quote: [
    "Style the quote differently",
    "Change the accent color",
    "Update the attribution",
    "Adjust the font size",
  ],
};

const defaultSuggestions = [
  "Change the colors",
  "Adjust the spacing",
  "Modify the content",
  "Update the styling",
];

export function AIChatSidebar({
  selectedElement,
  elementProps,
  onApplyChanges,
}: AIChatSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown> | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      selectedElement,
      elementProps,
    },
    onFinish: (message) => {
      // Try to extract JSON from the response
      const jsonMatch = message.content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          const changes = JSON.parse(jsonMatch[1]);
          setPendingChanges(changes);
        } catch {
          // Not valid JSON, that's okay
        }
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleApplyChanges = () => {
    if (pendingChanges) {
      onApplyChanges(pendingChanges);
      setPendingChanges(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        {selectedElement ? (
          <p className="text-sm text-slate-400 mt-1">
            Editing: <span className="text-indigo-400">{selectedElement}</span>
          </p>
        ) : (
          <p className="text-sm text-slate-400 mt-1">
            Click an element to edit with AI
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-slate-500 text-sm">
            {selectedElement ? (
              <div className="space-y-2">
                <p>Try asking me to:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {(suggestionsByType[selectedElement] || defaultSuggestions).map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Select an element in the editor to start editing with AI assistance.</p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        {pendingChanges && (
          <div className="bg-slate-800 rounded-lg p-4 border border-indigo-500">
            <p className="text-sm text-slate-300 mb-3">Apply these changes?</p>
            <pre className="text-xs bg-slate-900 p-2 rounded mb-3 overflow-x-auto">
              {JSON.stringify(pendingChanges, null, 2)}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={handleApplyChanges}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-4 rounded transition-colors"
              >
                Apply Changes
              </button>
              <button
                onClick={() => setPendingChanges(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-4 rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input ?? ""}
            onChange={handleInputChange}
            placeholder={
              selectedElement
                ? `Describe changes to ${selectedElement}...`
                : "Select an element first..."
            }
            disabled={!selectedElement || isLoading}
            className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!selectedElement || isLoading || !input?.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
