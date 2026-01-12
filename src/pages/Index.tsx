import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { AmiiboCard } from '@/components/AmiiboCard';
import { AmiiboDetailModal } from '@/components/AmiiboDetailModal';
import { CollectionStats } from '@/components/CollectionStats';
import { SeriesStats } from '@/components/SeriesStats';
import { Footer } from '@/components/Footer';
import { ShareCollectionButton } from '@/components/ShareCollectionButton';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Filter, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, Heart, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STORAGE_KEY = 'index_amiibos_filters';

const defaultFilters: Filters = {
  selectedType: '',
  selectedSeries: '',
  selectedCharacter: '',
};

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
  character: string | null;
}

interface Filters {
  selectedType: string;
  selectedSeries: string;
  selectedCharacter: string;
}

export type AmiiboCondition = 'new' | 'used' | 'damaged';

interface UserAmiibo {
  id: string;
  amiibo_id: string;
  is_boxed: boolean;
  condition: AmiiboCondition;
  value_payed: number | null;
}

interface WishlistItem {
  id: string;
  amiibo_id: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;
type ItemsPerPage = typeof ITEMS_PER_PAGE_OPTIONS[number];

const getItemsPerPageFromCookie = (): ItemsPerPage => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('itemsPerPage='));
  if (cookie) {
    const value = parseInt(cookie.split('=')[1], 10) as ItemsPerPage;
    if (ITEMS_PER_PAGE_OPTIONS.includes(value)) {
      return value;
    }
  }
  return 20;
};

