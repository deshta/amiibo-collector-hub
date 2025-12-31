import { Package, Calendar, Check, Plus, Trash2, Gamepad2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  } | null;
  isOpen: boolean;
  onClose: () => void;
  isInCollection?: boolean;
  isBoxed?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleBoxed?: () => void;
}

// Helper to get full image URL from storage path
const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `https://qlqxczezbpchjnkjwyrd.supabase.co/storage/v1/object/public/amiibo-images/${imagePath}`;
};

// Format date for display
const formatDate = (date: string | null): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

export function AmiiboDetailModal({
  amiibo,
  isOpen,
  onClose,
  isInCollection = false,
  isBoxed = false,
  onAdd,
  onRemove,
  onToggleBoxed,
}: AmiiboDetailModalProps) {
  if (!amiibo) return null;

  const imageUrl = getImageUrl(amiibo.image_path);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{amiibo.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6">
          {/* Image */}
          <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-b from-muted/50 to-muted overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={amiibo.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-20 h-20 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Collection Badge */}
            {isInCollection && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success shadow-md">
                  <Check className="w-4 h-4 text-success-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full space-y-4">
            {/* Series */}
            {amiibo.series && (
              <div className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary" />
                <span className="text-lg font-medium text-primary">{amiibo.series}</span>
              </div>
            )}

            {/* Release dates */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">JP:</span>
                <span>{formatDate(amiibo.release_jp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">NA:</span>
                <span>{formatDate(amiibo.release_na)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">EU:</span>
                <span>{formatDate(amiibo.release_eu)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">AU:</span>
                <span>{formatDate(amiibo.release_au)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {isInCollection && (
                <Badge variant={isBoxed ? "default" : "outline"} className="text-sm">
                  <Package className="w-3 h-3 mr-1" />
                  {isBoxed ? 'Na caixa' : 'Sem caixa'}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {isInCollection ? (
                <>
                  <Button
                    variant={isBoxed ? "success" : "secondary"}
                    className="flex-1"
                    onClick={onToggleBoxed}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    {isBoxed ? 'Na caixa' : 'Sem caixa'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onRemove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={onAdd}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar à Coleção
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
