import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { AmiiboCard } from '@/components/AmiiboCard';
import { CollectionStats } from '@/components/CollectionStats';
import { SeriesStats } from '@/components/SeriesStats';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Gamepad2, Loader2, ArrowLeft, Package, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface UserAmiibo {
  id: string;
  amiibo_id: string;
  is_boxed: boolean;
  condition: 'new' | 'used' | 'damaged';
}

interface WishlistItem {
  id: string;
  amiibo_id: string;
}

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

export default function PublicCollection() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useLanguage();
  
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [userAmiibos, setUserAmiibos] = useState<UserAmiibo[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'collection' | 'wishlist'>('collection');

  useEffect(() => {
    if (userId) {
      fetchPublicData();
    }
  }, [userId]);

  const fetchPublicData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

      if (profileError) {
        setError(t('publicCollection.userNotFound'));
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch all data in parallel
      const [amiibosResult, collectionResult, wishlistResult] = await Promise.all([
        supabase.from('amiibos').select('*').order('name'),
        supabase.from('user_amiibos').select('*').eq('user_id', userId),
        supabase.from('user_wishlist').select('*').eq('user_id', userId),
      ]);

      if (amiibosResult.error) throw amiibosResult.error;
      if (collectionResult.error) throw collectionResult.error;
      if (wishlistResult.error) throw wishlistResult.error;

      setAmiibos(amiibosResult.data || []);
      setUserAmiibos((collectionResult.data || []).map(item => ({
        ...item,
        condition: (item.condition || 'new') as 'new' | 'used' | 'damaged'
      })));
      setWishlist(wishlistResult.data || []);
    } catch (err) {
      console.error('Error fetching public data:', err);
      setError(t('publicCollection.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const collectedAmiibos = useMemo(() => {
    return amiibos.filter(a => userAmiibos.some(ua => ua.amiibo_id === a.id));
  }, [amiibos, userAmiibos]);

  const wishlistAmiibos = useMemo(() => {
    return amiibos.filter(a => wishlist.some(w => w.amiibo_id === a.id));
  }, [amiibos, wishlist]);

  const getUserAmiibo = (amiiboId: string) => 
    userAmiibos.find(ua => ua.amiibo_id === amiiboId);

  const boxedCount = userAmiibos.filter(ua => ua.is_boxed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">{t('index.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <Gamepad2 className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">{error}</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicCollection.backHome')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile?.username || t('publicCollection.collector');

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-nintendo shadow-md transition-transform group-hover:scale-105">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-base sm:text-xl text-foreground">
              Amiibo Tracker
            </span>
          </Link>
        </div>
      </header>

      <main className="container py-4 sm:py-8 px-3 sm:px-4">
        {/* Title */}
        <div className="flex flex-col gap-2 mb-6 sm:mb-8 animate-slide-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
            {t('publicCollection.collectionOf')} {displayName}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('publicCollection.publicView')}
          </p>
        </div>

        {/* Stats */}
        <CollectionStats
          total={amiibos.length}
          collected={userAmiibos.length}
          boxed={boxedCount}
          wishlistCount={wishlist.length}
        />

        {/* Series Stats */}
        <SeriesStats 
          amiibos={amiibos} 
          userAmiibos={userAmiibos} 
          selectedSeries="all"
          showOnlyCollected={false}
          onSeriesClick={() => {}}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'collection' | 'wishlist')} className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t('publicCollection.collection')} ({userAmiibos.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t('index.wishlist')} ({wishlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection">
            {collectedAmiibos.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('publicCollection.noAmiibos')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {collectedAmiibos.map(amiibo => {
                  const userAmiibo = getUserAmiibo(amiibo.id);
                  return (
                    <AmiiboCard
                      key={amiibo.id}
                      id={amiibo.id}
                      name={amiibo.name}
                      imagePath={amiibo.image_path}
                      series={amiibo.series}
                      type={amiibo.type}
                      isInCollection={true}
                      isBoxed={userAmiibo?.is_boxed || false}
                      isInWishlist={false}
                      condition={userAmiibo?.condition || 'new'}
                      isPublicView={true}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist">
            {wishlistAmiibos.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('publicCollection.noWishlist')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {wishlistAmiibos.map(amiibo => (
                  <AmiiboCard
                    key={amiibo.id}
                    id={amiibo.id}
                    name={amiibo.name}
                    imagePath={amiibo.image_path}
                    series={amiibo.series}
                    type={amiibo.type}
                    isInCollection={false}
                    isBoxed={false}
                    isInWishlist={true}
                    condition="new"
                    isPublicView={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
