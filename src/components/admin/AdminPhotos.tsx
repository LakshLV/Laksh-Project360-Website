import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, FolderPlus, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  photo_date: string;
  album_id: string | null;
}

interface Album {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  sort_order: number;
}

const AdminPhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newAlbumId, setNewAlbumId] = useState<string>("");
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [{ data: p }, { data: a }] = await Promise.all([
      (supabase as any).from("photos").select("*").order("sort_order"),
      (supabase as any).from("photo_albums").select("*").order("sort_order"),
    ]);
    if (p) setPhotos(p);
    if (a) setAlbums(a);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("project-media")
      .upload(`photos/${fileName}`, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("project-media").getPublicUrl(`photos/${fileName}`);

    await (supabase as any).from("photos").insert({
      image_url: urlData.publicUrl,
      caption: newCaption,
      sort_order: photos.length,
      photo_date: newDate,
      album_id: newAlbumId || null,
    });

    setNewCaption("");
    setNewDate(new Date().toISOString().slice(0, 10));
    toast({ title: "Photo added" });
    setUploading(false);
    fetchAll();
  };

  const updatePhoto = async (id: string, fields: Partial<Photo>) => {
    await (supabase as any).from("photos").update(fields).eq("id", id);
    toast({ title: "Photo updated" });
    fetchAll();
  };

  const deletePhoto = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    await (supabase as any).from("photos").delete().eq("id", id);
    toast({ title: "Photo deleted" });
    fetchAll();
  };

  const createAlbum = async () => {
    if (!newAlbumTitle.trim()) return;
    await (supabase as any).from("photo_albums").insert({
      title: newAlbumTitle,
      description: newAlbumDesc,
      sort_order: albums.length,
    });
    setNewAlbumTitle("");
    setNewAlbumDesc("");
    toast({ title: "Album created" });
    fetchAll();
  };

  const deleteAlbum = async (id: string) => {
    if (!confirm("Delete this album? Photos will be unassigned, not deleted.")) return;
    await (supabase as any).from("photo_albums").delete().eq("id", id);
    toast({ title: "Album deleted" });
    fetchAll();
  };

  const setAlbumThumbnail = async (albumId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const fileName = `album-thumb-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("project-media").upload(`photos/${fileName}`, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("project-media").getPublicUrl(`photos/${fileName}`);
    await (supabase as any).from("photo_albums").update({ thumbnail_url: urlData.publicUrl }).eq("id", albumId);
    toast({ title: "Thumbnail updated" });
    fetchAll();
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading...</div>;

  return (
    <div className="space-y-10">
      {/* Albums Section */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Albums</h2>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Album title" value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} className="bg-background border-border" />
            <Input placeholder="Description (optional)" value={newAlbumDesc} onChange={e => setNewAlbumDesc(e.target.value)} className="bg-background border-border" />
          </div>
          <Button size="sm" onClick={createAlbum} disabled={!newAlbumTitle.trim()}>
            <FolderPlus className="w-4 h-4 mr-1" /> Create Album
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map(album => {
            const count = photos.filter(p => p.album_id === album.id).length;
            const thumb = album.thumbnail_url || photos.find(p => p.album_id === album.id)?.image_url || "/placeholder.svg";
            return (
              <div key={album.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="relative h-32">
                  <img src={thumb} alt={album.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="font-display text-sm font-bold text-foreground">{album.title}</p>
                    <p className="text-xs text-muted-foreground">{count} photos</p>
                  </div>
                </div>
                <div className="p-3 flex items-center gap-2">
                  <label className="cursor-pointer text-xs text-primary hover:underline flex items-center gap-1">
                    <Image className="w-3 h-3" /> Set thumbnail
                    <input type="file" accept="image/*" onChange={e => setAlbumThumbnail(album.id, e)} className="hidden" />
                  </label>
                  <Button variant="ghost" size="sm" onClick={() => deleteAlbum(album.id)} className="ml-auto text-destructive text-xs">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Photo */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Upload Photo</h2>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea placeholder="Caption (optional)" value={newCaption} onChange={e => setNewCaption(e.target.value)} className="bg-background border-border" />
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Album (optional)</label>
                <select value={newAlbumId} onChange={e => setNewAlbumId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">No album</option>
                  {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Button asChild disabled={uploading} size="sm">
              <span><Upload className="w-4 h-4 mr-1" />{uploading ? "Uploading..." : "Upload Photo"}</span>
            </Button>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* All Photos */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">All Photos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <img src={photo.image_url} alt={photo.caption} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-3">
                <Input defaultValue={photo.caption} placeholder="Caption..."
                  onBlur={e => { if (e.target.value !== photo.caption) updatePhoto(photo.id, { caption: e.target.value }); }}
                  className="bg-background border-border text-sm" />
                <div className="flex gap-2">
                  <Input type="date" defaultValue={photo.photo_date}
                    onBlur={e => { if (e.target.value !== photo.photo_date) updatePhoto(photo.id, { photo_date: e.target.value }); }}
                    className="bg-background border-border text-sm flex-1" />
                  <select defaultValue={photo.album_id || ""}
                    onChange={e => updatePhoto(photo.id, { album_id: e.target.value || null } as any)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground flex-1">
                    <option value="">No album</option>
                    {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deletePhoto(photo.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPhotos;
