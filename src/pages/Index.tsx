import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { AmiiboCard } from '@/components/AmiiboCard';
import { CollectionStats } from '@/components/CollectionStats';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react';

interface Amiibo {
  id: string;
  name: string;
  series: string;
  character_name: string;
  image_url: string | null;
}

interface UserAmiibo {
  id: string;
  amiibo_id: string;
  is_boxed: boolean;
}

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [userAmiibos, setUserAmiibos] = useState<UserAmiibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'collected' | 'missing'>('all');
  const [syncing, setSyncing] = useState(false);

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

  const syncAmiibos = async () => {
    setSyncing(true);
    try {
      const response = await fetch('https://www.amiiboapi.com/api/amiibo/');
      if (!response.ok) throw new Error('Falha ao buscar dados');
      
      const data = await response.json();
      const amiibosFromApi = data.amiibo as Array<{
        name: string;
        amiiboSeries: string;
        character: string;
        image: string;
        release: { jp: string | null; na: string | null; eu: string | null; au: string | null };
      }>;

      // Get unique amiibos by name + series
      const uniqueMap = new Map<string, typeof amiibosFromApi[0]>();
      amiibosFromApi.forEach(a => {
        const key = `${a.name}-${a.amiiboSeries}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, a);
        }
      });

      const uniqueAmiibos = Array.from(uniqueMap.values());
      
      // Transform data
      const newAmiibos = uniqueAmiibos.map(a => {
        const dates = [a.release.jp, a.release.na, a.release.eu, a.release.au].filter(Boolean).sort();
        return {
          name: a.name,
          series: a.amiiboSeries,
          character_name: a.character,
          image_url: a.image,
          release_date: dates.length > 0 ? dates[0] : null,
        };
      });

      // Insert new amiibos (upsert by checking existing)
      const existingNames = new Set(amiibos.map(a => `${a.name}-${a.series}`));
      const toInsert = newAmiibos.filter(a => !existingNames.has(`${a.name}-${a.series}`));

      if (toInsert.length > 0) {
        // Insert in batches
        const batchSize = 50;
        for (let i = 0; i < toInsert.length; i += batchSize) {
          const batch = toInsert.slice(i, i + batchSize);
          const { error } = await supabase.from('amiibos').insert(batch);
          if (error) throw error;
        }
      }

      toast({
        title: 'Catálogo sincronizado!',
        description: `${toInsert.length} novos amiibos adicionados. Total: ${uniqueAmiibos.length}`,
      });
      
      await fetchData();
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar o catálogo.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
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

  const filteredAmiibos = amiibos.filter(amiibo => {
    const matchesSearch = 
      amiibo.name.toLowerCase().includes(search.toLowerCase()) ||
      amiibo.series.toLowerCase().includes(search.toLowerCase()) ||
      amiibo.character_name.toLowerCase().includes(search.toLowerCase());
    
    const isInCollection = !!getUserAmiibo(amiibo.id);
    
    if (filter === 'collected') return matchesSearch && isInCollection;
    if (filter === 'missing') return matchesSearch && !isInCollection;
    return matchesSearch;
  });

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
          <Button
            variant="secondary"
            onClick={syncAmiibos}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Catálogo'}
          </Button>
        </div>

        {/* Stats */}
        <CollectionStats
          total={amiibos.length}
          collected={collectedCount}
          boxed={boxedCount}
        />

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar amiibos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 rounded-xl border-2 border-border focus:border-primary"
            />
          </div>
          
          <div className="flex gap-2">
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

        {/* Amiibo Grid */}
        {filteredAmiibos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAmiibos.map((amiibo, index) => {
              const userAmiibo = getUserAmiibo(amiibo.id);
              return (
                <div key={amiibo.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <AmiiboCard
                    id={amiibo.id}
                    name={amiibo.name}
                    series={amiibo.series}
                    characterName={amiibo.character_name}
                    imageUrl={amiibo.image_url}
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
      </main>
    </div>
  );
}
