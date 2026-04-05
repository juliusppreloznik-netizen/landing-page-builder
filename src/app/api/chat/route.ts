import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, selectedElement, elementProps } = await req.json();

  const systemPrompt = `You are an AI assistant helping users edit landing page components in a visual editor.

${selectedElement ? `The user has selected a "${selectedElement}" component with these current properties:
${JSON.stringify(elementProps, null, 2)}

When the user asks to modify this element, respond with a JSON object containing ONLY the properties that should be changed. Format your response as:
\`\`\`json
{"propertyName": "newValue", ...}
\`\`\`

Guidelines for modifications:
- For text changes, provide the new text directly
- For colors, use hex codes (e.g., "#4f46e5")
- For spacing (padding/margin), use CSS values (e.g., "40px", "2rem")
- For alignment, use "left", "center", or "right"
- Only include properties that need to change

If the user asks a question or wants advice, respond conversationally without JSON.` : `No element is currently selected. Help the user understand they need to click on an element in the editor first to modify it with AI assistance.`}

Writing guidelines for landing page copy:
- Use offer-based headlines that promise clear value
- Include proof-driven claims with specific numbers when possible
- Create pain-agitated openings that address customer problems
- Write guarantee-backed closes that reduce risk
- Keep copy concise and action-oriented`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
