import { useState } from 'react';
import { Check, Plus, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AmiiboCardProps {
  id: string;
  name: string;
  series: string;
  characterName: string;
  imageUrl: string | null;
  isInCollection?: boolean;
  isBoxed?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleBoxed?: () => void;
}

export function AmiiboCard({
  name,
  series,
  characterName,
  imageUrl,
  isInCollection = false,
  isBoxed = false,
  onAdd,
  onRemove,
  onToggleBoxed,
}: AmiiboCardProps) {
  const [imageError, setImageError] = useState(false);

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
        <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {series}
        </p>
        {characterName !== name && (
          <p className="text-xs text-muted-foreground/70 line-clamp-1">
            {characterName}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isInCollection ? (
          <>
            <Button
              variant={isBoxed ? "success" : "glass"}
              size="sm"
              className="flex-1"
              onClick={onToggleBoxed}
            >
              <Package className="w-4 h-4" />
              {isBoxed ? 'Na caixa' : 'Sem caixa'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
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
            onClick={onAdd}
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        )}
      </div>
    </div>
  );
}
