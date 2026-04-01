import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { DBProject } from "@/hooks/useProjects";

interface ProjectDetailProps {
  project: DBProject;
  imageUrl: string;
  totalProjects: number;
  onBack: () => void;
}

const isDirectVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

const ProjectDetail = ({ project, imageUrl, totalProjects, onBack }: ProjectDetailProps) => {
  return (
    <section className="min-h-screen relative">
      {imageUrl && imageUrl !== "/placeholder.svg" && (
        <div className="absolute inset-0 z-0">
          <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-6 py-16">
        <motion.button onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 font-body"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: -4 }}>
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex gap-2 mb-4 flex-wrap">
              {project.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">{project.project_title}</h1>
            <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8">{project.summary}</p>

            <div className="bg-card/50 border border-border rounded-xl p-6 mb-8 backdrop-blur-sm">
              <h3 className="font-display text-sm uppercase tracking-wider text-primary mb-3">Project Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground font-body text-xs">Project Number</p>
                  <p className="text-foreground font-display font-semibold">{project.project_number} / {totalProjects}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-body text-xs">Duration</p>
                  <p className="text-foreground font-display font-semibold">{project.duration_days} days</p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6 backdrop-blur-sm">
              <h3 className="font-display text-sm uppercase tracking-wider text-secondary mb-3">What I Learned</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{project.what_i_learned}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="sticky top-24">
            <div className="aspect-[9/16] max-w-sm mx-auto bg-card border border-border rounded-2xl overflow-hidden flex items-center justify-center">
              {project.video_url ? (
                isDirectVideo(project.video_url) ? (
                  <video src={project.video_url} controls className="w-full h-full object-contain"
                    title={`${project.project_title} video`} />
                ) : (
                  <iframe src={project.video_url} className="w-full h-full" allowFullScreen
                    title={`${project.project_title} video`} />
                )
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[12px] border-l-primary border-y-[8px] border-y-transparent ml-1" />
                  </div>
                  <p className="text-muted-foreground font-body text-sm">Video coming soon</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectDetail;
