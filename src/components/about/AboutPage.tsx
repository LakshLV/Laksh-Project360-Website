import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAboutSections, useRecentUpdates } from "@/hooks/useAboutContent";
import { Camera, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const skills = [
  { category: "VR / AR", items: ["Unity XR", "Meta Quest SDK", "OpenXR", "SteamVR", "XR Interaction Toolkit"] },
  { category: "Game Engines", items: ["Unity", "Unreal Engine", "Godot"] },
  { category: "Languages", items: ["C#", "C++", "Python", "TypeScript"] },
  { category: "3D & Design", items: ["Blender", "Substance Painter", "Figma", "Photoshop"] },
  { category: "Tools", items: ["Git", "VS Code", "Rider", "Plastic SCM"] },
];

const AboutPage = () => {
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const { data: sections } = useAboutSections();
  const { data: updates } = useRecentUpdates();

  const heading = settings?.about_hero_heading ?? "Laksh";
  const subtitle = settings?.about_hero_subtitle ?? "";

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[60vh] flex items-center px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }} className="text-center">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6">
              Hi, I'm <span className="text-gradient-lagoon">{heading}.</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Sections */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />

            {(sections || []).map((section, i) => {
              const isPhotography = section.title.toLowerCase().includes("photography");
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative pl-12 md:pl-20 pb-12 last:pb-0"
                >
                  {/* Timeline node */}
                  <div className="absolute left-2.5 md:left-6.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-[0_0_8px_hsl(163_88%_56%_/_0.5)]" />

                  <div
                    className={`bg-card/50 border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 ${
                      isPhotography ? "cursor-pointer group hover:bg-card/70" : ""
                    }`}
                    onClick={isPhotography ? () => navigate("/photos") : undefined}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">{section.title}</h2>
                      {isPhotography && (
                        <Camera className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <p className="text-muted-foreground font-body leading-relaxed text-sm md:text-base">{section.content}</p>
                    {isPhotography && (
                      <span className="inline-flex items-center gap-1 mt-3 text-xs text-primary font-display tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        VIEW GALLERY <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      {(updates || []).length > 0 && (
        <section className="py-24 px-6 bg-card/30">
          <div className="container mx-auto max-w-4xl">
            <motion.h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              Recent Updates
            </motion.h2>
            <div className="space-y-6">
              {(updates || []).map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-6 bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                  <span className="font-body text-sm text-muted-foreground whitespace-nowrap min-w-[80px]">
                    {item.update_date}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-foreground">{item.title}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs border border-primary/20">
                    {item.tag}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photography Section */}
      <section className="py-24 px-6 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} className="bg-card/50 border border-border rounded-2xl p-10 hover:border-primary/20 transition-all duration-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 transition-transform">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4 font-bold">Photography</h2>
            <p className="text-muted-foreground font-body leading-relaxed max-w-xl mx-auto mb-8">
              When I'm not in front of a screen, I'm behind a lens. Check out my collection of moments captured in time.
            </p>
            <Button onClick={() => navigate("/photos")} size="lg" className="px-10">
              View Gallery <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
