import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getProjectImage } from "./projectImages";
import ProjectDetail from "./ProjectDetail";

type Filter = "all" | "featured";

interface AllProjectsPageProps {
  onBack: () => void;
}

const AllProjectsPage = ({ onBack }: AllProjectsPageProps) => {
  const { data: projects } = useProjects();
  const { data: settings } = useSiteSettings();
  const totalProjects = settings?.total_projects ?? 24;
  const [filter, setFilter] = useState<Filter>("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const allProjects = projects || [];
  const filtered = allProjects
    .filter((p) => (filter === "featured" ? p.featured : true))
    .sort((a, b) => (sortAsc ? a.project_number - b.project_number : b.project_number - a.project_number));

  if (selectedProject !== null) {
    const project = allProjects.find((p) => p.project_number === selectedProject);
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
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.button onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-body"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: -4 }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </motion.button>

        <motion.h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          All Projects
        </motion.h2>

        <div className="flex gap-3 mb-10 flex-wrap">
          {(["all", "featured"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-colors border ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}>
              {f === "all" ? "All" : "Featured"}
            </button>
          ))}
          <button onClick={() => setSortAsc(!sortAsc)}
            className="px-4 py-2 rounded-full font-body text-sm font-medium bg-card text-muted-foreground border border-border hover:border-primary/40 transition-colors">
            Project # {sortAsc ? "↑" : "↓"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <motion.div key={project.project_number}
              className="group relative rounded-xl overflow-hidden border border-border bg-card aspect-[16/10] cursor-pointer"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedProject(project.project_number)}
              whileHover={{ scale: 1.03, rotateX: 2, rotateY: -2, transition: { duration: 0.3 } }}
              style={{ transformStyle: "preserve-3d" }}>
              <img src={getProjectImage(project.project_number, project.image_url)}
                alt={project.project_title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 card-vignette transition-opacity duration-500 group-hover:opacity-30" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                <div className="flex gap-1.5 mb-2">
                  {project.tags.slice(0, 2).map((tag) => (
                    <span key={tag}
                      className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-body text-[10px] font-medium backdrop-blur-sm border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground leading-tight">{project.project_title}</h3>
                <p className="font-body text-xs text-muted-foreground mt-1">Project {project.project_number} of {totalProjects}</p>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl glow-lagoon" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllProjectsPage;
