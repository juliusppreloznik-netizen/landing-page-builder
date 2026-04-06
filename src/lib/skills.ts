import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const SKILLS_DIR = join(process.cwd(), "skills");

/**
 * Load the landing page builder skill (structure SOP)
 */
export function loadLandingPageBuilderSkill(): string {
  const path = join(SKILLS_DIR, "landing-page-builder", "SKILL.md");
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf-8");
}

/**
 * Load all .md files from the direct-response-copywriter-v3 skill recursively
 */
export function loadCopywriterSkillFiles(): string {
  const baseDir = join(SKILLS_DIR, "direct-response-copywriter-v3");
  if (!existsSync(baseDir)) return "";

  const files: string[] = [];

  function walkDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  walkDir(baseDir);

  // Load and concatenate all files with headers
  return files
    .map((f) => {
      const relativePath = f.replace(baseDir + "/", "");
      const content = readFileSync(f, "utf-8");
      return `\n--- FILE: ${relativePath} ---\n${content}`;
    })
    .join("\n");
}

/**
 * Build the complete skills-powered system prompt
 */
export function buildSkillsPrompt(hasImages: boolean): string {
  const landingPageSkill = loadLandingPageBuilderSkill();
  const copywriterSkills = loadCopywriterSkillFiles();

  return `You are an expert landing page designer and direct-response copywriter.

=== STRUCTURAL SOP (from landing-page-builder.skill) ===
Follow this skill to determine the page structure, required elements, and component order based on the page category (Low-Ticket, VSL, Opt-In, or Webinar).

${landingPageSkill}

=== COPYWRITING FRAMEWORKS (from direct-response-copywriter skill files) ===
Use these frameworks and principles to write ALL copy. Follow the hard rules, style directives, and format-specific guidance.

${copywriterSkills}

=== INSTRUCTIONS ===
1. Identify the page category from the user's brief (Low-Ticket, VSL, Opt-In, or Webinar). If unclear, default to Low-Ticket.
2. Follow the EXACT SOP element order for that category.
3. Write ALL copy using the direct response principles above: 5th-grade reading level, punchy revelatory style, no forced negatives, every line sells the next line.
4. Map SOP elements to available Puck components (HeroSection, FeatureGrid, Testimonials, CallToAction).
${hasImages ? "5. CRITICAL: Apply the typography styles and color palette extracted from the user's uploaded screenshots to ALL components." : "5. Use a professional dark color scheme (#0f172a, #1e293b backgrounds with white text, #4f46e5 accent)."}

Every component MUST have a unique "id" prop.
Return ONLY valid JSON (no markdown fences):
{
  "content": [{ "type": "ComponentName", "props": { "id": "unique-id", ...props } }],
  "root": { "props": {} }
}`;
}
