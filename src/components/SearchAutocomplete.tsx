import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Amiibo {
  id: string;
  name: string;
  series: string | null;
  image_path: string | null;
}

interface SearchAutocompleteProps {
  amiibos: Amiibo[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (amiibo: Amiibo) => void;
  placeholder?: string;
  className?: string;
}

// Helper to get full image URL from storage path
const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `https://qlqxczezbpchjnkjwyrd.supabase.co/storage/v1/object/public/amiibo-images/${imagePath}`;
};

export function SearchAutocomplete({
  amiibos,
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const suggestions = useMemo(() => {
    if (!value.trim()) return [];
    const searchLower = value.toLowerCase();
    return amiibos
      .filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.series?.toLowerCase().includes(searchLower)
      )
      .slice(0, 8);
  }, [amiibos, value]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (amiibo: Amiibo) => {
    onChange(amiibo.name);
    setIsOpen(false);
    onSelect?.(amiibo);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative flex-1', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="pl-11 pr-10 h-12 rounded-xl border-2 border-border focus:border-primary"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto"
        >
          {suggestions.map((amiibo, index) => (
            <li
              key={amiibo.id}
              onClick={() => handleSelect(amiibo)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                highlightedIndex === index
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {amiibo.image_path && (
                <img
                  src={getImageUrl(amiibo.image_path) || ''}
                  alt={amiibo.name}
                  className="w-10 h-10 object-contain rounded-lg bg-muted/50"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{amiibo.name}</p>
                {amiibo.series && (
                  <p className="text-xs text-muted-foreground truncate">
                    {amiibo.series}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
