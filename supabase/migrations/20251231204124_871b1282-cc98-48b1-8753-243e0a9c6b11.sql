-- Create wishlist table for users to mark amiibos they want to acquire
CREATE TABLE public.user_wishlist (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    amiibo_id uuid NOT NULL REFERENCES public.amiibos(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    notes text,
    UNIQUE (user_id, amiibo_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wishlist"
ON public.user_wishlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
ON public.user_wishlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist"
ON public.user_wishlist
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
ON public.user_wishlist
FOR DELETE
USING (auth.uid() = user_id);