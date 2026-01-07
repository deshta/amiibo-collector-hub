import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

interface ShareCollectionButtonProps {
  userId: string;
}

export function ShareCollectionButton({ userId }: ShareCollectionButtonProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = `${window.location.origin}/collection/${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('share.copied'),
        description: t('share.copiedDescription'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: t('toast.error'),
        description: t('share.copyError'),
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share.shareTitle'),
          text: t('share.shareText'),
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={(e) => {
            if (navigator.share) {
              e.preventDefault();
              handleShare();
            }
          }}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">{t('share.shareCollection')}</span>
          <span className="sm:hidden">{t('share.share')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('share.shareCollection')}</DialogTitle>
          <DialogDescription>
            {t('share.shareDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="font-mono text-sm"
            />
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
