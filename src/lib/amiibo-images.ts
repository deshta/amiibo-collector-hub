import { supabase } from '@/integrations/supabase/client';

// Helper to get amiibo image URL from local assets or Supabase storage
// Images can be in:
// 1. Local public/amiibo_image folder (legacy)
// 2. Supabase storage bucket 'amiibo-images' (new uploads)

export const getAmiiboImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return '/placeholder.svg';
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) return imagePath;
  
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Check if the image appears to be a timestamp-based filename (from storage upload)
  // or if it has specific patterns indicating storage
  const isStorageImage = /^\d{13,}\./.test(cleanPath);
  
  if (isStorageImage) {
    // Get public URL from Supabase storage
    const { data } = supabase.storage
      .from('amiibo-images')
      .getPublicUrl(cleanPath);
    return data.publicUrl;
  }
  
  // Load from local amiibo_image folder
  return `/amiibo_image/${cleanPath}`;
};
