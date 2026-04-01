import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AboutSection = () => {
  const { data: settings } = useSiteSettings();
  const followers = settings?.instagram_followers ?? "0";

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.h2
          className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          About
        </motion.h2>
        <motion.p
          className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          Join me as I build 24 VR/AR projects in 360 days.
        </motion.p>

        {/* Following Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          <a
            href="https://www.instagram.com/lakshxr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 bg-card border border-border rounded-xl px-6 py-4 hover:border-primary/40 transition-colors group"
          >
            <Instagram className="w-6 h-6 text-primary" />
            <div className="text-left">
              <span className="font-display text-3xl font-bold text-foreground">{followers}</span>
              <span className="block text-xs text-muted-foreground font-body">Instagram Followers</span>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
