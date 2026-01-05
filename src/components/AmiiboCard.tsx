import { useState } from 'react';
import { Check, Plus, Package, PackageOpen, Trash2, Heart, Sparkles, ThumbsUp, AlertTriangle, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAmiiboImageUrl } from '@/lib/amiibo-images';
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
  const imageUrl = getAmiiboImageUrl(imagePath);
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
        "group relative glass-card rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 animate-scale-in",
        "hover:shadow-lg hover:-translate-y-1",
        isInCollection && "ring-2 ring-success/50"
      )}
    >
      {/* Collection Badge */}
      {isInCollection && (
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-10">
          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-success shadow-md">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success-foreground" />
          </div>
        </div>
      )}

      {/* Wishlist Badge */}
      {isInWishlist && !isInCollection && (
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-10">
          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-500 shadow-md">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
          </div>
        </div>
      )}
      {/* Image Container */}
      <div className="relative aspect-square rounded-lg sm:rounded-xl bg-gradient-to-b from-muted/50 to-muted overflow-hidden mb-2 sm:mb-3">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageOff className="w-10 h-10 sm:w-16 sm:h-16 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 min-h-[56px] sm:min-h-[72px]">
        <h3 className="font-bold text-foreground text-xs sm:text-base leading-snug line-clamp-2 text-center">
          {name}
        </h3>
        
        {/* Series - below name, centered */}
        {series && (
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 text-center">
            {series}
          </p>
        )}
        
        {/* Type and Condition badges */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center mt-1 sm:mt-3">
          {type && (
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
              {type}
            </span>
          )}
          {isInCollection && (
            <div className={cn(
              "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium",
              conditionConfig[condition].bg,
              conditionConfig[condition].color
            )}>
              <ConditionIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{conditionConfig[condition].label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 sm:gap-2">
        {isInCollection ? (
          <>
            <Button
              variant={isBoxed ? "success" : "glass"}
              size="sm"
              className="flex-1 gap-0.5 sm:gap-1 h-7 sm:h-9 px-2 sm:px-3"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBoxed?.();
              }}
              title={isBoxed ? t('card.markAsUnboxed') : t('card.markAsBoxed')}
            >
              {isBoxed ? (
                <>
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs hidden xs:inline">{t('card.boxed')}</span>
                </>
              ) : (
                <>
                  <PackageOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs hidden xs:inline">{t('card.unboxed')}</span>
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 sm:h-9 w-7 sm:w-9 p-0"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-7 sm:h-9 px-2 sm:px-3 gap-0.5 sm:gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.();
              }}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs">{t('card.add')}</span>
            </Button>
            <Button
              variant={isInWishlist ? "default" : "ghost"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist?.();
              }}
              className={cn(
                "h-7 sm:h-9 w-7 sm:w-9 p-0",
                isInWishlist 
                  ? "bg-pink-500 hover:bg-pink-600 text-white" 
                  : "text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10"
              )}
              title={isInWishlist ? t('card.removeFromWishlist') : t('card.addToWishlist')}
            >
              <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4", isInWishlist && "fill-current")} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
