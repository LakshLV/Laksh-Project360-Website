import { motion } from "framer-motion";
import { Mail, Linkedin, Instagram } from "lucide-react";

const links = [
  { icon: Mail, label: "Email", href: "mailto:Lakshvrar@gmail.com", display: "Lakshvrar@gmail.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/laksh-vadbheru/", display: "linkedin.com/in/laksh-vadbheru" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/lakshxr/", display: "@lakshxr" },
];

const ContactSection = () => {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.h2 className="font-display text-3xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Let's Connect
        </motion.h2>
        <motion.p className="text-muted-foreground font-body mb-12"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          Always open to collaborations, conversations, and new ideas.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {links.map((link, i) => (
            <motion.a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:glow-lagoon transition-all duration-300"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
              <link.icon className="w-5 h-5 text-primary" />
              <span className="font-body text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {link.display}
              </span>
            </motion.a>
          ))}
        </div>

        <motion.p className="mt-16 font-body text-xs text-muted-foreground/50"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          © 2026 Laksh Vadbheru. Built with Curiosity.
        </motion.p>
      </div>
    </section>
  );
};

export default ContactSection;
