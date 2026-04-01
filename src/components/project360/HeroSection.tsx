import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getChallengeDayNumber } from "@/data/projects";

const VRHeadset3D = lazy(() => import("./VRHeadset3D"));

type Phase = "falling" | "flickering" | "glowing" | "revealed";

const HeroSection = () => {
  const [phase, setPhase] = useState<Phase>("falling");
  const [barAnimated, setBarAnimated] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { data: settings } = useSiteSettings();

  const currentProject = settings?.current_project ?? 8;
  const totalProjects = settings?.total_projects ?? 24;
  const challengeStartDate = settings?.challenge_start_date ?? "2025-11-02";
  const totalChallengeDays = settings?.total_challenge_days ?? 360;

  const dayNumber = settings?.manual_day_number && settings.manual_day_number !== "" 
    ? Number(settings.manual_day_number) 
    : getChallengeDayNumber(challengeStartDate, totalChallengeDays);
    
  const progress = currentProject / totalProjects;

  const handleHeadsetLanded = () => {
    setTimeout(() => setPhase("flickering"), 400);
    setTimeout(() => setPhase("glowing"), 1000);
    setTimeout(() => setPhase("revealed"), 1200);
    setTimeout(() => setBarAnimated(true), 1600);
    setTimeout(() => setShowStats(true), 2200);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background bloom */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-bloom ${
            phase === "revealed" || phase === "glowing" ? "bg-bloom-active" : ""
          }`}
          style={{
            background: "radial-gradient(circle, hsl(163 88% 56% / 0.08) 0%, hsl(163 88% 56% / 0.02) 40%, transparent 70%)",
            opacity: phase === "falling" || phase === "flickering" ? 0 : 1,
            transform: phase === "revealed" ? "scale(1.8)" : "scale(0.5)",
          }}
        />
      </div>

      {/* 3D Headset */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ top: "-10%" }}>
        <Suspense fallback={null}>
          <VRHeadset3D onLanded={handleHeadsetLanded} />
        </Suspense>
      </div>

      {/* Title */}
      <motion.h1
        className={`font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-12 relative z-20 select-none ${
          phase === "flickering"
            ? "animate-flicker"
            : phase === "glowing" || phase === "revealed"
            ? "text-glow-lagoon"
            : "text-foreground"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "falling" ? 0.15 : 1 }}
        transition={{ duration: phase === "falling" ? 0.5 : 0.3 }}
      >
        PROJECT 360
      </motion.h1>

      {/* Progress bar */}
      <div className="w-full max-w-2xl relative z-20">
        <motion.div className="text-center mb-3" initial={{ opacity: 0 }}
          animate={{ opacity: showStats ? 1 : 0 }} transition={{ duration: 0.8 }}>
          <span className="font-display text-3xl md:text-4xl font-bold text-foreground">{currentProject}</span>
          <span className="font-display text-3xl md:text-4xl font-light text-muted-foreground"> / {totalProjects}</span>
        </motion.div>

        <div className="h-4 md:h-5 rounded-full bg-muted/50 overflow-hidden relative border border-border/50">
          <motion.div className="h-full rounded-full relative"
            initial={{ width: "0%" }}
            animate={barAnimated ? { width: `${progress * 100}%` } : {}}
            transition={{ duration: 2.8, ease: [0.05, 0.7, 0.1, 1] }}
            style={{ background: `linear-gradient(90deg, hsl(0 100% 65%) 0%, hsl(42 74% 65%) 30%, hsl(163 88% 56%) 80%)` }}>
            <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary"
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ filter: "blur(8px)" }} />
            <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-foreground"
              initial={{ opacity: 0 }} animate={barAnimated ? { opacity: 1 } : {}} transition={{ delay: 2.8, duration: 0.3 }} />
          </motion.div>
        </div>

        <motion.div className="text-center mt-3" initial={{ opacity: 0 }}
          animate={{ opacity: showStats ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <span className="font-body text-sm text-muted-foreground tracking-wider uppercase">Day </span>
          <span className="font-display text-lg font-semibold text-secondary">{dayNumber}</span>
          <span className="font-body text-sm text-muted-foreground"> / {totalChallengeDays}</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "revealed" ? 1 : 0, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 0.5 }, y: { repeat: Infinity, duration: 2 } }}>
        <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
