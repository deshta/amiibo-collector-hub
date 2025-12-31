import { Package, Calendar, X, Check, Plus, Trash2 } from 'lucide-react';
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
    series: string;
    character_name: string;
    image_url: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  isInCollection?: boolean;
  isBoxed?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleBoxed?: () => void;
}

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{amiibo.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6">
          {/* Image */}
          <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-b from-muted/50 to-muted overflow-hidden">
            {amiibo.image_url ? (
              <img
                src={amiibo.image_url}
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
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="text-sm">
                {amiibo.series}
              </Badge>
              {amiibo.character_name !== amiibo.name && (
                <Badge variant="outline" className="text-sm">
                  {amiibo.character_name}
                </Badge>
              )}
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
