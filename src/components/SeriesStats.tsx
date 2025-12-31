import { useMemo } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';

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
}

export function SeriesStats({ amiibos, userAmiibos }: SeriesStatsProps) {
  const { t } = useLanguage();
  
  const seriesStats = useMemo(() => {
    const collectedIds = new Set(userAmiibos.map(ua => ua.amiibo_id));
    
    // Group amiibos by series
    const seriesMap = new Map<string, { total: number; collected: number }>();
    
    amiibos.forEach(amiibo => {
      const series = amiibo.series || 'Sem série';
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
  }, [amiibos, userAmiibos]);

  if (seriesStats.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <Gamepad2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{t('stats.collectionProgress')}</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
        {seriesStats.map((series) => (
          <div 
            key={series.name} 
            className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground text-sm truncate flex-1 mr-2">
                {series.name}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {series.collected}/{series.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={series.percentage} className="h-2 flex-1" />
              <span className="text-xs font-medium text-primary w-10 text-right">
                {series.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
