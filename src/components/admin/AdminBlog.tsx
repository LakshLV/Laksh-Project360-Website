import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured: boolean;
  published: boolean;
  read: boolean;
  read_time: string;
  created_at: string;
}

const categoryOptions = [
  { value: "life-update", label: "Life Update" },
  { value: "reflection", label: "Reflection" },
  { value: "qa", label: "Q&A" },
  { value: "announcement", label: "Announcement" },
];

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "reflection",
    featured: false, published: false, read: false, read_time: "5 min",
  });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data as unknown as BlogPost[]);
    setLoading(false);
  };

  const startEdit = (post: BlogPost) => {
    setEditing(post); setCreating(false);
    setForm({ title: post.title, excerpt: post.excerpt, content: post.content,
      category: post.category, featured: post.featured, published: post.published, read: post.read, read_time: post.read_time });
  };

  const startCreate = () => {
    setEditing(null); setCreating(true);
    setForm({ title: "", excerpt: "", content: "", category: "reflection",
      featured: false, published: false, read: false, read_time: "5 min" });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    if (editing) {
      const { error } = await supabase.from("blog_posts").update(form).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Post updated" });
    } else {
      const { error } = await supabase.from("blog_posts").insert(form);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Post created" });
    }
    setEditing(null); setCreating(false); fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Post deleted" }); fetchPosts();
  };

  const togglePublished = async (post: BlogPost) => {
    await supabase.from("blog_posts").update({ published: !post.published }).eq("id", post.id);
    fetchPosts();
  };

  const toggleRead = async (post: BlogPost) => {
    await supabase.from("blog_posts").update({ read: !post.read }).eq("id", post.id);
    fetchPosts();
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading...</div>;

  const showForm = editing || creating;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Blog Posts</h2>
          <p className="text-muted-foreground text-sm">{posts.length} posts</p>
        </div>
        <Button onClick={startCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> New Post</Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 mb-8 space-y-4">
          <Input placeholder="Post title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="bg-background border-border" />
          <Input placeholder="Excerpt" value={form.excerpt}
            onChange={e => setForm({ ...form, excerpt: e.target.value })}
            className="bg-background border-border" />
          <Textarea placeholder="Full content (markdown)" value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            className="bg-background border-border min-h-[200px]" />
          <div className="flex flex-wrap gap-4">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground">
              {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <Input placeholder="Read time" value={form.read_time}
              onChange={e => setForm({ ...form, read_time: e.target.value })}
              className="bg-background border-border w-32" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-primary" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.published}
                onChange={e => setForm({ ...form, published: e.target.checked })} className="accent-primary" />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.read}
                onChange={e => setForm({ ...form, read: e.target.checked })} className="accent-primary" />
              Read
            </label>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setCreating(false); }}>Cancel</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {posts.map(post => (
          <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-foreground truncate">{post.title}</h3>
                {post.featured && <Star className="w-3.5 h-3.5 text-secondary flex-shrink-0" />}
              </div>
              <p className="text-muted-foreground text-sm truncate">{post.excerpt}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-border">
                  {categoryOptions.find(c => c.value === post.category)?.label}
                </Badge>
                <Badge variant="outline"
                  className={`text-xs ${post.published ? "border-primary/40 text-primary" : "border-destructive/40 text-destructive"}`}>
                  {post.published ? "Published" : "Draft"}
                </Badge>
                {post.read && (
                  <Badge variant="outline" className="text-xs border-green-500/40 text-green-500">Read</Badge>
                )}
                <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => toggleRead(post)} title="Toggle read">
                <BookOpen className={`w-4 h-4 ${post.read ? "text-green-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => togglePublished(post)}>
                {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => startEdit(post)}><Edit2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))}
        {posts.length === 0 && !showForm && (
          <div className="text-center py-16 text-muted-foreground">No posts yet.</div>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
