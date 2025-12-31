-- Add condition column to user_amiibos table
ALTER TABLE public.user_amiibos 
ADD COLUMN condition text DEFAULT 'new' 
CHECK (condition IN ('new', 'used', 'damaged'));