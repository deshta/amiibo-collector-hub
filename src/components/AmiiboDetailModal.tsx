import { useState, useEffect, useRef, TouchEvent } from 'react';
import { Package, PackageOpen, Check, Plus, Trash2, Gamepad2, Heart, Sparkles, ThumbsUp, AlertTriangle, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getAmiiboImageUrl } from '@/lib/amiibo-images';
import { useLanguage } from '@/hooks/useLanguage';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ImageZoom } from '@/components/ImageZoom';
import { useIsMobile } from '@/hooks/use-mobile';

export type AmiiboCondition = 'new' | 'used' | 'damaged';

interface Amiibo {
  id: string;
  name: string;
  amiibo_hex_id: string | null;
  image_path: string | null;
  release_au: string | null;
  release_na: string | null;
  release_eu: string | null;
  release_jp: string | null;
  series: string | null;
  type: string | null;
}

interface AmiiboDetailModalProps {
  amiibo: Amiibo | null;
  isOpen: boolean;
  onClose: () => void;
  isInCollection?: boolean;
  isBoxed?: boolean;
  isInWishlist?: boolean;
  condition?: AmiiboCondition;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleBoxed?: () => void;
  onToggleWishlist?: () => void;
  onConditionChange?: (condition: AmiiboCondition) => void;
  // Swipe navigation props
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}


