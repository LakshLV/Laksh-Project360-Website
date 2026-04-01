import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBProject {
  id: string;
  project_number: number;
  project_title: string;
  start_date: string;
  duration_days: number;
  summary: string;
  what_i_learned: string;
  tags: string[];
  image_url: string;
  video_url: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("projects")
        .select("*")
        .order("project_number");
      if (error) throw error;
      return (data || []) as DBProject[];
    },
  });
};
