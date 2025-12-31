import { Package, Trophy, Star, Box, Heart } from 'lucide-react';

interface CollectionStatsProps {
  total: number;
  collected: number;
  boxed: number;
  wishlistCount: number;
}

export function CollectionStats({ total, collected, boxed, wishlistCount }: CollectionStatsProps) {
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

  const stats = [
    {
      icon: Trophy,
      label: 'Colecionados',
      value: collected,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Star,
      label: 'Total Amiibos',
      value: total,
      color: 'text-secondary-foreground',
      bg: 'bg-secondary/30',
    },
    {
      icon: Box,
      label: 'Na Caixa',
      value: boxed,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      icon: Heart,
      label: 'Wishlist',
      value: wishlistCount,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },
    {
      icon: Package,
      label: 'Progresso',
      value: `${percentage}%`,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-card rounded-2xl p-4 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
