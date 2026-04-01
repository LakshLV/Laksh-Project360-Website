import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminAbout from "@/components/admin/AdminAbout";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminPhotos from "@/components/admin/AdminPhotos";

const tabs = ["Projects", "About", "Photos", "Blog", "Settings"] as const;
type Tab = (typeof tabs)[number];

const AdminDashboard = () => {
  const { session, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Projects");

  useEffect(() => {
    if (!authLoading && (!session || !isAdmin)) {
      navigate("/login");
    }
  }, [authLoading, session, isAdmin, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-display text-sm font-bold text-primary tracking-wider">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{session?.user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-display text-sm font-medium tracking-wider border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        {activeTab === "Projects" && <AdminProjects />}
        {activeTab === "About" && <AdminAbout />}
        {activeTab === "Photos" && <AdminPhotos />}
        {activeTab === "Blog" && <AdminBlog />}
        {activeTab === "Settings" && <AdminSettings />}
      </div>
    </div>
  );
};

export default AdminDashboard;
