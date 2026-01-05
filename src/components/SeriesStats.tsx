import { useMemo, useState, useEffect } from 'react';
import { Gamepad2, ChevronDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const STORAGE_KEY = 'seriesStats_isOpen';

interface Amiibo {
  id: string;
  series: string | null;
}

interface UserAmiibo {
  amiibo_id: string;
}

interface SeriesStatsProps {
  amiibos: Amiibo[];
  userAmiibos: UserAmiibo[];
  selectedSeries?: string;
  showOnlyCollected?: boolean;
  onSeriesClick?: (series: string, showOnlyCollected: boolean) => void;
}

export function SeriesStats({ amiibos, userAmiibos, selectedSeries, showOnlyCollected, onSeriesClick }: SeriesStatsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isOpen));
  }, [isOpen]);
  
  const seriesStats = useMemo(() => {
    const collectedIds = new Set(userAmiibos.map(ua => ua.amiibo_id));
    
    // Group amiibos by series
    const seriesMap = new Map<string, { total: number; collected: number }>();
    
    amiibos.forEach(amiibo => {
      const series = amiibo.series || t('stats.noSeries');
      const current = seriesMap.get(series) || { total: 0, collected: 0 };
      current.total++;
      if (collectedIds.has(amiibo.id)) {
        current.collected++;
      }
      seriesMap.set(series, current);
    });
    
    // Convert to array and sort by total count (descending)
    return Array.from(seriesMap.entries())
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        collected: stats.collected,
        percentage: Math.round((stats.collected / stats.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [amiibos, userAmiibos, t]);

  if (seriesStats.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">{t('stats.collectionProgress')}</h2>
            </div>
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto p-1 -m-1 mt-3 sm:mt-4">
        {seriesStats.map((series) => {
          const isNoSeries = series.name === t('stats.noSeries');
          const isSelected = selectedSeries === series.name && showOnlyCollected;
          
          return (
            <div 
              key={series.name} 
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-primary/20 ring-2 ring-primary' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
              onClick={() => {
                if (isSelected) {
                  onSeriesClick?.('all', false);
                } else {
                  onSeriesClick?.(isNoSeries ? 'all' : series.name, true);
                }
              }}
              title={series.collected > 0 ? t('stats.filterCollected') : t('stats.noCollected')}
            >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="font-medium text-foreground text-xs sm:text-sm truncate flex-1 mr-2">
                {series.name}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                {series.collected}/{series.total}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Progress value={series.percentage} className="h-1.5 sm:h-2 flex-1" />
              <span className="text-[10px] sm:text-xs font-medium text-primary w-8 sm:w-10 text-right">
                {series.percentage}%
              </span>
            </div>
            </div>
          );
        })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
