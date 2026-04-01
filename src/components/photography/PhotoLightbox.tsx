import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  image_url: string;
  caption: string;
  photo_date: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

const swipeVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const PhotoLightbox = ({ photos, initialIndex, onClose }: PhotoLightboxProps) => {
  const [[index, direction], setIndex] = useState([initialIndex, 0]);

  const paginate = useCallback((dir: number) => {
    setIndex(([prev]) => {
      const next = prev + dir;
      if (next < 0 || next >= photos.length) return [prev, 0];
      return [next, dir];
    });
  }, [photos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, paginate]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-6 right-6 z-10 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-6 left-6 text-muted-foreground font-body text-sm">
        {index + 1} / {photos.length}
      </div>

      {/* Nav arrows */}
      {index > 0 && (
        <button onClick={() => paginate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/50 border border-border text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {index < photos.length - 1 && (
        <button onClick={() => paginate(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/50 border border-border text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <div className="relative w-full h-full flex items-center justify-center px-16 py-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={photo.id}
            src={photo.image_url}
            alt={photo.caption || "Photo"}
            className="max-w-full max-h-full object-contain rounded-lg"
            custom={direction}
            variants={swipeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80) paginate(-1);
              else if (info.offset.x < -80) paginate(1);
            }}
          />
        </AnimatePresence>
      </div>

      {/* Caption & date */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center max-w-lg">
        {photo.caption && <p className="font-body text-foreground text-sm mb-1">{photo.caption}</p>}
        <p className="font-body text-muted-foreground/50 text-xs">{photo.photo_date}</p>
      </div>
    </motion.div>
  );
};

export default PhotoLightbox;
