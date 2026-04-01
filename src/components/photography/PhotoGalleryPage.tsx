import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowUpDown, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhotoLightbox from "./PhotoLightbox";

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

type SortMode = "newest" | "oldest";

const PhotoGalleryPage = () => {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortMode>("newest");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: photos } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("photos")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as Photo[];
    },
  });

  const { data: albums } = useQuery({
    queryKey: ["photo_albums"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("photo_albums")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as Album[];
    },
  });

  // Photos not in any album (loose photos)
  const loosePhotos = useMemo(() => {
    const list = (photos || []).filter(p => !p.album_id);
    return [...list].sort((a, b) =>
      sort === "newest"
        ? new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime()
        : new Date(a.photo_date).getTime() - new Date(b.photo_date).getTime()
    );
  }, [photos, sort]);

  // Photos in selected album
  const albumPhotos = useMemo(() => {
    if (!selectedAlbum) return [];
    const list = (photos || []).filter(p => p.album_id === selectedAlbum.id);
    return [...list].sort((a, b) =>
      sort === "newest"
        ? new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime()
        : new Date(a.photo_date).getTime() - new Date(b.photo_date).getTime()
    );
  }, [photos, selectedAlbum, sort]);

  const getAlbumThumbnail = (album: Album) => {
    if (album.thumbnail_url) return album.thumbnail_url;
    const first = (photos || []).find(p => p.album_id === album.id);
    return first?.image_url || "/placeholder.svg";
  };

  const getAlbumCount = (albumId: string) =>
    (photos || []).filter(p => p.album_id === albumId).length;

  const currentViewPhotos = selectedAlbum ? albumPhotos : loosePhotos;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex items-center h-16 px-6">
          <button
            onClick={() => selectedAlbum ? setSelectedAlbum(null) : navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-sm tracking-wider">
              {selectedAlbum ? "All Photos" : "Back"}
            </span>
          </button>
          <span className="ml-auto font-display text-lg font-bold text-primary tracking-wider">LV</span>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              {selectedAlbum ? (
                <>{selectedAlbum.title}</>
              ) : (
                <>Photo <span className="text-gradient-lagoon">Gallery</span></>
              )}
            </h1>
            <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
              {selectedAlbum?.description || "Moments captured through my lens."}
            </p>
          </motion.div>

          {/* Sort Toggle */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setSort(s => s === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body border border-border rounded-lg px-3 py-2"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sort === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>

          {/* Albums Grid (only on main view) */}
          {!selectedAlbum && (albums || []).length > 0 && (
            <div className="mb-16">
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" /> Albums
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(albums || []).map((album, i) => (
                  <motion.button
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedAlbum(album)}
                    className="group text-left"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card">
                      <img
                        src={getAlbumThumbnail(album)}
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-4">
                        <p className="font-display text-sm font-bold text-foreground">{album.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{getAlbumCount(album.id)} photos</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Photos Grid */}
          {currentViewPhotos.length === 0 ? (
            <div className="text-muted-foreground text-center py-16 font-body">
              {selectedAlbum ? "No photos in this album yet." : "Photos coming soon."}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {currentViewPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => setLightboxIndex(i)}
                >
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Photo"}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Date badge */}
                    <span className="absolute top-3 right-3 font-body text-[10px] text-foreground/40 bg-background/40 backdrop-blur-sm rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {photo.photo_date}
                    </span>
                    {/* Caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="font-body text-sm text-foreground">{photo.caption || ""}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={currentViewPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGalleryPage;
