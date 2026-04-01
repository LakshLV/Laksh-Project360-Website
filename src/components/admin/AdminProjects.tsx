import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Star, Upload, Video } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { DBProject } from "@/hooks/useProjects";

const AdminProjects = () => {
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DBProject | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    project_number: 1,
    project_title: "",
    start_date: "",
    duration_days: 15,
    summary: "",
    what_i_learned: "",
    tags: "",
    featured: false,
    image_url: "",
    video_url: "",
  });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data } = await (supabase as any).from("projects").select("*").order("project_number");
    if (data) setProjects(data);
    setLoading(false);
  };

  const startEdit = (p: DBProject) => {
    setEditing(p);
    setCreating(false);
    setForm({
      project_number: p.project_number,
      project_title: p.project_title,
      start_date: p.start_date,
      duration_days: p.duration_days,
      summary: p.summary,
      what_i_learned: p.what_i_learned,
      tags: p.tags.join(", "),
      featured: p.featured,
      image_url: p.image_url,
      video_url: p.video_url,
    });
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    const nextNum = projects.length > 0 ? Math.max(...projects.map(p => p.project_number)) + 1 : 1;
    setForm({
      project_number: nextNum,
      project_title: "",
      start_date: new Date().toISOString().split("T")[0],
      duration_days: 15,
      summary: "",
      what_i_learned: "",
      tags: "",
      featured: false,
      image_url: "",
      video_url: "",
    });
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("project-media").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("project-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, type === "image" ? "images" : "videos");
      setForm(f => ({ ...f, [type === "image" ? "image_url" : "video_url"]: url }));
      toast({ title: `${type === "image" ? "Image" : "Video"} uploaded` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.project_title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const payload = {
      project_number: form.project_number,
      project_title: form.project_title,
      start_date: form.start_date,
      duration_days: form.duration_days,
      summary: form.summary,
      what_i_learned: form.what_i_learned,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      featured: form.featured,
      image_url: form.image_url,
      video_url: form.video_url,
    };
    if (editing) {
      const { error } = await (supabase as any).from("projects").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Project updated" });
    } else {
      const { error } = await (supabase as any).from("projects").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Project created" });
    }
    setEditing(null);
    setCreating(false);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await (supabase as any).from("projects").delete().eq("id", id);
    toast({ title: "Project deleted" });
    fetchProjects();
  };

  const toggleFeatured = async (p: DBProject) => {
    await (supabase as any).from("projects").update({ featured: !p.featured }).eq("id", p.id);
    fetchProjects();
  };

  const showForm = editing || creating;

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground text-sm">{projects.length} projects</p>
        </div>
        <Button onClick={startCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Project</Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">
            {editing ? "Edit Project" : "New Project"}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input placeholder="Project title" value={form.project_title}
                onChange={e => setForm({ ...form, project_title: e.target.value })}
                className="sm:col-span-2 bg-background border-border" />
              <Input type="number" placeholder="Project #" value={form.project_number}
                onChange={e => setForm({ ...form, project_number: parseInt(e.target.value) || 0 })}
                className="bg-background border-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="date" value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="bg-background border-border" />
              <Input type="number" placeholder="Duration (days)" value={form.duration_days}
                onChange={e => setForm({ ...form, duration_days: parseInt(e.target.value) || 15 })}
                className="bg-background border-border" />
            </div>
            <Textarea placeholder="Summary" value={form.summary}
              onChange={e => setForm({ ...form, summary: e.target.value })}
              className="bg-background border-border min-h-[100px]" />
            <Textarea placeholder="What I learned" value={form.what_i_learned}
              onChange={e => setForm({ ...form, what_i_learned: e.target.value })}
              className="bg-background border-border min-h-[80px]" />
            <Input placeholder="Tags (comma separated)" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className="bg-background border-border" />

            {/* Media uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Image</label>
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-md border border-border bg-background text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleFileUpload(e, "image")} />
                  </label>
                  {form.image_url && (
                    <img src={form.image_url} alt="" className="w-10 h-10 rounded object-cover border border-border" />
                  )}
                </div>
                <Input placeholder="Or paste image URL" value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  className="bg-background border-border mt-2 text-xs" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Video</label>
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-md border border-border bg-background text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                    <Video className="w-3.5 h-3.5" /> Upload
                    <input type="file" accept="video/*" className="hidden"
                      onChange={e => handleFileUpload(e, "video")} />
                  </label>
                  {form.video_url && <span className="text-xs text-primary truncate max-w-[120px]">✓ Video set</span>}
                </div>
                <Input placeholder="Or paste video/embed URL" value={form.video_url}
                  onChange={e => setForm({ ...form, video_url: e.target.value })}
                  className="bg-background border-border mt-2 text-xs" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.checked })}
                className="accent-primary" />
              Featured
            </label>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={uploading}>
                {editing ? "Update" : "Create"}
              </Button>
              <Button variant="ghost" onClick={() => { setEditing(null); setCreating(false); }}>Cancel</Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {projects.map(p => (
          <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-mono">#{p.project_number}</span>
                <h3 className="font-display font-bold text-foreground truncate">{p.project_title}</h3>
                {p.featured && <Star className="w-3.5 h-3.5 text-secondary flex-shrink-0" />}
              </div>
              <p className="text-muted-foreground text-sm truncate">{p.summary}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {p.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs border-border">{tag}</Badge>
                ))}
                <span className="text-xs text-muted-foreground">{p.duration_days}d</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => toggleFeatured(p)}
                title={p.featured ? "Unfeature" : "Feature"}>
                <Star className={`w-4 h-4 ${p.featured ? "text-secondary fill-secondary" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => startEdit(p)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;
