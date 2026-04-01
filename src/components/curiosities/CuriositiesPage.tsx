import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowLeft, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured: boolean;
  read: boolean;
  read_time: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  "life-update": "Life Update",
  reflection: "Reflection",
  qa: "Q&A",
  announcement: "Announcement",
};

/* ── helpers ── */
const getBookColor = (post: BlogPost, sessionRead: boolean) => {
  if (post.featured) return { bg: "hsl(42, 74%, 65%)", darkBg: "hsl(42, 60%, 45%)", glow: "0 0 20px hsl(42 74% 65% / 0.5), 0 0 40px hsl(42 74% 65% / 0.2)", text: "hsl(0, 0%, 5%)" };
  if (sessionRead) return { bg: "hsl(140, 70%, 45%)", darkBg: "hsl(140, 60%, 30%)", glow: "0 0 16px hsl(140 70% 50% / 0.4)", text: "hsl(0, 0%, 100%)" };
  return { bg: "hsl(163, 88%, 40%)", darkBg: "hsl(163, 80%, 25%)", glow: "none", text: "hsl(0, 0%, 100%)" };
};

const getBookHeight = (content: string) => {
  const len = content?.length || 0;
  const min = 160;
  const max = 260;
  return Math.min(max, Math.max(min, min + (len / 2000) * (max - min)));
};

/* ── Book spine component ── */
const BookSpine = ({
  post,
  sessionRead,
  onClick,
}: {
  post: BlogPost;
  sessionRead: boolean;
  onClick: () => void;
}) => {
  const { bg, darkBg, glow, text } = getBookColor(post, sessionRead);
  const height = getBookHeight(post.content);
  const thickness = 48;

  return (
    <motion.button
      onClick={onClick}
      className="relative group cursor-pointer flex-shrink-0"
      style={{ width: thickness, height }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12, transition: { duration: 0.25 } }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Book body */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          background: `linear-gradient(135deg, ${bg}, ${darkBg})`,
          boxShadow: glow !== "none"
            ? `${glow}, inset -2px 0 4px rgba(0,0,0,0.3), 2px 4px 8px rgba(0,0,0,0.3)`
            : "inset -2px 0 4px rgba(0,0,0,0.3), 2px 4px 8px rgba(0,0,0,0.3)",
        }}
      />
      {/* Spine edge highlight */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm" style={{ background: `${bg}` }} />
      {/* Title on spine (vertical) */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-1">
        <span
          className="font-display text-[10px] font-bold whitespace-nowrap tracking-wide"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            maxHeight: height - 20,
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: text,
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          {post.title}
        </span>
      </div>
      {/* Featured star */}
      {post.featured && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 text-[8px] flex items-center justify-center">
          ⭐
        </div>
      )}
    </motion.button>
  );
};

/* ── Shelf component ── */
const Shelf = ({
  books,
  sessionReadIds,
  onSelect,
}: {
  books: BlogPost[];
  sessionReadIds: Set<string>;
  onSelect: (post: BlogPost) => void;
}) => (
  <div className="relative mb-8">
    {/* Books row */}
    <div className="flex items-end gap-2 px-4 pb-0 min-h-[180px] justify-center md:justify-start">
      {books.map((post) => (
        <BookSpine key={post.id} post={post} sessionRead={sessionReadIds.has(post.id)} onClick={() => onSelect(post)} />
      ))}
    </div>
    {/* Shelf plank */}
    <div
      className="h-3 rounded-sm relative"
      style={{
        background: "linear-gradient(180deg, hsl(30 30% 25%) 0%, hsl(30 35% 18%) 100%)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 hsl(30 30% 35%)",
      }}
    />
    {/* Shelf bracket shadow */}
    <div
      className="h-2 mx-4"
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)",
      }}
    />
  </div>
);

/* ── Open book view ── */
const OpenBook = ({
  post,
  onClose,
}: {
  post: BlogPost;
  onClose: () => void;
}) => {
  const { bg } = getBookColor(post, false);

  return (
    <motion.div
      className="min-h-screen py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="rounded-t-xl p-8 md:p-10 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${bg}22, ${bg}11)`, borderLeft: `4px solid ${bg}` }}
          initial={{ rotateY: -90 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <button onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-body text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to shelf
          </button>
          <div className="flex items-center gap-3 mb-4">
            {post.featured && (
              <Badge variant="outline" className="border-secondary/40 text-secondary text-xs">Featured</Badge>
            )}
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-xs">
              {categoryLabels[post.category] || post.category}
            </Badge>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.read_time}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="rounded-b-xl p-8 md:p-10 border border-t-0 border-border"
          style={{ background: "hsl(40 20% 95% / 0.04)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground font-body text-base leading-relaxed whitespace-pre-wrap">
              {post.content || post.excerpt}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ── Main component ── */
const CuriositiesPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionReadIds, setSessionReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (data) setPosts(data as unknown as BlogPost[]);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handleSelectPost = useCallback((post: BlogPost) => {
    setSessionReadIds((prev) => {
      const next = new Set(prev);
      next.add(post.id);
      return next;
    });
    setSelectedPost(post);
  }, []);

  const readCount = sessionReadIds.size;
  const booksPerShelf = typeof window !== "undefined" && window.innerWidth < 768 ? 4 : 6;

  const shelves = useMemo(() => {
    const result: BlogPost[][] = [];
    for (let i = 0; i < posts.length; i += booksPerShelf) {
      result.push(posts.slice(i, i + booksPerShelf));
    }
    return result;
  }, [posts, booksPerShelf]);

  if (loading) {
    return (
      <section className="min-h-screen py-20 px-6">
        <div className="container mx-auto max-w-5xl text-center text-muted-foreground pt-32">Loading...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-20 px-6">
      <AnimatePresence mode="wait">
        {selectedPost ? (
          <OpenBook key="open" post={selectedPost} onClose={() => setSelectedPost(null)} />
        ) : (
          <motion.div key="shelf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="container mx-auto max-w-5xl">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">CURIOSITIES</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                  Life updates, reflections, Q&As, and announcements — the unfiltered journal behind the projects.
                </p>

                {/* Read counter */}
                {posts.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="font-display text-sm font-semibold text-foreground">{readCount}</span>
                    <span className="font-body text-sm text-muted-foreground">of {posts.length} books read</span>
                  </div>
                )}
              </motion.div>

              {/* Legend */}
              {posts.length > 0 && (
                <div className="flex items-center justify-center gap-6 mb-10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(163, 88%, 40%)" }} />
                    <span className="font-body text-xs text-muted-foreground">Unread</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(140 70% 45%)" }} />
                    <span className="font-body text-xs text-muted-foreground">Read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(42 74% 65%)" }} />
                    <span className="font-body text-xs text-muted-foreground">Featured</span>
                  </div>
                </div>
              )}

              {/* Shelves */}
              {shelves.length > 0 ? (
                <div className="max-w-2xl mx-auto">
                  {shelves.map((shelfBooks, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}>
                      <Shelf books={shelfBooks} sessionReadIds={sessionReadIds} onSelect={handleSelectPost} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p>Posts coming soon — stay tuned.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CuriositiesPage;
