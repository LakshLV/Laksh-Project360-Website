import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useProjects } from "@/hooks/useProjects";
import { getDaysRemaining } from "@/data/projects";

const StatsSection = () => {
  const { data: settings } = useSiteSettings();
  const { data: projects } = useProjects();

  const currentProjectNum = settings?.current_project ?? 8;
  const totalProjects = settings?.total_projects ?? 24;
  
  // Use manual project title if provided, otherwise find in database
  const current = projects?.find((p) => p.project_number === currentProjectNum);
  const currentTitle = (settings?.current_project_override && settings.current_project_override !== "") 
    ? settings.current_project_override 
    : (current?.project_title ?? "In Progress...");

  // Use manual days remaining if provided, otherwise calculate from start date
  const daysRemaining = (settings?.manual_days_remaining && settings.manual_days_remaining !== "")
    ? Number(settings.manual_days_remaining)
    : (current ? getDaysRemaining(current.start_date, current.duration_days) : 0);

  const stats = [
    { label: "Current Project", value: currentTitle, accent: "primary" as const },
    { label: "Project Number", value: `Project ${currentProjectNum} of ${totalProjects}`, accent: "secondary" as const },
    { label: "Days Remaining", value: `${daysRemaining} Days`, accent: "primary" as const },
  ];

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Current Status
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-6 h-full transition-all duration-300 hover:border-primary/40 hover:glow-lagoon"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <p className="font-body text-sm text-muted-foreground uppercase tracking-wider mb-2 text-center">{stat.label}</p>
              <div className={`flex items-center justify-center min-h-[4rem]`}>
                <p className={`font-display text-xl font-semibold text-center leading-tight ${stat.accent === "primary" ? "text-primary" : "text-secondary"}`}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
