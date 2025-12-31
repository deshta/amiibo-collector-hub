import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { AmiiboCard } from '@/components/AmiiboCard';
import { AmiiboDetailModal } from '@/components/AmiiboDetailModal';
import { CollectionStats } from '@/components/CollectionStats';
import { SeriesStats } from '@/components/SeriesStats';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

interface UserAmiibo {
  id: string;
  amiibo_id: string;
  is_boxed: boolean;
}

const ITEMS_PER_PAGE = 24;

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [userAmiibos, setUserAmiibos] = useState<UserAmiibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'collected' | 'missing'>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
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
      const [amiibosResult, collectionResult] = await Promise.all([
        supabase.from('amiibos').select('*').order('name'),
        supabase.from('user_amiibos').select('*'),
      ]);

      if (amiibosResult.error) throw amiibosResult.error;
      if (collectionResult.error) throw collectionResult.error;

      setAmiibos(amiibosResult.data || []);
      setUserAmiibos(collectionResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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

      setUserAmiibos([...userAmiibos, data]);
      toast({
        title: 'Adicionado!',
        description: 'Amiibo adicionado à sua coleção.',
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o amiibo.',
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
        title: 'Removido',
        description: 'Amiibo removido da sua coleção.',
      });
    } catch (error) {
      console.error('Error removing from collection:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o amiibo.',
        variant: 'destructive',
      });
    }
  };

  const toggleBoxed = async (amiiboId: string, currentValue: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_amiibos')
        .update({ is_boxed: !currentValue })
        .eq('user_id', user.id)
        .eq('amiibo_id', amiiboId);

      if (error) throw error;

      setUserAmiibos(userAmiibos.map(ua => 
        ua.amiibo_id === amiiboId ? { ...ua, is_boxed: !currentValue } : ua
      ));
    } catch (error) {
      console.error('Error updating boxed status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const getUserAmiibo = (amiiboId: string) => 
    userAmiibos.find(ua => ua.amiibo_id === amiiboId);

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

  const filteredAmiibos = useMemo(() => {
    return amiibos.filter(amiibo => {
      const matchesSearch = amiibo.name.toLowerCase().includes(search.toLowerCase());
      const matchesSeries = selectedSeries === 'all' || amiibo.series === selectedSeries;
      const matchesType = selectedType === 'all' || amiibo.type === selectedType;
      const isInCollection = !!getUserAmiibo(amiibo.id);
      
      if (filter === 'collected') return matchesSearch && matchesSeries && matchesType && isInCollection;
      if (filter === 'missing') return matchesSearch && matchesSeries && matchesType && !isInCollection;
      return matchesSearch && matchesSeries && matchesType;
    });
  }, [amiibos, search, selectedSeries, selectedType, filter, userAmiibos]);

  // Pagination
  const totalPages = Math.ceil(filteredAmiibos.length / ITEMS_PER_PAGE);
  const paginatedAmiibos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAmiibos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAmiibos, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSeries, selectedType, filter]);

  const collectedCount = userAmiibos.length;
  const boxedCount = userAmiibos.filter(ua => ua.is_boxed).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container py-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Minha Coleção
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus Amiibos Nintendo
            </p>
          </div>
        </div>

        {/* Stats */}
        <CollectionStats
          total={amiibos.length}
          collected={collectedCount}
          boxed={boxedCount}
        />

        {/* Series Stats */}
        <SeriesStats amiibos={amiibos} userAmiibos={userAmiibos} />

        {/* Search & Filter */}
        <div className="flex flex-col gap-4 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar amiibos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-xl border-2 border-border focus:border-primary"
              />
            </div>
            
            <Select value={selectedSeries} onValueChange={setSelectedSeries}>
              <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl border-2 border-border">
                <SelectValue placeholder="Filtrar por série" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as séries</SelectItem>
                {seriesList.map(series => (
                  <SelectItem key={series} value={series}>
                    {series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[150px] h-12 rounded-xl border-2 border-border">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {typesList.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'glass'}
              onClick={() => setFilter('all')}
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Todos</span>
            </Button>
            <Button
              variant={filter === 'collected' ? 'default' : 'glass'}
              onClick={() => setFilter('collected')}
            >
              Colecionados
            </Button>
            <Button
              variant={filter === 'missing' ? 'default' : 'glass'}
              onClick={() => setFilter('missing')}
            >
              Faltando
            </Button>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {paginatedAmiibos.length} de {filteredAmiibos.length} amiibos
          {selectedSeries !== 'all' && ` da série "${selectedSeries}"`}
        </div>

        {/* Amiibo Grid */}
        {paginatedAmiibos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                    onAdd={() => addToCollection(amiibo.id)}
                    onRemove={() => removeFromCollection(amiibo.id)}
                    onToggleBoxed={() => toggleBoxed(amiibo.id, userAmiibo?.is_boxed || false)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Nenhum amiibo encontrado.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="glass"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
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
                    className="w-10 h-10"
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
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
        onAdd={() => selectedAmiibo && addToCollection(selectedAmiibo.id)}
        onRemove={() => selectedAmiibo && removeFromCollection(selectedAmiibo.id)}
        onToggleBoxed={() => {
          if (selectedAmiibo) {
            const userAmiibo = getUserAmiibo(selectedAmiibo.id);
            toggleBoxed(selectedAmiibo.id, userAmiibo?.is_boxed || false);
          }
        }}
      />

      {/* Footer */}
      <footer className="py-6 mt-8 border-t border-border/50">
        <div className="container flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Feito com muito queijo</span>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Bandeira_de_Minas_Gerais.svg/45px-Bandeira_de_Minas_Gerais.svg.png" 
            alt="Bandeira de Minas Gerais" 
            className="h-4 w-auto rounded-sm"
          />
        </div>
      </footer>
    </div>
  );
}
