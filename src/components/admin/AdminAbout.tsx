import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AboutSection {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

interface RecentUpdate {
  id: string;
  update_date: string;
  title: string;
  tag: string;
  sort_order: number;
}

const AdminAbout = () => {
  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [updates, setUpdates] = useState<RecentUpdate[]>([]);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<RecentUpdate | null>(null);
  const [creatingSection, setCreatingSection] = useState(false);
  const [creatingUpdate, setCreatingUpdate] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: "", content: "", sort_order: 0 });
  const [updateForm, setUpdateForm] = useState({ update_date: "", title: "", tag: "Update", sort_order: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [settingsRes, sectionsRes, updatesRes] = await Promise.all([
      (supabase as any).from("site_settings").select("*"),
      (supabase as any).from("about_sections").select("*").order("sort_order"),
      (supabase as any).from("recent_updates").select("*").order("sort_order"),
    ]);
    if (settingsRes.data) {
      for (const row of settingsRes.data) {
        if (row.key === "about_hero_heading") setHeroHeading(row.value);
        if (row.key === "about_hero_subtitle") setHeroSubtitle(row.value);
      }
    }
    if (sectionsRes.data) setSections(sectionsRes.data);
    if (updatesRes.data) setUpdates(updatesRes.data);
    setLoading(false);
  };

  const saveHero = async () => {
    await Promise.all([
      (supabase as any).from("site_settings").update({ value: heroHeading }).eq("key", "about_hero_heading"),
      (supabase as any).from("site_settings").update({ value: heroSubtitle }).eq("key", "about_hero_subtitle"),
    ]);
    toast({ title: "Hero updated" });
  };

  // Sections CRUD
  const startEditSection = (s: AboutSection) => {
    setEditingSection(s);
    setCreatingSection(false);
    setSectionForm({ title: s.title, content: s.content, sort_order: s.sort_order });
  };

  const startCreateSection = () => {
    setEditingSection(null);
    setCreatingSection(true);
    setSectionForm({ title: "", content: "", sort_order: sections.length });
  };

  const saveSection = async () => {
    if (editingSection) {
      await (supabase as any).from("about_sections").update(sectionForm).eq("id", editingSection.id);
      toast({ title: "Section updated" });
    } else {
      await (supabase as any).from("about_sections").insert(sectionForm);
      toast({ title: "Section created" });
    }
    setEditingSection(null);
    setCreatingSection(false);
    fetchAll();
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    await (supabase as any).from("about_sections").delete().eq("id", id);
    toast({ title: "Section deleted" });
    fetchAll();
  };

  // Updates CRUD
  const startEditUpdate = (u: RecentUpdate) => {
    setEditingUpdate(u);
    setCreatingUpdate(false);
    setUpdateForm({ update_date: u.update_date, title: u.title, tag: u.tag, sort_order: u.sort_order });
  };

  const startCreateUpdate = () => {
    setEditingUpdate(null);
    setCreatingUpdate(true);
    setUpdateForm({ update_date: "", title: "", tag: "Update", sort_order: updates.length });
  };

  const saveUpdate = async () => {
    if (editingUpdate) {
      await (supabase as any).from("recent_updates").update(updateForm).eq("id", editingUpdate.id);
      toast({ title: "Update saved" });
    } else {
      await (supabase as any).from("recent_updates").insert(updateForm);
      toast({ title: "Update created" });
    }
    setEditingUpdate(null);
    setCreatingUpdate(false);
    fetchAll();
  };

  const deleteUpdate = async (id: string) => {
    if (!confirm("Delete this update?")) return;
    await (supabase as any).from("recent_updates").delete().eq("id", id);
    toast({ title: "Update deleted" });
    fetchAll();
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading...</div>;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">About Hero</h2>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <Input placeholder="Heading (e.g. Laksh)" value={heroHeading}
            onChange={e => setHeroHeading(e.target.value)}
            className="bg-background border-border" />
          <Textarea placeholder="Subtitle" value={heroSubtitle}
            onChange={e => setHeroSubtitle(e.target.value)}
            className="bg-background border-border" />
          <Button onClick={saveHero} size="sm"><Save className="w-4 h-4 mr-1" /> Save Hero</Button>
        </div>
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-foreground">About Sections</h2>
          <Button onClick={startCreateSection} size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>

        {(editingSection || creatingSection) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 mb-4 space-y-4">
            <Input placeholder="Section title" value={sectionForm.title}
              onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })}
              className="bg-background border-border" />
            <Textarea placeholder="Content" value={sectionForm.content}
              onChange={e => setSectionForm({ ...sectionForm, content: e.target.value })}
              className="bg-background border-border min-h-[100px]" />
            <Input type="number" placeholder="Sort order" value={sectionForm.sort_order}
              onChange={e => setSectionForm({ ...sectionForm, sort_order: parseInt(e.target.value) || 0 })}
              className="bg-background border-border w-24" />
            <div className="flex gap-3">
              <Button onClick={saveSection}>{editingSection ? "Update" : "Create"}</Button>
              <Button variant="ghost" onClick={() => { setEditingSection(null); setCreatingSection(false); }}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {sections.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-foreground">{s.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{s.content}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => startEditSection(s)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteSection(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Updates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Recent Updates</h2>
          <Button onClick={startCreateUpdate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>

        {(editingUpdate || creatingUpdate) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input placeholder="Date (e.g. Mar 2026)" value={updateForm.update_date}
                onChange={e => setUpdateForm({ ...updateForm, update_date: e.target.value })}
                className="bg-background border-border" />
              <Input placeholder="Title" value={updateForm.title}
                onChange={e => setUpdateForm({ ...updateForm, title: e.target.value })}
                className="sm:col-span-2 bg-background border-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Tag (e.g. Milestone)" value={updateForm.tag}
                onChange={e => setUpdateForm({ ...updateForm, tag: e.target.value })}
                className="bg-background border-border" />
              <Input type="number" placeholder="Sort order" value={updateForm.sort_order}
                onChange={e => setUpdateForm({ ...updateForm, sort_order: parseInt(e.target.value) || 0 })}
                className="bg-background border-border" />
            </div>
            <div className="flex gap-3">
              <Button onClick={saveUpdate}>{editingUpdate ? "Update" : "Create"}</Button>
              <Button variant="ghost" onClick={() => { setEditingUpdate(null); setCreatingUpdate(false); }}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {updates.map(u => (
            <div key={u.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{u.update_date}</span>
                <span className="font-display font-semibold text-foreground truncate">{u.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">{u.tag}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => startEditUpdate(u)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteUpdate(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;