export function AmiiboDetailModal({
  amiibo,
  isOpen,
  onClose,
  isInCollection = false,
  isBoxed = false,
  isInWishlist = false,
  condition = 'new',
  onAdd,
  onRemove,
  onToggleBoxed,
  onToggleWishlist,
  onConditionChange,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: AmiiboDetailModalProps) {
  const { t, language } = useLanguage();
  const { lightTap, success } = useHapticFeedback();
  const [imageError, setImageError] = useState(false);
  const isMobile = useIsMobile();
  
  // Swipe detection
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;
  
  // Handle browser back button to close drawer (mobile only)
  useEffect(() => {
    if (isOpen && isMobile) {
      window.history.pushState({ drawerOpen: true }, '');
      
      const handlePopState = () => {
        onClose();
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, isMobile]);

  // Reset image error when amiibo changes
  useEffect(() => {
    setImageError(false);
  }, [amiibo?.id]);

  const handleClose = (open: boolean) => {
    if (!open) {
      if (isMobile && window.history.state?.drawerOpen) {
        window.history.back();
      } else {
        onClose();
      }
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe) {
      if (distance > 0 && hasNext) {
        // Swipe left -> next
        lightTap();
        onNext?.();
      } else if (distance < 0 && hasPrevious) {
        // Swipe right -> previous
        lightTap();
        onPrevious?.();
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };
  
  if (!amiibo) return null;

  const imageUrl = getAmiiboImageUrl(amiibo.image_path);

  const formatDate = (date: string | null): string => {
    if (!date) return '-';
    const localeMap = { pt: 'pt-BR', es: 'es-ES', en: 'en-US' };
    return new Date(date).toLocaleDateString(localeMap[language]);
  };

  const conditionConfig = {
    new: { icon: Sparkles, label: t('condition.new'), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    used: { icon: ThumbsUp, label: t('condition.used'), color: 'text-amber-500', bg: 'bg-amber-500/10' },
    damaged: { icon: AlertTriangle, label: t('condition.damaged'), color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  const content = (
    <div 
      className="flex flex-col items-center gap-4"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Image - Zoomable */}
      <div className="rounded-xl bg-gradient-to-b from-muted/50 to-muted p-4 relative">
        {imageUrl && !imageError ? (
          <ImageZoom
            src={imageUrl}
            alt={amiibo.name}
            className={cn(
              "h-auto",
              isMobile ? "max-w-[200px]" : "max-w-[180px]"
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-40 h-40">
            <ImageOff className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Swipe indicator for mobile */}
      {isMobile && (hasPrevious || hasNext) && (
        <div className="flex items-center justify-center gap-4 text-muted-foreground">
          <ChevronLeft className={cn("w-5 h-5", !hasPrevious && "opacity-30")} />
          <span className="text-xs">{t('modal.swipeToNavigate')}</span>
          <ChevronRight className={cn("w-5 h-5", !hasNext && "opacity-30")} />
        </div>
      )}

      {/* Status Badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {isInCollection && (
          <Badge variant="default" className="text-xs bg-success text-success-foreground">
            <Check className="w-3 h-3 mr-1" />
            {t('card.inCollection')}
          </Badge>
        )}
        {isInWishlist && !isInCollection && (
          <Badge variant="default" className="text-xs bg-pink-500 text-white">
            <Heart className="w-3 h-3 mr-1 fill-current" />
            {t('card.inWishlist')}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="w-full space-y-3">
        {/* Series & Type */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {amiibo.type && (
            <Badge variant="secondary" className="text-xs">
              {amiibo.type}
            </Badge>
          )}
          {amiibo.series && (
            <div className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3 text-primary" />
              <span className="text-sm font-medium text-primary">{amiibo.series}</span>
            </div>
          )}
        </div>

        {/* Release dates - Compact */}
        <div className="grid grid-cols-4 gap-2 text-xs text-center">
          <div className="flex flex-col items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/jp.png" 
              alt="Japan" 
              className="w-4 h-auto rounded-sm"
            />
            <span className="text-muted-foreground">{formatDate(amiibo.release_jp)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/us.png" 
              alt="USA" 
              className="w-4 h-auto rounded-sm"
            />
            <span className="text-muted-foreground">{formatDate(amiibo.release_na)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/eu.png" 
              alt="Europe" 
              className="w-4 h-auto rounded-sm"
            />
            <span className="text-muted-foreground">{formatDate(amiibo.release_eu)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/au.png" 
              alt="Australia" 
              className="w-4 h-auto rounded-sm"
            />
            <span className="text-muted-foreground">{formatDate(amiibo.release_au)}</span>
          </div>
        </div>

        {isInCollection && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge 
              variant={isBoxed ? "default" : "outline"} 
              className={cn(
                "text-xs",
                isBoxed ? "bg-success text-success-foreground" : ""
              )}
            >
              {isBoxed ? (
                <>
                  <Package className="w-3 h-3 mr-1" />
                  {t('card.boxed')}
                </>
              ) : (
                <>
                  <PackageOpen className="w-3 h-3 mr-1" />
                  {t('card.unboxed')}
                </>
              )}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                conditionConfig[condition].color,
                conditionConfig[condition].bg
              )}
            >
              {(() => {
                const CondIcon = conditionConfig[condition].icon;
                return <CondIcon className="w-3 h-3 mr-1" />;
              })()}
              {conditionConfig[condition].label}
            </Badge>
          </div>
        )}

        {/* Condition Selector */}
        {isInCollection && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">{t('card.condition')}:</span>
            <Select value={condition} onValueChange={(value) => onConditionChange?.(value as AmiiboCondition)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    {t('condition.new')}
                  </div>
                </SelectItem>
                <SelectItem value="used">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-3 h-3 text-amber-500" />
                    {t('condition.used')}
                  </div>
                </SelectItem>
                <SelectItem value="damaged">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    {t('condition.damaged')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isInCollection ? (
            <>
              <Button
                variant={isBoxed ? "success" : "secondary"}
                className="flex-1 h-10"
                onClick={() => {
                  lightTap();
                  onToggleBoxed?.();
                }}
                title={isBoxed ? t('card.markAsUnboxed') : t('card.markAsBoxed')}
              >
                {isBoxed ? (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    {t('card.boxed')}
                  </>
                ) : (
                  <>
                    <PackageOpen className="w-4 h-4 mr-2" />
                    {t('card.markAsBoxed')}
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                className="h-10"
                onClick={() => {
                  lightTap();
                  onRemove?.();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                className="flex-1 h-10"
                onClick={() => {
                  success();
                  onAdd?.();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('card.addToCollection')}
              </Button>
              <Button
                variant={isInWishlist ? "default" : "outline"}
                className={cn(
                  "h-10",
                  isInWishlist 
                    ? "bg-pink-500 hover:bg-pink-600 text-white" 
                    : "hover:text-pink-500 hover:border-pink-500"
                )}
                onClick={() => {
                  lightTap();
                  onToggleWishlist?.();
                }}
              >
                <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg font-bold text-center">{amiibo.name}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">{amiibo.name}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
