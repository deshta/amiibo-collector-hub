-- Allow authenticated users to update amiibos (for image uploads)
CREATE POLICY "Authenticated users can update amiibos"
ON public.amiibos
FOR UPDATE
USING (true)
WITH CHECK (true);