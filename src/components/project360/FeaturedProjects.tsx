import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useProjects } from "@/hooks/useProjects";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getProjectImage } from "./projectImages";
import ProjectDetail from "./ProjectDetail";

interface FeaturedProjectsProps {
  onSeeMore?: () => void;
}

const FeaturedProjects = ({ onSeeMore }: FeaturedProjectsProps) => {
  const { data: projects } = useProjects();
  const { data: settings } = useSiteSettings();
  const totalProjects = settings?.total_projects ?? 24;
  const featured = (projects || []).filter((p) => p.featured);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = (index: number) => {
    setActiveIndex(index);
    if (scrollRef.current) {
      const card = scrollRef.current.children[index] as HTMLElement;
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    // If near the end, snap to last index
    if (scrollLeft + clientWidth >= scrollWidth - 20) {
      setActiveIndex(featured.length - 1);
    } else {
      const newIndex = Math.round(scrollLeft / (clientWidth * 0.85));
      setActiveIndex(Math.min(newIndex, featured.length - 1));
    }
  };

  if (selectedProject !== null) {
    const project = featured.find((p) => p.project_number === selectedProject);
    if (project) {
      return (
        <ProjectDetail
          project={project}
          imageUrl={getProjectImage(project.project_number, project.image_url)}
          totalProjects={totalProjects}
          onBack={() => setSelectedProject(null)}
        />
      );
    }
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-6 mb-10">
        <motion.h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Featured Projects
        </motion.h2>
        <motion.p className="text-muted-foreground text-center mt-3 font-body"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          Swipe to explore
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div ref={scrollRef} onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-[10%] pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {featured.map((project, i) => (
            <motion.div key={project.project_number}
              className="flex-shrink-0 w-[85vw] md:w-[70vw] lg:w-[60vw] snap-center cursor-pointer relative group rounded-2xl overflow-hidden"
              style={{ aspectRatio: "16/9" }}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedProject(project.project_number)}
              whileHover={{ scale: 1.02 }}>
              <img src={getProjectImage(project.project_number, project.image_url)}
                alt={project.project_title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 card-vignette transition-opacity duration-500 group-hover:opacity-30" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                <div className="flex gap-2 mb-3">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-primary/20 text-primary font-body text-xs font-medium backdrop-blur-sm border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">{project.project_title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-1">Project {project.project_number} of {totalProjects}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {featured.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`} />
        ))}
      </div>

      {onSeeMore && (
        <div className="flex justify-center mt-10">
          <motion.button onClick={onSeeMore}
            className="px-6 py-3 rounded-full border border-primary/40 text-primary font-body text-sm font-medium hover:bg-primary/10 transition-colors"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            See All Projects →
          </motion.button>
        </div>
      )}
    </section>
  );
};

export default FeaturedProjects;
