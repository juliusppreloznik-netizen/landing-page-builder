import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const COMPONENT_SCHEMA = `
Available Puck components and their props:

1. HeroSection:
   - headline: string (offer-based, value-driven)
   - subheadline: string (proof-driven, pain-agitated)
   - ctaText: string (action-oriented)
   - ctaLink: string (default "#")
   - alignment: "left" | "center" | "right"
   - backgroundColor: string (hex color)
   - textColor: string (hex color)
   - paddingTop/paddingBottom/paddingLeft/paddingRight: string (e.g. "80px")
   - marginTop/marginBottom: string (e.g. "0px")

2. FeatureGrid:
   - heading: string
   - subheading: string
   - features: array of { title: string, description: string, icon: "bolt"|"shield"|"chart"|"clock"|"users"|"cog" }
   - columns: "2" | "3" | "4"
   - backgroundColor: string (hex)
   - textColor: string (hex)
   - paddingTop/paddingBottom/paddingLeft/paddingRight: string
   - marginTop/marginBottom: string

3. Testimonials:
   - heading: string
   - subheading: string
   - testimonials: array of { quote: string, author: string, role: string, company: string }
   - layout: "grid" | "carousel"
   - backgroundColor: string (hex)
   - textColor: string (hex)
   - paddingTop/paddingBottom/paddingLeft/paddingRight: string
   - marginTop/marginBottom: string

4. CallToAction:
   - headline: string (guarantee-backed close)
   - description: string
   - primaryButtonText: string
   - primaryButtonLink: string (default "#")
   - secondaryButtonText: string
   - secondaryButtonLink: string (default "#")
   - alignment: "left" | "center" | "right"
   - backgroundColor: string (hex)
   - textColor: string (hex)
   - paddingTop/paddingBottom/paddingLeft/paddingRight: string
   - marginTop/marginBottom: string
`;

const SYSTEM_PROMPT = `You are an expert landing page designer and direct-response copywriter. Your job is to generate complete landing page structures as Puck editor JSON.

${COMPONENT_SCHEMA}

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "content": [
    {
      "type": "ComponentName",
      "props": {
        "id": "unique-id",
        ...all required props for that component
      }
    }
  ],
  "root": { "props": {} }
}

COPY GUIDELINES (direct-response principles):
- Headlines: Offer-based, promising clear and specific value. Lead with the transformation.
- Subheadlines: Proof-driven claims with specific numbers when possible.
- Feature descriptions: Pain-agitated openings that address real customer problems, then resolve them.
- Testimonials: Specific, results-oriented quotes with concrete outcomes.
- CTA sections: Guarantee-backed closes that reduce perceived risk. Use urgency without being pushy.

DESIGN GUIDELINES:
- Use a cohesive color palette (2-3 colors max, with complementary tones)
- Dark hero sections (#0f172a, #1e293b) with light text work well
- Feature sections can alternate between dark and light backgrounds
- CTA sections should use a bold accent color (#4f46e5 indigo works well)
- Ensure sufficient contrast between text and background colors
- Use consistent padding (80px top/bottom is standard for sections)

STRUCTURE:
A complete landing page should typically include:
1. Hero Section (above the fold, with compelling headline)
2. Feature Grid (3-4 key benefits/features)
3. Testimonials (2-3 social proof items)
4. Call to Action (final conversion push)

Every component MUST have a unique "id" prop (use descriptive slugs like "hero-1", "features-1", etc).`;

export async function POST(req: Request) {
  try {
    const { brief, inspirationUrls } = await req.json();

    if (!brief || typeof brief !== "string") {
      return NextResponse.json(
        { error: "A text brief is required" },
        { status: 400 }
      );
    }

    let userPrompt = `Generate a complete landing page for the following brief:\n\n"${brief}"`;

    if (inspirationUrls && Array.isArray(inspirationUrls) && inspirationUrls.length > 0) {
      userPrompt += `\n\nThe user provided these inspiration URLs for reference (use them to inform tone, structure, and style):\n${inspirationUrls.map((url: string) => `- ${url}`).join("\n")}`;
    }

    userPrompt += `\n\nGenerate the complete Puck JSON structure now. Return ONLY the JSON object, no markdown fences, no explanation.`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 4096,
    });

    // Parse the JSON from the response
    const text = result.text.trim();
    // Try to extract JSON if wrapped in markdown fences
    const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;

    const pageData = JSON.parse(jsonStr);

    // Validate basic structure
    if (!pageData.content || !Array.isArray(pageData.content)) {
      return NextResponse.json(
        { error: "Generated data is missing content array" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: pageData });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
