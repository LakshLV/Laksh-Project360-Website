
-- Drop restrictive policies and recreate as permissive

-- user_roles
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also allow users to check their own roles (needed for auth check)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- blog_posts
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.blog_posts;

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (published = true);
