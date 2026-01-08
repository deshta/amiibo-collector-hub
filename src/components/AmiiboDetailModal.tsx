import { useState, useEffect } from 'react';
import { Package, PackageOpen, Check, Plus, Trash2, Gamepad2, Heart, Sparkles, ThumbsUp, AlertTriangle, ImageOff } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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

export type AmiiboCondition = 'new' | 'used' | 'damaged';

interface AmiiboDetailModalProps {
  amiibo: {
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
  } | null;
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
}: AmiiboDetailModalProps) {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  
  // Handle browser back button to close drawer
  useEffect(() => {
    if (isOpen) {
      // Push a new history state when drawer opens
      window.history.pushState({ drawerOpen: true }, '');
      
      const handlePopState = () => {
        onClose();
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  // When closing normally, go back in history if we pushed a state
  const handleClose = (open: boolean) => {
    if (!open) {
      // Check if we have our state in history
      if (window.history.state?.drawerOpen) {
        window.history.back();
      } else {
        onClose();
      }
    }
  };
  
  if (!amiibo) return null;

  const imageUrl = getAmiiboImageUrl(amiibo.image_path);

  // Format date for display based on language
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

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg font-bold text-center">{amiibo.name}</DrawerTitle>
        </DrawerHeader>
        
        <div className="flex flex-col items-center gap-4 px-4 pb-6 overflow-y-auto">
          {/* Image - Compact size */}
          <div className="rounded-xl bg-gradient-to-b from-muted/50 to-muted p-3">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={amiibo.name}
                loading="lazy"
                className="max-w-[140px] h-auto"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-32 h-32">
                <ImageOff className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </div>

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
                    onClick={onToggleBoxed}
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
                    onClick={onRemove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    className="flex-1 h-10"
                    onClick={onAdd}
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
                    onClick={onToggleWishlist}
                  >
                    <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
