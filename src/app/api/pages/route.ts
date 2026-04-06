import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/pages?id=<page_id> — get latest version of a page
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("id");

  if (!pageId) {
    return NextResponse.json({ error: "Page ID required" }, { status: 400 });
  }

  // Get page info
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, title, slug, project_id, updated_at")
    .eq("id", pageId)
    .single();

  if (pageError) {
    return NextResponse.json({ error: pageError.message }, { status: 404 });
  }

  // Get latest version
  const { data: version, error: versionError } = await supabase
    .from("page_versions")
    .select("id, content_json, created_at")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (versionError) {
    return NextResponse.json({ error: versionError.message }, { status: 500 });
  }

  return NextResponse.json({ page, version });
}

// POST /api/pages — save a new version of a page (auto-save)
export async function POST(req: Request) {
  const supabase = await createClient();
  const { pageId, contentJson } = await req.json();

  if (!pageId || !contentJson) {
    return NextResponse.json(
      { error: "pageId and contentJson required" },
      { status: 400 }
    );
  }

  // Save new version
  const { data: version, error: versionError } = await supabase
    .from("page_versions")
    .insert({
      page_id: pageId,
      content_json: contentJson,
    })
    .select()
    .single();

  if (versionError) {
    return NextResponse.json({ error: versionError.message }, { status: 500 });
  }

  // Touch the page's updated_at
  await supabase
    .from("pages")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", pageId);

  return NextResponse.json({ version });
}
