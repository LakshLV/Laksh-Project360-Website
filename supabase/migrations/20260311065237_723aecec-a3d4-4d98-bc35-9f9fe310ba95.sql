
-- Fix existing blog_posts policies (change from restrictive to permissive)
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.blog_posts;

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT
  USING (published = true);

-- Fix existing user_roles policies
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number integer NOT NULL UNIQUE,
  project_title text NOT NULL,
  start_date date NOT NULL,
  duration_days integer NOT NULL DEFAULT 15,
  summary text NOT NULL DEFAULT '',
  what_i_learned text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  image_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Site settings (key-value)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- About sections
CREATE TABLE public.about_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Recent updates
CREATE TABLE public.recent_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_date text NOT NULL,
  title text NOT NULL,
  tag text NOT NULL DEFAULT 'Update',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_updates ENABLE ROW LEVEL SECURITY;

-- Public read (permissive)
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read about" ON public.about_sections FOR SELECT USING (true);
CREATE POLICY "Public read updates" ON public.recent_updates FOR SELECT USING (true);

-- Admin write (permissive)
CREATE POLICY "Admin manage projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage about" ON public.about_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage updates" ON public.recent_updates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for project media
INSERT INTO storage.buckets (id, name, public) VALUES ('project-media', 'project-media', true);

CREATE POLICY "Public read project media" ON storage.objects FOR SELECT USING (bucket_id = 'project-media');
CREATE POLICY "Admin upload project media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update project media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete project media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_sections_updated_at BEFORE UPDATE ON public.about_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('current_project', '8'),
  ('total_projects', '24'),
  ('challenge_start_date', '2025-11-02'),
  ('total_challenge_days', '360'),
  ('about_hero_heading', 'Laksh'),
  ('about_hero_subtitle', 'Curious XR Engineer exploring the intersection of spatial computing, robotics, and brain-computer interfaces.');

-- Seed projects
INSERT INTO public.projects (project_number, project_title, start_date, duration_days, summary, what_i_learned, tags, featured) VALUES
  (1, 'SoundSense', '2025-11-01', 15, 'MIT Reality Hack project creating real-time directional sound captions in XR. Built spatial audio visualization that helps deaf and hard-of-hearing users navigate soundscapes.', 'Spatial audio processing, XR accessibility design, rapid prototyping under hackathon pressure, and the power of inclusive design.', ARRAY['XR','Accessibility','Hackathon','Spatial Audio'], true),
  (2, 'Monocular Visual OpenCV From Scratch', '2025-11-16', 15, 'Built a complete visual SLAM pipeline using C++ and OpenCV. From feature extraction to bundle adjustment, every component was handcrafted.', 'Epipolar geometry, feature matching algorithms, pose estimation, and the beauty of computational geometry.', ARRAY['C++','Computer Vision','OpenCV','SLAM'], true),
  (3, 'Memory Capture Glasses App', '2025-12-01', 15, 'XR system that pairs captured photos with recognized music, essentially an album cover maker. Combines image recognition with audio fingerprinting to create visual memories.', 'Image-audio pairing systems, music recognition APIs, XR app design, and building emotionally resonant tech experiences.', ARRAY['XR','App Dev','Music','Computer Vision'], true),
  (4, 'VR Horror Game', '2025-12-16', 15, 'Immersive VR horror experience featuring intelligent AI enemy behavior. Procedural fear generation meets spatial computing.', 'AI behavior trees, procedural audio design, fear psychology in VR, and performance optimization for presence.', ARRAY['VR','Game Dev','AI','Horror'], true),
  (5, 'Black Hole WebXR', '2026-01-01', 15, 'Interactive visualization exploring physics concepts around black holes. Gravitational lensing, time dilation, and accretion disk rendering.', 'General relativity visualization, shader programming, ray marching techniques, and making physics tangible.', ARRAY['Physics','WebXR','Shaders','Visualization'], true),
  (6, 'AR Navigation System', '2026-01-16', 15, 'Augmented reality wayfinding using spatial anchors and real-time pathfinding.', 'Spatial mapping, AR anchor persistence, pathfinding algorithms in 3D space.', ARRAY['AR','Navigation','Spatial Computing'], false),
  (7, 'Gesture-Controlled Drone', '2026-02-01', 15, 'Hand tracking meets drone control. Using MediaPipe and custom gesture recognition to pilot drones naturally.', 'Hand tracking pipelines, drone APIs, real-time gesture classification, safety systems.', ARRAY['Robotics','Hand Tracking','Drones'], false),
  (8, 'Building My Personal Website', '2026-02-16', 15, 'Designing and building this very website — a living portfolio for Project 360.', 'In progress...', ARRAY['Web Dev','Design','Portfolio'], false);

-- Seed about sections
INSERT INTO public.about_sections (title, content, sort_order) VALUES
  ('Personal Story', 'From tinkering with circuits as a kid to building spatial computing experiences at MIT — my journey has always been driven by a relentless curiosity about how technology can reshape human perception. Project 360 is the culmination of years of exploring, failing, and building.', 0),
  ('Sports & Physical Activities', E'When I''m not in VR, you''ll find me swimming in the ocean, playing basketball, or hitting the trails. Physical movement fuels creative thinking — some of my best project ideas come during a run.', 1),
  ('Photography', 'I see the world through frames. Street photography, landscapes, and macro shots of everyday objects — capturing light and perspective is another form of spatial thinking.', 2),
  ('Hobbies', 'Beyond tech: reading sci-fi novels, experimenting with coffee brewing, building mechanical keyboards, and exploring new cities whenever possible.', 3);

-- Seed recent updates
INSERT INTO public.recent_updates (update_date, title, tag, sort_order) VALUES
  ('Mar 2026', 'Launched Project 360 Portfolio Website', 'Launch', 0),
  ('Feb 2026', E'Started Project 8 — Personal Website Build', 'Project 360', 1),
  ('Jan 2026', 'Completed Black Hole Simulation', 'Milestone', 2);
