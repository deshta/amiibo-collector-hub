import { useState, useEffect, useRef, TouchEvent, useCallback } from 'react';
import { Package, PackageOpen, Check, Plus, Trash2, Gamepad2, Heart, Sparkles, ThumbsUp, AlertTriangle, ImageOff, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getAmiiboImageUrl } from '@/lib/amiibo-images';
import { useLanguage } from '@/hooks/useLanguage';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
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
  valuePayed?: number | null;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleBoxed?: () => void;
  onToggleWishlist?: () => void;
  onConditionChange?: (condition: AmiiboCondition) => void;
  onValuePayedChange?: (value: number | null) => void;
  // Swipe navigation props
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  // Progress indicator
  currentIndex?: number;
  totalCount?: number;
}


export function AmiiboDetailModal({
  amiibo,
  isOpen,
  onClose,
  isInCollection = false,
  isBoxed = false,
  isInWishlist = false,
  condition = 'new',
  valuePayed,
  onAdd,
  onRemove,
  onToggleBoxed,
  onToggleWishlist,
  onConditionChange,
  onValuePayedChange,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  currentIndex = 0,
  totalCount = 0,
}: AmiiboDetailModalProps) {
  const { t, language } = useLanguage();
  const { lightTap, success } = useHapticFeedback();
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [localValueBRL, setLocalValueBRL] = useState<string>('');
  const [usdRate, setUsdRate] = useState<number>(5.0); // Default rate
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

  // Keyboard navigation for desktop
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || isMobile) return;
    
    if (e.key === 'ArrowLeft' && hasPrevious) {
      e.preventDefault();
      navigateWithAnimation('right', onPrevious);
    } else if (e.key === 'ArrowRight' && hasNext) {
      e.preventDefault();
      navigateWithAnimation('left', onNext);
    }
  }, [isOpen, isMobile, hasPrevious, hasNext, onPrevious, onNext]);

  useEffect(() => {
    if (isOpen && !isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isMobile, handleKeyDown]);

  // Reset image error and sync value when amiibo changes
  useEffect(() => {
    setImageError(false);
    setLocalValueBRL(valuePayed ? valuePayed.toString() : '');
  }, [amiibo?.id, valuePayed]);

  // Fetch USD exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
        const data = await response.json();
        if (data.rates?.USD) {
          setUsdRate(data.rates.USD);
        }
      } catch (error) {
        console.log('Using default USD rate');
      }
    };
    fetchRate();
  }, []);

  const handleValueChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setLocalValueBRL(sanitized);
  };

  const handleValueBlur = () => {
    const numValue = parseFloat(localValueBRL);
    if (!isNaN(numValue) && numValue >= 0) {
      onValuePayedChange?.(numValue);
    } else if (localValueBRL === '') {
      onValuePayedChange?.(null);
    }
  };

  const convertToUSD = (brl: number): string => {
    return (brl * usdRate).toFixed(2);
  };

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navigateWithAnimation = useCallback((direction: 'left' | 'right', callback?: () => void) => {
    setSlideDirection(direction);
    setIsTransitioning(true);
    lightTap();
    
    setTimeout(() => {
      callback?.();
      setSlideDirection(null);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  }, [lightTap]);

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe) {
      if (distance > 0 && hasNext) {
        // Swipe left -> next
        navigateWithAnimation('left', onNext);
      } else if (distance < 0 && hasPrevious) {
        // Swipe right -> previous
        navigateWithAnimation('right', onPrevious);
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
      className={cn(
        "flex flex-col items-center gap-4 transition-all duration-150 ease-out",
        isTransitioning && slideDirection === 'left' && "opacity-0 translate-x-[-20px]",
        isTransitioning && slideDirection === 'right' && "opacity-0 translate-x-[20px]"
      )}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >

      {/* Image - full size on desktop */}
      <div className="rounded-xl bg-gradient-to-b from-muted/50 to-muted p-4 relative">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={amiibo.name}
            loading="lazy"
            className={cn(
              "h-auto object-contain",
              isMobile ? "max-w-[200px]" : "w-auto max-h-[400px]"
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
          <ChevronLeft className={cn("w-5 h-5 cursor-pointer hover:text-foreground", !hasPrevious && "opacity-30 cursor-default")} onClick={() => hasPrevious && navigateWithAnimation('right', onPrevious)} />
          <span className="text-xs">{t('modal.swipeToNavigate')}</span>
          <ChevronRight className={cn("w-5 h-5 cursor-pointer hover:text-foreground", !hasNext && "opacity-30 cursor-default")} onClick={() => hasNext && navigateWithAnimation('left', onNext)} />
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
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
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
        <div className="grid grid-cols-2 text-sm text-center justify-items-center gap-x-4 gap-y-3 w-fit mx-auto pb-6">
          <div className="flex flex-row items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/jp.png" 
              alt="Japan" 
              className="w-6 h-auto rounded-sm"
            />
            <span className="text-muted-foreground">{formatDate(amiibo.release_jp)}</span>
          </div>
          <div className="flex flex-row items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/us.png" 
              alt="USA" 
              className="w-6 h-auto rounded-sm"
            />
            <span className="text-muted-foreground">{formatDate(amiibo.release_na)}</span>
          </div>
          <div className="flex flex-row items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/eu.png" 
              alt="Europe" 
              className="w-6 h-auto rounded-sm"
            />
            <span className="text-muted-foreground">{formatDate(amiibo.release_eu)}</span>
          </div>
          <div className="flex flex-row items-center gap-1">
            <img 
              src="https://flagcdn.com/w20/au.png" 
              alt="Australia" 
              className="w-6 h-auto rounded-sm"
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

        {/* Value Payed Input */}
        {isInCollection && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">{t('card.valuePayed')}:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={localValueBRL}
                  onChange={(e) => handleValueChange(e.target.value)}
                  onBlur={handleValueBlur}
                  placeholder="0.00"
                  className="w-full sm:w-[100px] h-8 text-xs pl-8 pr-2"
                />
              </div>
              {localValueBRL && !isNaN(parseFloat(localValueBRL)) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                  <span>=</span>
                  <span className="font-medium text-foreground">
                    ${convertToUSD(parseFloat(localValueBRL))}
                  </span>
                  <span>USD</span>
                </div>
              )}
            </div>
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

  // Desktop: Use Dialog with navigation arrows
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">{amiibo.name}</DialogTitle>
        </DialogHeader>
        <div className="py-2 relative">
          {/* Navigation arrows for desktop */}
          {(hasPrevious || hasNext) && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => hasPrevious && navigateWithAnimation('right', onPrevious)}
                disabled={!hasPrevious}
                className={cn(
                  "pointer-events-auto rounded-full h-10 w-10 -ml-14",
                  !hasPrevious && "opacity-30"
                )}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => hasNext && navigateWithAnimation('left', onNext)}
                disabled={!hasNext}
                className={cn(
                  "pointer-events-auto rounded-full h-10 w-10 -mr-14",
                  !hasNext && "opacity-30"
                )}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          )}
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
