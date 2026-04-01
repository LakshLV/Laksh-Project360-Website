import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import StatsSection from "./StatsSection";
import FeaturedProjects from "./FeaturedProjects";
import AllProjectsPage from "./AllProjectsPage";

const Project360Page = () => {
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    if (showAllProjects) {
      window.scrollTo(0, 0);
    }
  }, [showAllProjects]);

  if (showAllProjects) {
    return <AllProjectsPage onBack={() => setShowAllProjects(false)} />;
  }

  return (
    <div>
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <FeaturedProjects onSeeMore={() => setShowAllProjects(true)} />
    </div>
  );
};

export default Project360Page;
