-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create amiibos catalog table
CREATE TABLE public.amiibos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  character_name TEXT NOT NULL,
  image_url TEXT,
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on amiibos (public read, admin write)
ALTER TABLE public.amiibos ENABLE ROW LEVEL SECURITY;

-- Everyone can view amiibos catalog
CREATE POLICY "Anyone can view amiibos"
ON public.amiibos FOR SELECT
TO authenticated
USING (true);

-- Create user_amiibos collection table
CREATE TABLE public.user_amiibos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amiibo_id UUID NOT NULL REFERENCES public.amiibos(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  is_boxed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, amiibo_id)
);

-- Enable RLS on user_amiibos
ALTER TABLE public.user_amiibos ENABLE ROW LEVEL SECURITY;

-- Users can view their own collection
CREATE POLICY "Users can view their own collection"
ON public.user_amiibos FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own collection
CREATE POLICY "Users can add to their own collection"
ON public.user_amiibos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own collection items
CREATE POLICY "Users can update their own collection"
ON public.user_amiibos FOR UPDATE
USING (auth.uid() = user_id);

-- Users can remove from their own collection
CREATE POLICY "Users can delete from their own collection"
ON public.user_amiibos FOR DELETE
USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'username');
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some initial amiibos data
INSERT INTO public.amiibos (name, series, character_name, image_url) VALUES
  ('Mario', 'Super Smash Bros.', 'Mario', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_00000000-00000002.png'),
  ('Link', 'Super Smash Bros.', 'Link', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_01000000-00040002.png'),
  ('Pikachu', 'Super Smash Bros.', 'Pikachu', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_19010000-00190002.png'),
  ('Samus', 'Super Smash Bros.', 'Samus', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_08000000-00080002.png'),
  ('Kirby', 'Super Smash Bros.', 'Kirby', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_1f000000-00190002.png'),
  ('Zelda', 'Super Smash Bros.', 'Zelda', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_01000000-00070002.png'),
  ('Peach', 'Super Smash Bros.', 'Peach', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_00000000-00010002.png'),
  ('Donkey Kong', 'Super Smash Bros.', 'Donkey Kong', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_00060000-00070002.png'),
  ('Yoshi', 'Super Smash Bros.', 'Yoshi', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_00030000-00020002.png'),
  ('Luigi', 'Super Smash Bros.', 'Luigi', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_00000100-00050002.png'),
  ('Bowser', 'Super Smash Bros.', 'Bowser', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_00000000-00060002.png'),
  ('Captain Falcon', 'Super Smash Bros.', 'Captain Falcon', 'https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_07c00000-00010002.png');