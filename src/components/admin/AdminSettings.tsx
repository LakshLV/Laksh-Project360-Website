import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    current_project: "8",
    total_projects: "24",
    challenge_start_date: "2025-11-02",
    total_challenge_days: "360",
    instagram_followers: "0",
    manual_days_remaining: "",
    manual_day_number: "",
    current_project_override: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data } = await (supabase as any).from("site_settings").select("*");
    if (data) {
      const s = { ...settings };
      for (const row of data) {
        if (row.key in s) {
          (s as any)[row.key] = row.value;
        }
      }
      setSettings(s);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const updates = Object.entries(settings).map(([key, value]) =>
      (supabase as any).from("site_settings").upsert({ key, value }, { onConflict: "key" })
    );
    await Promise.all(updates);
    toast({ title: "Settings saved" });
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">General Settings</h2>
        <p className="text-muted-foreground text-sm mb-6">Standard challenge tracking based on dates.</p>
        
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Current Project #</label>
              <Input type="number" value={settings.current_project}
                onChange={e => setSettings({ ...settings, current_project: e.target.value })}
                className="bg-background border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Total Projects</label>
              <Input type="number" value={settings.total_projects}
                onChange={e => setSettings({ ...settings, total_projects: e.target.value })}
                className="bg-background border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Challenge Start Date</label>
              <Input type="date" value={settings.challenge_start_date}
                onChange={e => setSettings({ ...settings, challenge_start_date: e.target.value })}
                className="bg-background border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Total Challenge Days</label>
              <Input type="number" value={settings.total_challenge_days}
                onChange={e => setSettings({ ...settings, total_challenge_days: e.target.value })}
                className="bg-background border-border" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Manual Overrides</h2>
        <p className="text-muted-foreground text-sm mb-6">Directly control the status display. Leave empty to use auto-calculation.</p>
        
        <div className="bg-card/40 border border-dashed border-primary/20 rounded-xl p-6 space-y-6">
          <Alert variant="default" className="bg-primary/5 border-primary/10">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs text-muted-foreground">
              Overrides allow you to show negative days remaining or custom project titles even if the project isn't in your data list yet.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Manual "Days Remaining" (can be negative)</label>
              <Input placeholder="e.g. 10 or -5" value={settings.manual_days_remaining}
                onChange={e => setSettings({ ...settings, manual_days_remaining: e.target.value })}
                className="bg-background border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Manual "Day Number" (Override Hero day)</label>
              <Input placeholder="e.g. 150" value={settings.manual_day_number}
                onChange={e => setSettings({ ...settings, manual_day_number: e.target.value })}
                className="bg-background border-border" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-muted-foreground mb-2 block">Current Project Title Prompt</label>
              <Input placeholder="e.g. Designing My Next App" value={settings.current_project_override}
                onChange={e => setSettings({ ...settings, current_project_override: e.target.value })}
                className="bg-background border-border" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <label className="text-sm text-muted-foreground mb-2 block">Instagram Followers Label</label>
          <Input value={settings.instagram_followers}
            onChange={e => setSettings({ ...settings, instagram_followers: e.target.value })}
            className="bg-background border-border w-full max-w-sm" placeholder="e.g. 1,234" />
        </div>
        
        <Button onClick={handleSave} size="lg" className="w-fit"><Save className="w-4 h-4 mr-1" /> Save All Settings</Button>
      </div>
    </div>
  );
};

export default AdminSettings;
