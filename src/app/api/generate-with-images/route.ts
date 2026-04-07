import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSkillsPrompt } from "@/lib/skills";
import { COMPONENT_SCHEMA } from "@/lib/component-schema";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const brief = formData.get("brief") as string;
    const projectName = (formData.get("projectName") as string) || "Untitled Project";

    if (!brief) {
      return NextResponse.json({ error: "Brief is required" }, { status: 400 });
    }

    // Collect uploaded images
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image") && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Build message content with images
    const userContent: Array<{ type: string; text?: string; image?: string; mimeType?: string }> = [];

    if (imageFiles.length > 0) {
      userContent.push({
        type: "text",
        text: `I'm sharing ${imageFiles.length} screenshot(s) of reference landing pages. Analyze each screenshot carefully to extract:
1. **Typography**: Font styles (serif/sans-serif), font weights (bold headings, light body), font sizes (relative scale)
2. **Color palette**: Background colors, text colors, button/accent colors, gradient patterns
3. **Visual style**: Spacing patterns, layout density, use of whitespace

Apply these extracted visual design choices to the generated components.

Now generate a complete landing page for this brief:

"${brief}"`,
      });

      for (const file of imageFiles) {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        userContent.push({
          type: "image",
          image: base64,
          mimeType: file.type || "image/png",
        });
      }
    } else {
      userContent.push({
        type: "text",
        text: `Generate a complete landing page for this brief:\n\n"${brief}"\n\nUse a modern, professional design with dark backgrounds and clear typography.`,
      });
    }

    const systemPrompt = buildSkillsPrompt(imageFiles.length > 0) + `

${COMPONENT_SCHEMA}

${imageFiles.length > 0 ? `\nCRITICAL: You have been given reference screenshots. You MUST:
- Extract the EXACT color palette from the screenshots (background colors, text colors, accent/button colors)
- Match the typography style (if screenshots use bold sans-serif headings, use similar sizing and weight)
- Match the spacing patterns (dense vs. airy layouts)
- Apply these extracted styles to ALL components in the generated page` : ""}`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: [{ role: "user" as const, content: userContent as any }],
      maxOutputTokens: 16000,
    });

    // Parse JSON — robust extraction handles conversational responses
    const text = result.text.trim();
    let pageData: { content: unknown[]; zones?: Record<string, unknown[]>; root: { props: Record<string, unknown> } };

    // Strategy 1: markdown fences
    const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    // Strategy 2: find first { to last }
    const braceStart = text.indexOf("{");
    const braceEnd = text.lastIndexOf("}");

    let jsonStr: string;
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else if (braceStart !== -1 && braceEnd > braceStart) {
      jsonStr = text.substring(braceStart, braceEnd + 1);
    } else {
      return NextResponse.json({ error: "No JSON found in AI response" }, { status: 500 });
    }

    try {
      pageData = JSON.parse(jsonStr);
    } catch {
      // If JSON is malformed (truncated), try to salvage by finding the content array
      const contentMatch = jsonStr.match(/"content"\s*:\s*\[([\s\S]*)\]/);
      if (contentMatch) {
        try {
          const content = JSON.parse(`[${contentMatch[1]}]`);
          pageData = { content, root: { props: {} } };
        } catch {
          return NextResponse.json({ error: "Failed to parse generated JSON" }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "Failed to parse generated JSON" }, { status: 500 });
      }
    }

    if (!pageData.content || !Array.isArray(pageData.content)) {
      return NextResponse.json({ error: "Invalid generated structure" }, { status: 500 });
    }

    // Create project and page in Supabase
    const supabase = await createClient();

    const { data: project, error: projError } = await supabase
      .from("projects")
      .insert({ name: projectName })
      .select()
      .single();

    if (projError) {
      return NextResponse.json({ error: projError.message }, { status: 500 });
    }

    const { data: page, error: pageError } = await supabase
      .from("pages")
      .insert({
        project_id: project.id,
        title: projectName,
        slug: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      })
      .select()
      .single();

    if (pageError) {
      return NextResponse.json({ error: pageError.message }, { status: 500 });
    }

    await supabase.from("page_versions").insert({
      page_id: page.id,
      content_json: pageData,
    });

    return NextResponse.json({
      data: pageData,
      project,
      page,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
