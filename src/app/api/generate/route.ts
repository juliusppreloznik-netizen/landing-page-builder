import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { buildSkillsPrompt } from "@/lib/skills";
import { COMPONENT_SCHEMA } from "@/lib/component-schema";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const SYSTEM_PROMPT = buildSkillsPrompt(false) + `\n\n${COMPONENT_SCHEMA}`;

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
      maxOutputTokens: 16000,
    });

    // Parse JSON — robust extraction handles conversational responses
    const text = result.text.trim();
    let pageData: { content: unknown[]; zones?: Record<string, unknown[]>; root: { props: Record<string, unknown> } };

    const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
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
      return NextResponse.json({ error: "Failed to parse generated JSON" }, { status: 500 });
    }

    if (!pageData.content || !Array.isArray(pageData.content)) {
      return NextResponse.json({ error: "Generated data is missing content array" }, { status: 500 });
    }

    // Save to Supabase immediately
    const supabase = await createClient();
    const projectName = brief.length > 50 ? brief.substring(0, 50) + "..." : brief;

    const { data: project } = await supabase
      .from("projects")
      .insert({ name: projectName })
      .select()
      .single();

    if (project) {
      const { data: page } = await supabase
        .from("pages")
        .insert({
          project_id: project.id,
          title: projectName,
          slug: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        })
        .select()
        .single();

      if (page) {
        await supabase.from("page_versions").insert({
          page_id: page.id,
          content_json: pageData,
        });

        return NextResponse.json({ data: pageData, project, page });
      }
    }

    return NextResponse.json({ data: pageData });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
