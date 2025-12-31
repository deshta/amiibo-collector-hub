-- Add language preference to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt';

-- Update existing profiles to have default language
UPDATE public.profiles SET language = 'pt' WHERE language IS NULL;