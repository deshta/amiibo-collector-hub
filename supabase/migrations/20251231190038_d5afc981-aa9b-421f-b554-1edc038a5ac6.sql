-- Create storage bucket for amiibo images
INSERT INTO storage.buckets (id, name, public)
VALUES ('amiibo-images', 'amiibo-images', true);

-- Allow anyone to view amiibo images (public bucket)
CREATE POLICY "Anyone can view amiibo images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'amiibo-images');

-- Allow authenticated users to upload amiibo images
CREATE POLICY "Authenticated users can upload amiibo images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'amiibo-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update amiibo images
CREATE POLICY "Authenticated users can update amiibo images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'amiibo-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete amiibo images
CREATE POLICY "Authenticated users can delete amiibo images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'amiibo-images' AND auth.role() = 'authenticated');