-- Allow authenticated users to insert amiibos (for catalog sync)
CREATE POLICY "Authenticated users can insert amiibos"
ON public.amiibos FOR INSERT
TO authenticated
WITH CHECK (true);