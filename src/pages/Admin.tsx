import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminAmiibosTab } from '@/components/admin/AdminAmiibosTab';
import { Loader2, Shield, Users, Gamepad2 } from 'lucide-react';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !adminLoading && user && !isAdmin) {
      navigate('/');
    }
  }, [user, authLoading, adminLoading, isAdmin, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">{t('index.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />
      
      <main className="container py-8 flex-1">
        <div className="flex items-center gap-3 mb-8 animate-slide-up">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-nintendo shadow-md">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
              {t('admin.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('admin.subtitle')}
            </p>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              {t('admin.users')}
            </TabsTrigger>
            <TabsTrigger value="amiibos" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              {t('admin.amiibos')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>
          
          <TabsContent value="amiibos">
            <AdminAmiibosTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
