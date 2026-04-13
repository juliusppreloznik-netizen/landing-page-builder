"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  created_at: string;
  pages: {
    id: string;
    title: string;
    slug: string;
    updated_at: string;
    page_versions: { id: string; created_at: string }[];
  }[];
};

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [pastedHtml, setPastedHtml] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const { projects: data } = await res.json();
      setProjects(data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenProject = async (pageId: string) => {
    try {
      const res = await fetch(`/api/pages?id=${pageId}`);
      const { version } = await res.json();
      if (version?.content_json?.type === "raw_html") {
        router.push(`/editor-html?pageId=${pageId}`);
        return;
      }
    } catch {}
    router.push(`/editor?pageId=${pageId}`);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      for (const page of project.pages) {
        await fetch(`/api/pages?pageId=${page.id}`, { method: "DELETE" });
      }
    }
    await fetch(`/api/projects?id=${projectId}`, { method: "DELETE" });
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  const handleLoadIntoEditor = async () => {
    setModalError("");

    if (!projectName.trim()) {
      setModalError("Project name is required.");
      return;
    }
    if (!pastedHtml.trim()) {
      setModalError("Please paste your HTML content.");
      return;
    }

    setSaving(true);
    try {
      // Create project
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });
      const { project, page } = await projRes.json();

      if (!project || !page) {
        setModalError("Failed to create project.");
        setSaving(false);
        return;
      }

      // Save pasted HTML as a page version
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          contentJson: {
            type: "raw_html",
            html: pastedHtml,
            generatedAt: new Date().toISOString(),
          },
        }),
      });

      // Redirect to HTML editor
      router.push(`/editor-html?pageId=${page.id}`);
    } catch {
      setModalError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <p className="text-slate-400 mt-1">
              AI-powered landing pages you&apos;re building
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setProjectName("");
              setPastedHtml("");
              setModalError("");
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-700 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6">Paste your HTML to start editing</p>
            <button
              onClick={() => {
                setShowModal(true);
                setProjectName("");
                setPastedHtml("");
                setModalError("");
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Project Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const page = project.pages[0];
              const lastEdited = page?.updated_at || project.created_at;
              const versionCount = page?.page_versions?.length || 0;

              return (
                <div
                  key={project.id}
                  onClick={() => page && handleOpenProject(page.id)}
                  className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <div className="bg-slate-800 rounded-lg h-36 mb-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 bg-slate-700 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-600">Landing Page</p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Edited {formatDate(lastEdited)}
                        {versionCount > 0 && (
                          <span className="ml-2 text-slate-600">
                            {versionCount} version{versionCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="ml-2 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW PROJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl mx-4 flex flex-col" style={{ maxHeight: "90vh" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 flex-1 overflow-y-auto space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Credit Repair Opt-In Page"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* HTML Paste Area */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  HTML Content
                </label>
                <textarea
                  value={pastedHtml}
                  onChange={(e) => setPastedHtml(e.target.value)}
                  placeholder="Paste your full HTML here..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono resize-none"
                  style={{ minHeight: 400 }}
                />
              </div>

              {/* Error */}
              {modalError && (
                <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-2.5 text-red-300 text-sm">
                  {modalError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-700">
              <button
                onClick={handleLoadIntoEditor}
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Load into Editor"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
