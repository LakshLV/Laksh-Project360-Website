import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Project360Page from "./project360/Project360Page";
import AboutPage from "./about/AboutPage";
import CuriositiesPage from "./curiosities/CuriositiesPage";
import ContactSection from "./ContactSection";

const tabs = ["PROJECT 360", "CURIOSITIES", "ABOUT LAKSH"] as const;
type Tab = (typeof tabs)[number];

const Layout = () => {
  const [activeTab, setActiveTab] = useState<Tab>("PROJECT 360");
  const navigate = useNavigate();
  const [lvClicks, setLvClicks] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const handleLvClick = () => {
    const newCount = lvClicks + 1;
    setLvClicks(newCount);
    if (newCount >= 5) {
      navigate("/admin");
      setLvClicks(0);
    }
    setTimeout(() => setLvClicks(0), 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "PROJECT 360":
        return (
          <motion.div key="project360" initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <Project360Page />
          </motion.div>
        );
      case "CURIOSITIES":
        return (
          <motion.div key="curiosities" initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <CuriositiesPage />
          </motion.div>
        );
      case "ABOUT LAKSH":
        return (
          <motion.div key="about" initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <AboutPage />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <motion.span
            className="font-display text-lg font-bold text-primary tracking-wider cursor-pointer select-none"
            whileHover={{ scale: 1.05 }}
            onClick={handleLvClick}
          >
            LV
          </motion.span>

          <div className="flex gap-1 bg-muted/50 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 rounded-full font-display text-xs sm:text-sm font-medium tracking-wider transition-colors duration-300 ${
                  activeTab === tab
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          <div className="w-8" />
        </div>
      </nav>

      <main className="pt-16">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        <ContactSection />
      </main>
    </div>
  );
};

export default Layout;
