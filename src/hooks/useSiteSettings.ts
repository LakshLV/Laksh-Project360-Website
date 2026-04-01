import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  current_project: number;
  total_projects: number;
  challenge_start_date: string;
  total_challenge_days: number;
  about_hero_heading: string;
  about_hero_subtitle: string;
  instagram_followers: string;
  // Manual Overrides
  manual_days_remaining?: string;
  manual_day_number?: string;
  current_project_override?: string;
}

const defaults: SiteSettings = {
  current_project: 8,
  total_projects: 24,
  challenge_start_date: "2025-11-02",
  total_challenge_days: 360,
  about_hero_heading: "Laksh",
  about_hero_subtitle: "Curious XR Engineer exploring the intersection of spatial computing, robotics, and brain-computer interfaces.",
  instagram_followers: "0",
  manual_days_remaining: "",
  manual_day_number: "",
  current_project_override: "",
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("site_settings")
        .select("*");
      if (error) throw error;
      const settings = { ...defaults };
      for (const row of data || []) {
        const key = row.key as keyof SiteSettings;
        if (key in settings) {
          if (typeof defaults[key] === "number") {
            (settings as any)[key] = Number(row.value);
          } else {
            (settings as any)[key] = row.value;
          }
        }
      }
      return settings;
    },
  });
};
