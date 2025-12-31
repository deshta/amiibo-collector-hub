import { useState } from 'react';
import { Check, Plus, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AmiiboCardProps {
  id: string;
  name: string;
  imagePath: string | null;
  isInCollection?: boolean;
  isBoxed?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleBoxed?: () => void;
}

// Helper to get full image URL from storage path
const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise construct storage URL
  return `https://qlqxczezbpchjnkjwyrd.supabase.co/storage/v1/object/public/amiibo-images/${imagePath}`;
};

export function AmiiboCard({
  name,
  imagePath,
  isInCollection = false,
  isBoxed = false,
  onAdd,
  onRemove,
  onToggleBoxed,
}: AmiiboCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(imagePath);

  return (
    <div
      className={cn(
        "group relative glass-card rounded-2xl p-4 transition-all duration-300 animate-scale-in",
        "hover:shadow-lg hover:-translate-y-1",
        isInCollection && "ring-2 ring-success/50"
      )}
    >
      {/* Collection Badge */}
      {isInCollection && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success shadow-md">
            <Check className="w-4 h-4 text-success-foreground" />
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square rounded-xl bg-gradient-to-b from-muted/50 to-muted overflow-hidden mb-3">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 mb-3">
        <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2">
          {name}
        </h3>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isInCollection ? (
          <>
            <Button
              variant={isBoxed ? "success" : "glass"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBoxed?.();
              }}
            >
              <Package className="w-4 h-4" />
              {isBoxed ? 'Na caixa' : 'Sem caixa'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        )}
      </div>
    </div>
  );
}
