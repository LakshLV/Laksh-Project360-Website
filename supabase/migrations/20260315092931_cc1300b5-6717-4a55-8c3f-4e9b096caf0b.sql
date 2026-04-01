
-- Create photo_albums table
CREATE TABLE public.photo_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read albums" ON public.photo_albums FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage albums" ON public.photo_albums FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add album_id and photo_date to photos table
ALTER TABLE public.photos ADD COLUMN album_id uuid REFERENCES public.photo_albums(id) ON DELETE SET NULL;
ALTER TABLE public.photos ADD COLUMN photo_date date NOT NULL DEFAULT CURRENT_DATE;
