import { useState } from 'react';
import { Check, Plus, Package, PackageOpen, Trash2, Heart, Sparkles, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

export type AmiiboCondition = 'new' | 'used' | 'damaged';

interface AmiiboCardProps {
  id: string;
  name: string;
  imagePath: string | null;
  series: string | null;
  type: string | null;
  isInCollection?: boolean;
  isBoxed?: boolean;
  isInWishlist?: boolean;
  condition?: AmiiboCondition;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleBoxed?: () => void;
  onToggleWishlist?: () => void;
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
  series,
  type,
  isInCollection = false,
  isBoxed = false,
  isInWishlist = false,
  condition = 'new',
  onAdd,
  onRemove,
  onToggleBoxed,
  onToggleWishlist,
}: AmiiboCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(imagePath);
  const { t } = useLanguage();

  const conditionConfig = {
    new: { icon: Sparkles, label: t('condition.new'), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    used: { icon: ThumbsUp, label: t('condition.used'), color: 'text-amber-500', bg: 'bg-amber-500/10' },
    damaged: { icon: AlertTriangle, label: t('condition.damaged'), color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  const ConditionIcon = conditionConfig[condition].icon;

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

      {/* Wishlist Badge */}
      {isInWishlist && !isInCollection && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500 shadow-md">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Condition Badge */}
      {isInCollection && (
        <div className="absolute top-2 left-2 z-10">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm",
            conditionConfig[condition].bg,
            conditionConfig[condition].color
          )}>
            <ConditionIcon className="w-3 h-3" />
            {conditionConfig[condition].label}
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
      <div className="space-y-2 mb-3 min-h-[72px]">
        <h3 className="font-bold text-foreground text-base leading-snug min-h-[40px] line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {type && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
              {type}
            </span>
          )}
          {series && (
            <p className="text-xs text-muted-foreground line-clamp-1 truncate flex-1">
              {series}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isInCollection ? (
          <>
            <Button
              variant={isBoxed ? "success" : "glass"}
              size="sm"
              className="flex-1 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBoxed?.();
              }}
              title={isBoxed ? t('card.markAsUnboxed') : t('card.markAsBoxed')}
            >
              {isBoxed ? (
                <>
                  <Package className="w-4 h-4" />
                  <span className="text-xs">{t('card.boxed')}</span>
                </>
              ) : (
                <>
                  <PackageOpen className="w-4 h-4" />
                  <span className="text-xs">{t('card.unboxed')}</span>
                </>
              )}
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
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.();
              }}
            >
              <Plus className="w-4 h-4" />
              {t('card.add')}
            </Button>
            <Button
              variant={isInWishlist ? "default" : "ghost"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist?.();
              }}
              className={cn(
                isInWishlist 
                  ? "bg-pink-500 hover:bg-pink-600 text-white" 
                  : "text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10"
              )}
              title={isInWishlist ? t('card.removeFromWishlist') : t('card.addToWishlist')}
            >
              <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
