// Helper to get amiibo image URL from local assets
// Images should be placed in src/lib/amiibo_image folder

export const getAmiiboImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) return imagePath;
  
  // Load from local amiibo_image folder
  // Using dynamic import path for Vite
  return `lib/amiibo-image/${imagePath}`;
};
