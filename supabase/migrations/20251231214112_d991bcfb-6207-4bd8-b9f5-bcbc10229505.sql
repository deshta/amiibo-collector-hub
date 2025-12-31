-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birthdate DATE,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create function to delete user and all their data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's wishlist
  DELETE FROM public.user_wishlist WHERE user_id = auth.uid();
  
  -- Delete user's collection
  DELETE FROM public.user_amiibos WHERE user_id = auth.uid();
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE id = auth.uid();
  
  -- Delete the user from auth.users (this will cascade)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;