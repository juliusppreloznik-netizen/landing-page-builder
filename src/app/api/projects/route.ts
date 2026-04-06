import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/projects — list all projects with their latest page version
export async function GET() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      created_at,
      pages (
        id,
        title,
        slug,
        updated_at,
        page_versions (
          id,
          created_at
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects });
}

// POST /api/projects — create a new project with a default page
export async function POST(req: Request) {
  const supabase = await createClient();
  const { name } = await req.json();

  const projectName = name || "Untitled Project";

  // Create project
  const { data: project, error: projError } = await supabase
    .from("projects")
    .insert({ name: projectName })
    .select()
    .single();

  if (projError) {
    return NextResponse.json({ error: projError.message }, { status: 500 });
  }

  // Create default page
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

  // Create initial empty page version
  const { error: versionError } = await supabase
    .from("page_versions")
    .insert({
      page_id: page.id,
      content_json: { content: [], root: { props: {} } },
    });

  if (versionError) {
    return NextResponse.json({ error: versionError.message }, { status: 500 });
  }

  return NextResponse.json({ project, page });
}

// DELETE /api/projects?id=<project_id> — delete a project and all its pages/versions
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("id");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  // Get pages for this project
  const { data: pages } = await supabase
    .from("pages")
    .select("id")
    .eq("project_id", projectId);

  // Delete versions for each page
  if (pages) {
    for (const page of pages) {
      await supabase
        .from("page_versions")
        .delete()
        .eq("page_id", page.id);
    }
  }

  // Delete pages
  await supabase.from("pages").delete().eq("project_id", projectId);

  // Delete project
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
