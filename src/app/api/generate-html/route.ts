import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadLandingPageBuilderSkill, loadCopywriterSkillFiles } from "@/lib/skills";

export const maxDuration = 120;

const DEFAULT_DESIGN_TOKENS = {
  primaryFont: "Inter",
  bodyFont: "Inter",
  primaryColor: "#7C5CFC",
  secondaryColor: "#4F46E5",
  backgroundColor: "#0B0C1A",
  textColor: "#FFFFFF",
  buttonColor: "#7C5CFC",
  buttonTextColor: "#FFFFFF",
  headingWeight: "800",
  borderRadius: "medium",
};

// STEP 2: Extract design tokens from uploaded screenshots
async function extractDesignTokens(images: string[]): Promise<typeof DEFAULT_DESIGN_TOKENS> {
  if (images.length === 0) return DEFAULT_DESIGN_TOKENS;

  try {
    const imageContent = images.map((base64) => ({
      type: "image" as const,
      image: base64,
      mimeType: "image/png" as const,
    }));

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      messages: [
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: `Analyze these landing page screenshots and extract the exact design tokens. Return ONLY a JSON object (no markdown, no explanation) with these keys:
- primaryFont: dominant heading font family (e.g. "Inter", "Poppins", "Montserrat")
- bodyFont: body text font family
- primaryColor: dominant brand/accent color as hex (e.g. "#7C5CFC")
- secondaryColor: secondary accent color as hex
- backgroundColor: main page background color as hex
- textColor: primary text color as hex
- buttonColor: CTA button background color as hex
- buttonTextColor: CTA button text color as hex
- headingWeight: heading font weight (e.g. "700", "800", "900")
- borderRadius: corner style ("none", "small", "medium", "large")`,
            },
            ...imageContent,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as any,
        },
      ],
      maxOutputTokens: 500,
    });

    const text = result.text.trim();
    const braceStart = text.indexOf("{");
    const braceEnd = text.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      return { ...DEFAULT_DESIGN_TOKENS, ...JSON.parse(text.substring(braceStart, braceEnd + 1)) };
    }
  } catch (e) {
    console.error("Design token extraction failed:", e);
  }

  return DEFAULT_DESIGN_TOKENS;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brief, pageType, uploadedImages, inspirationUrls } = body as {
      brief: string;
      pageType?: string;
      uploadedImages?: string[];
      inspirationUrls?: string[];
    };

    if (!brief) {
      return NextResponse.json({ error: "Brief is required" }, { status: 400 });
    }

    const resolvedPageType = pageType || "low-ticket";

    // STEP 1: Load skill files
    const landingPageSkill = loadLandingPageBuilderSkill();
    const copywriterSkills = loadCopywriterSkillFiles();

    // STEP 2: Extract design tokens from screenshots
    const designTokens = await extractDesignTokens(uploadedImages || []);

    // STEP 3: Build inspiration context (simplified — no fetch for now)
    let inspirationContext = "";
    if (inspirationUrls && inspirationUrls.length > 0) {
      inspirationContext = `\nINSPIRATION PAGES (use these for structural reference):\n${inspirationUrls.map((u) => `- ${u}`).join("\n")}`;
    }

    // STEP 4: Generate full HTML
    const borderRadiusMap: Record<string, string> = {
      none: "0px",
      small: "6px",
      medium: "10px",
      large: "16px",
    };
    const br = borderRadiusMap[designTokens.borderRadius] || "10px";

    const systemPrompt = `You are an expert direct response landing page designer and copywriter. You write and design landing pages that convert.

STRUCTURAL SOP:
${landingPageSkill}

COPYWRITING FRAMEWORK:
${copywriterSkills}

DESIGN TOKENS (apply these exactly to all elements):
- Primary Font: ${designTokens.primaryFont}
- Body Font: ${designTokens.bodyFont}
- Primary/Accent Color: ${designTokens.primaryColor}
- Secondary Color: ${designTokens.secondaryColor}
- Background Color: ${designTokens.backgroundColor}
- Text Color: ${designTokens.textColor}
- Button Background: ${designTokens.buttonColor}
- Button Text Color: ${designTokens.buttonTextColor}
- Heading Font Weight: ${designTokens.headingWeight}
- Border Radius: ${br}
${inspirationContext}`;

    const userPrompt = `Generate a complete, self-contained, mobile-first HTML page for the following:

Page type: ${resolvedPageType}
Brief: ${brief}

Requirements:
- Output ONLY the complete HTML document. Nothing else. No markdown. No explanation. No code fences.
- The HTML must be fully self-contained — all CSS must be inline or in a <style> tag in the <head>. No external CSS files. No external JS files except Google Fonts loaded via a <link> tag.
- Use the exact fonts, colors, and design tokens specified in the system prompt.
- Follow the structural SOP for the "${resolvedPageType}" page type exactly — include every required section in the correct order.
- Write all copy following the copywriting framework — offer-based headline, pain-agitated opening, proof elements, guarantee.
- The page must look visually polished and professional. Use proper spacing, visual hierarchy, and section separation.
- Every section must have a distinct background or visual separator so sections are clearly differentiated.
- Add data-section="section-name" attributes to each major section div for editor integration.
- ${resolvedPageType === "opt-in" ? "The opt-in form must include a name field, email field, and a large CTA button." : ""}
- All images should use placeholder divs with background colors and descriptive text labels (e.g. "PROFILE PHOTO ROW" or "HERO IMAGE").
- The page must render correctly on a 375px mobile viewport as the primary target.
- Use Google Fonts <link> tag for the specified fonts.`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 16000,
    });

    // Extract HTML — strip markdown fences if present
    let html = result.text.trim();
    const htmlFenceMatch = html.match(/```(?:html)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (htmlFenceMatch) {
      html = htmlFenceMatch[1].trim();
    }
    // Ensure it starts with <!DOCTYPE or <html
    if (!html.startsWith("<!") && !html.startsWith("<html")) {
      const docStart = html.indexOf("<!DOCTYPE");
      const htmlStart = html.indexOf("<html");
      const start = docStart !== -1 ? docStart : htmlStart;
      if (start > 0) {
        html = html.substring(start);
      }
    }

    if (!html.includes("<html") && !html.includes("<body")) {
      return NextResponse.json({ error: "Generated output is not valid HTML" }, { status: 500 });
    }

    // STEP 5: Save to Supabase
    const supabase = await createClient();
    const projectName = brief.length > 60 ? brief.substring(0, 60) + "..." : brief;

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
        slug: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 60),
      })
      .select()
      .single();

    if (pageError) {
      return NextResponse.json({ error: pageError.message }, { status: 500 });
    }

    await supabase.from("page_versions").insert({
      page_id: page.id,
      content_json: {
        type: "raw_html",
        html,
        generatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      html,
      project,
      page,
      designTokens,
    });
  } catch (error) {
    console.error("HTML generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
