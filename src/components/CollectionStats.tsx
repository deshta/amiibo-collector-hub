import { Package, Trophy, Star, Box, Heart, Wallet } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface CollectionStatsProps {
  total: number;
  collected: number;
  boxed: number;
  wishlistCount: number;
  totalInvested?: number;
  totalInvestedUSD?: number;
}

export function CollectionStats({ total, collected, boxed, wishlistCount, totalInvested = 0, totalInvestedUSD = 0 }: CollectionStatsProps) {
  const { t } = useLanguage();
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

  const formatCurrencyBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
    {
      icon: Trophy,
      label: t('stats.collected'),
      value: collected,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Star,
      label: t('stats.total'),
      value: total,
      color: "text-secondary-foreground",
      bg: "bg-secondary/30",
    },
    {
      icon: Box,
      label: t('stats.boxed'),
      value: boxed,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: Heart,
      label: t('stats.wishlist'),
      value: wishlistCount,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      icon: Package,
      label: t('stats.progress'),
      value: `${percentage}%`,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-card rounded-xl sm:rounded-2xl p-2 sm:p-4 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`inline-flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bg} mb-1 sm:mb-3`}>
            <stat.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.color}`} />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-foreground">{stat.value}</div>
          <div className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</div>
        </div>
      ))}
      {/* Invested card with USD subvalue */}
      <div
        className="glass-card rounded-xl sm:rounded-2xl p-2 sm:p-4 animate-slide-up"
        style={{ animationDelay: `${stats.length * 100}ms` }}
      >
        <div className="inline-flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 mb-1 sm:mb-3">
          <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-500" />
        </div>
        <div className="text-lg sm:text-2xl font-extrabold text-foreground">{formatCurrencyBRL(totalInvested)}</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground/70">≈ {formatCurrencyUSD(totalInvestedUSD)}</div>
        <div className="text-xs sm:text-sm text-muted-foreground truncate">{t('stats.invested')}</div>
      </div>
    </div>
  );
}