const setItemsPerPageCookie = (value: ItemsPerPage) => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `itemsPerPage=${value}; expires=${expires.toUTCString()}; path=/`;
};

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load filters from localStorage
  const [filters, setFilters] = useState<Filters>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultFilters;
  });
  
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [userAmiibos, setUserAmiibos] = useState<UserAmiibo[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'collected' | 'missing' | 'wishlist'>('all');
  const [filterFromStats, setFilterFromStats] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<string>(filters.selectedSeries || 'all');
  const [selectedType, setSelectedType] = useState<string>(filters.selectedType || 'all');
  const [selectedCharacter, setSelectedCharacter] = useState<string>(filters.selectedCharacter || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'release_na' | 'release_jp' | 'release_eu' | 'release_au'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(() => getItemsPerPageFromCookie());
  const [selectedAmiibo, setSelectedAmiibo] = useState<Amiibo | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [amiibosResult, collectionResult, wishlistResult] = await Promise.all([
        supabase.from('amiibos').select('*').order('name'),
        supabase.from('user_amiibos').select('*').eq('user_id', user.id),
        supabase.from('user_wishlist').select('*').eq('user_id', user.id),
      ]);

      if (amiibosResult.error) throw amiibosResult.error;
      if (collectionResult.error) throw collectionResult.error;
      if (wishlistResult.error) throw wishlistResult.error;

      setAmiibos(amiibosResult.data || []);
      setUserAmiibos((collectionResult.data || []).map(item => ({
        ...item,
        condition: (item.condition || 'new') as AmiiboCondition,
        value_payed: item.value_payed ?? null
      })));
      setWishlist(wishlistResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

    // Save filters to localStorage
    useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }, [filters]);
  
    const updateFilter = (key: keyof Filters, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    };
  
    const clearFilters = () => {
      setFilters(defaultFilters);
      localStorage.removeItem(STORAGE_KEY);
      setCurrentPage(1);
    };

  const addToCollection = async (amiiboId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_amiibos')
        .insert({ user_id: user.id, amiibo_id: amiiboId })
        .select()
        .single();

      if (error) throw error;

      setUserAmiibos([...userAmiibos, {
        ...data,
        condition: (data.condition || 'new') as AmiiboCondition
      }]);
      
      // Remove from wishlist if it was there
      if (wishlist.some(w => w.amiibo_id === amiiboId)) {
        await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('amiibo_id', amiiboId);
        
        setWishlist(wishlist.filter(w => w.amiibo_id !== amiiboId));
      }
      
      toast({
        title: t('toast.added'),
        description: t('toast.addedToCollection'),
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.addError'),
        variant: 'destructive',
      });
    }
  };

  const removeFromCollection = async (amiiboId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_amiibos')
        .delete()
        .eq('user_id', user.id)
        .eq('amiibo_id', amiiboId);

      if (error) throw error;

      setUserAmiibos(userAmiibos.filter(ua => ua.amiibo_id !== amiiboId));
      toast({
        title: t('toast.removed'),
        description: t('toast.removedFromCollection'),
      });
    } catch (error) {
      console.error('Error removing from collection:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.removeError'),
        variant: 'destructive',
      });
    }
  };

  const toggleBoxed = async (amiiboId: string, currentValue: boolean) => {
    if (!user) return;

    const newIsBoxed = !currentValue;
    // If marking as boxed, also set condition to 'new'
    const updateData = newIsBoxed 
      ? { is_boxed: true, condition: 'new' }
      : { is_boxed: false };

    try {
      const { error } = await supabase
        .from('user_amiibos')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('amiibo_id', amiiboId);

      if (error) throw error;

      setUserAmiibos(userAmiibos.map(ua => 
        ua.amiibo_id === amiiboId 
          ? { ...ua, is_boxed: newIsBoxed, ...(newIsBoxed ? { condition: 'new' as const } : {}) } 
          : ua
      ));

      if (newIsBoxed) {
        toast({
          title: t('toast.updated'),
          description: t('toast.boxedConditionChanged'),
        });
      }
    } catch (error) {
      console.error('Error updating boxed status:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.updateError'),
        variant: 'destructive',
      });
    }
  };

  const updateCondition = async (amiiboId: string, condition: AmiiboCondition) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_amiibos')
        .update({ condition })
        .eq('user_id', user.id)
        .eq('amiibo_id', amiiboId);

      if (error) throw error;

      setUserAmiibos(userAmiibos.map(ua => 
        ua.amiibo_id === amiiboId ? { ...ua, condition } : ua
      ));
      
      const conditionLabels = { 
        new: t('condition.new'), 
        used: t('condition.used'), 
        damaged: t('condition.damaged') 
      };
      toast({
        title: t('toast.updated'),
        description: `${t('toast.conditionChanged')} "${conditionLabels[condition]}".`,
      });
    } catch (error) {
      console.error('Error updating condition:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.conditionError'),
        variant: 'destructive',
      });
    }
  };

  const updateValuePayed = async (amiiboId: string, value: number | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_amiibos')
        .update({ value_payed: value })
        .eq('user_id', user.id)
        .eq('amiibo_id', amiiboId);

      if (error) throw error;

      setUserAmiibos(userAmiibos.map(ua => 
        ua.amiibo_id === amiiboId ? { ...ua, value_payed: value } : ua
      ));
      
      toast({
        title: t('toast.updated'),
        description: t('card.valueUpdated'),
      });
    } catch (error) {
      console.error('Error updating value payed:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.updateError'),
        variant: 'destructive',
      });
    }
  };

  const toggleWishlist = async (amiiboId: string) => {
    if (!user) return;

    const isInWishlist = wishlist.some(w => w.amiibo_id === amiiboId);

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('amiibo_id', amiiboId);

        if (error) throw error;

        setWishlist(wishlist.filter(w => w.amiibo_id !== amiiboId));
        toast({
          title: t('toast.removed'),
          description: t('toast.removedFromWishlist'),
        });
      } else {
        const { data, error } = await supabase
          .from('user_wishlist')
          .insert({ user_id: user.id, amiibo_id: amiiboId })
          .select()
          .single();

        if (error) throw error;

        setWishlist([...wishlist, data]);
        toast({
          title: t('toast.added'),
          description: t('toast.addedToWishlist'),
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.wishlistError'),
        variant: 'destructive',
      });
    }
  };

  const getUserAmiibo = (amiiboId: string) => 
    userAmiibos.find(ua => ua.amiibo_id === amiiboId);

  const isInWishlist = (amiiboId: string) => 
    wishlist.some(w => w.amiibo_id === amiiboId);

  // Get unique series for filter
  const seriesList = useMemo(() => {
    const uniqueSeries = [...new Set(amiibos.map(a => a.series).filter(Boolean))] as string[];
    return uniqueSeries.sort();
  }, [amiibos]);

  // Get unique types for filter
  const typesList = useMemo(() => {
    const uniqueTypes = [...new Set(amiibos.map(a => a.type).filter(Boolean))] as string[];
    return uniqueTypes.sort();
  }, [amiibos]);

  // Get unique characters for filter
  const charactersList = useMemo(() => {
    const uniqueCharacters = [...new Set(amiibos.map(a => a.character).filter(Boolean))] as string[];
    return uniqueCharacters.sort();
  }, [amiibos]);

  const filteredAmiibos = useMemo(() => {
    const filtered = amiibos.filter(amiibo => {
      const searchLower = search.toLowerCase();
      const matchesSearch = amiibo.name.toLowerCase().includes(searchLower) || 
                           (amiibo.series?.toLowerCase().includes(searchLower) ?? false);
      const matchesSeries = selectedSeries === 'all' || amiibo.series === selectedSeries;
      const matchesType = selectedType === 'all' || amiibo.type === selectedType;
      const matchesCharacter = selectedCharacter === 'all' || amiibo.character === selectedCharacter;
      const isInCollection = !!getUserAmiibo(amiibo.id);
      const inWishlist = isInWishlist(amiibo.id);
      
      if (filter === 'collected') return matchesSearch && matchesSeries && matchesType && matchesCharacter && isInCollection;
      if (filter === 'missing') return matchesSearch && matchesSeries && matchesType && matchesCharacter && !isInCollection;
      if (filter === 'wishlist') return matchesSearch && matchesSeries && matchesType && matchesCharacter && inWishlist;
      return matchesSearch && matchesSeries && matchesType && matchesCharacter;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        const dateA = a[sortBy] ? new Date(a[sortBy]!).getTime() : 0;
        const dateB = b[sortBy] ? new Date(b[sortBy]!).getTime() : 0;
        comparison = dateA - dateB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [amiibos, search, selectedSeries, selectedType, selectedCharacter, filter, userAmiibos, wishlist, sortBy, sortOrder]);

  const handleItemsPerPageChange = (value: string) => {
    const newValue = parseInt(value, 10) as ItemsPerPage;
    setItemsPerPage(newValue);
    setItemsPerPageCookie(newValue);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredAmiibos.length / itemsPerPage);
  const paginatedAmiibos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAmiibos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAmiibos, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSeries, selectedType, selectedCharacter, filter, sortBy, sortOrder]);

  // Check if any filters are active and count them
  const activeFiltersCount = [
    search !== '',
    selectedSeries !== 'all',
    selectedType !== 'all',
    selectedCharacter !== 'all',
    filter !== 'all'
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFiltersCount > 0;

  const clearAllFilters = () => {
    setSearch('');
    setSelectedSeries('all');
    setSelectedType('all');
    setSelectedCharacter('all');
    setFilter('all');
    clearFilters();
  };

  const collectedCount = userAmiibos.length;
  const boxedCount = userAmiibos.filter(ua => ua.is_boxed).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">{t('index.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSeriesChange = (value) => {
    setSelectedSeries(value);
    updateFilter('selectedSeries', value);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    updateFilter('selectedType', value);
  };

  const handleCharacterChange = (value) => {
    setSelectedCharacter(value);
    updateFilter('selectedCharacter', value);
  };


  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container py-4 sm:py-8 px-3 sm:px-4">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 animate-slide-up">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-1 sm:mb-2">
              {t('index.myCollection')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('index.manageAmiibos')}
            </p>
          </div>
          <ShareCollectionButton userId={user.id} />
        </div>

        {/* Stats */}
        <CollectionStats
          total={amiibos.length}
          collected={collectedCount}
          boxed={boxedCount}
          wishlistCount={wishlist.length}
        />

        {/* Series Stats */}
        <SeriesStats 
          amiibos={amiibos} 
          userAmiibos={userAmiibos} 
          selectedSeries={selectedSeries}
          showOnlyCollected={filterFromStats}
          onSeriesClick={(series, showOnlyCollected) => {
            setSelectedSeries(series);
            setFilterFromStats(showOnlyCollected);
            if (showOnlyCollected) {
              setFilter('collected');
            } else {
              setFilter('all');
            }
            if (series !== 'all' || showOnlyCollected) {
              setTimeout(() => {
                document.getElementById('amiibo-grid')?.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              }, 100);
            }
          }}
        />

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col gap-2 sm:gap-4">
            <SearchAutocomplete
              amiibos={amiibos}
              value={search}
              onChange={setSearch}
              onSelect={(amiibo) => setSelectedAmiibo(amiibo as any)}
              placeholder={t('index.searchPlaceholder')}
            />
            
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4">
              <div className="relative">
                <Select value={selectedSeries} onValueChange={handleSeriesChange}>
                  <SelectTrigger className="w-full sm:w-[230px] h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border text-xs sm:text-sm pr-8">
                    <SelectValue placeholder={t('index.filterBySeries')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('index.allSeries')}</SelectItem>
                    {seriesList.map(series => (
                      <SelectItem key={series} value={series}>
                        {series}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSeries !== 'all' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSeries('all');
                      updateFilter('selectedSeries', 'all');
                    }}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>

              <div className="relative">
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border text-xs sm:text-sm pr-8">
                    <SelectValue placeholder={t('index.filterByType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('index.allTypes')}</SelectItem>
                    {typesList.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType !== 'all' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType('all');
                      updateFilter('selectedType', 'all');
                    }}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>

              <div className="relative">
                <Select value={selectedCharacter} onValueChange={handleCharacterChange}>
                  <SelectTrigger className="w-full sm:w-[230px] h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border text-xs sm:text-sm pr-8">
                    <SelectValue placeholder={t('index.filterByCharacter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('index.allCharacters')}</SelectItem>
                    {charactersList.map(character => (
                      <SelectItem key={character} value={character}>
                        {character}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCharacter !== 'all' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCharacter('all');
                      updateFilter('selectedCharacter', 'all');
                    }}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: 'name' | 'release_na' | 'release_jp' | 'release_eu' | 'release_au') => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border text-xs sm:text-sm">
                    <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <SelectValue placeholder={t('index.sortByName')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t('index.sortByName')}</SelectItem>
                    <SelectItem value="release_na">{t('index.sortByDateNA')}</SelectItem>
                    <SelectItem value="release_jp">{t('index.sortByDateJP')}</SelectItem>
                    <SelectItem value="release_eu">{t('index.sortByDateEU')}</SelectItem>
                    <SelectItem value="release_au">{t('index.sortByDateAU')}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="glass"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl border-2 border-border shrink-0"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? t('index.ascending') : t('index.descending')}
                >
                  <ArrowUpDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            <Button
              variant={filter === 'all' ? 'default' : 'glass'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('index.all')}</span>
            </Button>
            <Button
              variant={filter === 'collected' ? 'default' : 'glass'}
              size="sm"
              onClick={() => setFilter('collected')}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              {t('index.collected')}
            </Button>
            <Button
              variant={filter === 'missing' ? 'default' : 'glass'}
              size="sm"
              onClick={() => setFilter('missing')}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              {t('index.missing')}
            </Button>
            <Button
              variant={filter === 'wishlist' ? 'default' : 'glass'}
              size="sm"
              onClick={() => setFilter('wishlist')}
              className={cn("h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm", filter === 'wishlist' ? '' : 'hover:text-pink-500')}
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('index.wishlist')}</span>
              {wishlist.length > 0 && (
                <span className="ml-1 text-[10px] sm:text-xs bg-pink-500/20 text-pink-500 px-1 sm:px-1.5 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-destructive gap-0.5 sm:gap-1 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('index.clearFilters')}</span>
                <span className="ml-1 text-[10px] sm:text-xs bg-primary/20 text-primary px-1 sm:px-1.5 py-0.5 rounded-full font-medium">
                  {activeFiltersCount}
                </span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Results count */}
        <div id="amiibo-grid" className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground scroll-mt-4">
          {t('index.showing')} {paginatedAmiibos.length} {t('index.of')} {filteredAmiibos.length} {t('index.amiibos')}
          {selectedSeries !== 'all' && ` ${t('index.fromSeries')} "${selectedSeries}"`}
        </div>

        {/* Amiibo Grid */}
        {paginatedAmiibos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-5">
            {paginatedAmiibos.map((amiibo, index) => {
              const userAmiibo = getUserAmiibo(amiibo.id);
              return (
                <div 
                  key={amiibo.id} 
                  className="animate-fade-in cursor-pointer" 
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => setSelectedAmiibo(amiibo)}
                >
                <AmiiboCard
                    id={amiibo.id}
                    name={amiibo.name}
                    imagePath={amiibo.image_path}
                    series={amiibo.series}
                    type={amiibo.type}
                    isInCollection={!!userAmiibo}
                    isBoxed={userAmiibo?.is_boxed || false}
                    isInWishlist={isInWishlist(amiibo.id)}
                    condition={userAmiibo?.condition || 'new'}
                    onAdd={() => addToCollection(amiibo.id)}
                    onRemove={() => removeFromCollection(amiibo.id)}
                    onToggleBoxed={() => toggleBoxed(amiibo.id, userAmiibo?.is_boxed || false)}
                    onToggleWishlist={() => toggleWishlist(amiibo.id)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground text-base sm:text-lg">
              {t('index.noResults')}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm mt-2">
              {t('index.tryDifferent')}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[80px] sm:w-[100px] h-8 sm:h-10 rounded-lg sm:rounded-xl border-2 border-border text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs sm:text-sm text-muted-foreground">{t('index.itemsPerPage')}</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'glass'}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AmiiboDetailModal
        amiibo={selectedAmiibo}
        isOpen={!!selectedAmiibo}
        onClose={() => setSelectedAmiibo(null)}
        isInCollection={selectedAmiibo ? !!getUserAmiibo(selectedAmiibo.id) : false}
        isBoxed={selectedAmiibo ? getUserAmiibo(selectedAmiibo.id)?.is_boxed || false : false}
        isInWishlist={selectedAmiibo ? isInWishlist(selectedAmiibo.id) : false}
        condition={selectedAmiibo ? getUserAmiibo(selectedAmiibo.id)?.condition || 'new' : 'new'}
        valuePayed={selectedAmiibo ? getUserAmiibo(selectedAmiibo.id)?.value_payed ?? null : null}
        onAdd={() => selectedAmiibo && addToCollection(selectedAmiibo.id)}
        onRemove={() => selectedAmiibo && removeFromCollection(selectedAmiibo.id)}
        onToggleBoxed={() => {
          if (selectedAmiibo) {
            const userAmiibo = getUserAmiibo(selectedAmiibo.id);
            toggleBoxed(selectedAmiibo.id, userAmiibo?.is_boxed || false);
          }
        }}
        onToggleWishlist={() => selectedAmiibo && toggleWishlist(selectedAmiibo.id)}
        onConditionChange={(condition) => selectedAmiibo && updateCondition(selectedAmiibo.id, condition)}
        onValuePayedChange={(value) => selectedAmiibo && updateValuePayed(selectedAmiibo.id, value)}
        hasPrevious={selectedAmiibo ? paginatedAmiibos.findIndex(a => a.id === selectedAmiibo.id) > 0 : false}
        hasNext={selectedAmiibo ? paginatedAmiibos.findIndex(a => a.id === selectedAmiibo.id) < paginatedAmiibos.length - 1 : false}
        currentIndex={selectedAmiibo ? paginatedAmiibos.findIndex(a => a.id === selectedAmiibo.id) : 0}
        totalCount={paginatedAmiibos.length}
        onPrevious={() => {
          if (selectedAmiibo) {
            const currentIndex = paginatedAmiibos.findIndex(a => a.id === selectedAmiibo.id);
            if (currentIndex > 0) {
              setSelectedAmiibo(paginatedAmiibos[currentIndex - 1]);
            }
          }
        }}
        onNext={() => {
          if (selectedAmiibo) {
            const currentIndex = paginatedAmiibos.findIndex(a => a.id === selectedAmiibo.id);
            if (currentIndex < paginatedAmiibos.length - 1) {
              setSelectedAmiibo(paginatedAmiibos[currentIndex + 1]);
            }
          }
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
