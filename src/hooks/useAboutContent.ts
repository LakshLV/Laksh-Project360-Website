import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AboutSection {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

export interface RecentUpdate {
  id: string;
  update_date: string;
  title: string;
  tag: string;
  sort_order: number;
}

export const useAboutSections = () => {
  return useQuery({
    queryKey: ["about_sections"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("about_sections")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as AboutSection[];
    },
  });
};

export const useRecentUpdates = () => {
  return useQuery({
    queryKey: ["recent_updates"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("recent_updates")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as RecentUpdate[];
    },
  });
};
