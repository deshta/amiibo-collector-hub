import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Language = 'pt' | 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    'header.toggleTheme': 'Alternar tema',
    'header.signOut': 'Sair',
    
    // Auth
    'auth.title': 'Minha Coleção',
    'auth.loginSubtitle': 'Entre para gerenciar sua coleção',
    'auth.signupSubtitle': 'Crie sua conta e comece a colecionar',
    'auth.username': 'Nome de usuário',
    'auth.usernamePlaceholder': 'Seu nome',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'seu@email.com',
    'auth.password': 'Senha',
    'auth.login': 'Entrar',
    'auth.signup': 'Criar conta',
    'auth.loggingIn': 'Entrando...',
    'auth.signingUp': 'Criando conta...',
    'auth.noAccount': 'Não tem conta? Cadastre-se',
    'auth.hasAccount': 'Já tem conta? Entre',
    'auth.footer': 'Organize e acompanhe sua coleção de Amiibos',
    'auth.errorLogin': 'Erro ao entrar',
    'auth.errorSignup': 'Erro ao criar conta',
    'auth.invalidCredentials': 'Email ou senha incorretos',
    'auth.alreadyRegistered': 'Este email já está cadastrado',
    'auth.welcomeBack': 'Bem-vindo de volta!',
    'auth.loginSuccess': 'Login realizado com sucesso.',
    'auth.accountCreated': 'Conta criada!',
    'auth.accountCreatedSuccess': 'Sua conta foi criada com sucesso.',
    'auth.genericError': 'Algo deu errado. Tente novamente.',
    
    // Index
    'index.myCollection': 'Minha Coleção',
    'index.manageAmiibos': 'Gerencie seus Amiibos Nintendo',
    'index.loading': 'Carregando...',
    'index.searchPlaceholder': 'Buscar por nome ou série...',
    'index.allSeries': 'Todas as séries',
    'index.filterBySeries': 'Filtrar por série',
    'index.allTypes': 'Todos os tipos',
    'index.filterByType': 'Filtrar por tipo',
    'index.sortByName': 'Nome (A-Z)',
    'index.sortByDateNA': 'Data (América)',
    'index.sortByDateJP': 'Data (Japão)',
    'index.ascending': 'Ordem crescente',
    'index.descending': 'Ordem decrescente',
    'index.all': 'Todos',
    'index.collected': 'Colecionados',
    'index.missing': 'Faltando',
    'index.wishlist': 'Wishlist',
    'index.showing': 'Mostrando',
    'index.of': 'de',
    'index.amiibos': 'amiibos',
    'index.fromSeries': 'da série',
    'index.noResults': 'Nenhum amiibo encontrado',
    'index.tryDifferent': 'Tente buscar com termos diferentes.',
    'index.previous': 'Anterior',
    'index.next': 'Próxima',
    'index.page': 'Página',
    'index.itemsPerPage': 'por página',
    'index.clearFilters': 'Limpar filtros',
    
    // Toasts
    'toast.added': 'Adicionado!',
    'toast.addedToCollection': 'Amiibo adicionado à sua coleção.',
    'toast.removed': 'Removido',
    'toast.removedFromCollection': 'Amiibo removido da sua coleção.',
    'toast.removedFromWishlist': 'Amiibo removido da sua wishlist.',
    'toast.addedToWishlist': 'Amiibo adicionado à sua wishlist.',
    'toast.updated': 'Atualizado!',
    'toast.conditionChanged': 'Condição alterada para',
    'toast.error': 'Erro',
    'toast.loadError': 'Não foi possível carregar os dados.',
    'toast.addError': 'Não foi possível adicionar o amiibo.',
    'toast.removeError': 'Não foi possível remover o amiibo.',
    'toast.updateError': 'Não foi possível atualizar o status.',
    'toast.conditionError': 'Não foi possível atualizar a condição.',
    'toast.wishlistError': 'Não foi possível atualizar a wishlist.',
    'toast.boxedConditionChanged': 'Marcado como lacrado e condição alterada para Novo.',
    
    // Conditions
    'condition.new': 'Novo',
    'condition.used': 'Usado',
    'condition.damaged': 'Danificado',
    
    // Card & Modal
    'card.boxed': 'Lacrado',
    'card.unboxed': 'Aberto',
    'card.add': 'Adicionar',
    'card.addToCollection': 'Adicionar à Coleção',
    'card.inCollection': 'Na coleção',
    'card.inWishlist': 'Na wishlist',
    'card.markAsBoxed': 'Marcar como lacrado',
    'card.markAsUnboxed': 'Clique para marcar como aberto',
    'card.removeFromWishlist': 'Remover da wishlist',
    'card.addToWishlist': 'Adicionar à wishlist',
    'card.condition': 'Condição',
    
    // Stats
    'stats.total': 'Total Amiibos',
    'stats.collected': 'Colecionados',
    'stats.boxed': 'Lacrados',
    'stats.wishlist': 'Wishlist',
    'stats.progress': 'Progresso',
    'stats.collectionProgress': 'Progresso da Coleção por Série',
    'stats.noSeries': 'Sem série',
    'stats.filterCollected': 'Clique para filtrar os amiibos colecionados desta série',
    'stats.noCollected': 'Nenhum amiibo colecionado nesta série',
    
    // Footer
    'footer.madeWith': 'Feito com muito queijo',
    
    // Profile
    'profile.title': 'Meu Perfil',
    'profile.name': 'Nome',
    'profile.namePlaceholder': 'Seu nome',
    'profile.birthdate': 'Data de Nascimento',
    'profile.country': 'País',
    'profile.countryPlaceholder': 'Selecione seu país',
    'profile.save': 'Salvar',
    'profile.saving': 'Salvando...',
    'profile.saved': 'Perfil atualizado!',
    'profile.savedDesc': 'Suas informações foram salvas com sucesso.',
    'profile.error': 'Erro ao salvar',
    'profile.deleteAccount': 'Excluir Conta',
    'profile.deleteWarning': 'Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.',
    'profile.deleteConfirm': 'Tem certeza que deseja excluir sua conta?',
    'profile.deleteButton': 'Sim, excluir minha conta',
    'profile.cancel': 'Cancelar',
    'profile.deleting': 'Excluindo...',
    'profile.deleted': 'Conta excluída',
    'profile.deletedDesc': 'Sua conta foi excluída com sucesso.',
    'profile.changePassword': 'Alterar Senha',
    'profile.currentPassword': 'Senha Atual',
    'profile.newPassword': 'Nova Senha',
    'profile.confirmPassword': 'Confirmar Nova Senha',
    'profile.passwordMismatch': 'As senhas não coincidem',
    'profile.passwordChanged': 'Senha alterada!',
    'profile.passwordChangedDesc': 'Sua senha foi alterada com sucesso.',
    'profile.passwordError': 'Erro ao alterar senha',
    
    // Auth - Forgot Password
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.resetPassword': 'Redefinir Senha',
    'auth.resetPasswordDesc': 'Digite seu email para receber um link de redefinição',
    'auth.sendResetLink': 'Enviar Link',
    'auth.sending': 'Enviando...',
    'auth.resetLinkSent': 'Link enviado!',
    'auth.resetLinkSentDesc': 'Verifique seu email para redefinir sua senha.',
    'auth.backToLogin': 'Voltar ao login',
  },
  es: {
    // Header
    'header.toggleTheme': 'Cambiar tema',
    'header.signOut': 'Salir',
    
    // Auth
    'auth.title': 'Mi Colección',
    'auth.loginSubtitle': 'Ingresa para gestionar tu colección',
    'auth.signupSubtitle': 'Crea tu cuenta y empieza a coleccionar',
    'auth.username': 'Nombre de usuario',
    'auth.usernamePlaceholder': 'Tu nombre',
    'auth.email': 'Correo electrónico',
    'auth.emailPlaceholder': 'tu@email.com',
    'auth.password': 'Contraseña',
    'auth.login': 'Ingresar',
    'auth.signup': 'Crear cuenta',
    'auth.loggingIn': 'Ingresando...',
    'auth.signingUp': 'Creando cuenta...',
    'auth.noAccount': '¿No tienes cuenta? Regístrate',
    'auth.hasAccount': '¿Ya tienes cuenta? Ingresa',
    'auth.footer': 'Organiza y sigue tu colección de Amiibos',
    'auth.errorLogin': 'Error al ingresar',
    'auth.errorSignup': 'Error al crear cuenta',
    'auth.invalidCredentials': 'Correo o contraseña incorrectos',
    'auth.alreadyRegistered': 'Este correo ya está registrado',
    'auth.welcomeBack': '¡Bienvenido de vuelta!',
    'auth.loginSuccess': 'Ingreso exitoso.',
    'auth.accountCreated': '¡Cuenta creada!',
    'auth.accountCreatedSuccess': 'Tu cuenta fue creada con éxito.',
    'auth.genericError': 'Algo salió mal. Inténtalo de nuevo.',
    
    // Index
    'index.myCollection': 'Mi Colección',
    'index.manageAmiibos': 'Gestiona tus Amiibos Nintendo',
    'index.loading': 'Cargando...',
    'index.searchPlaceholder': 'Buscar por nombre o serie...',
    'index.allSeries': 'Todas las series',
    'index.filterBySeries': 'Filtrar por serie',
    'index.allTypes': 'Todos los tipos',
    'index.filterByType': 'Filtrar por tipo',
    'index.sortByName': 'Nombre (A-Z)',
    'index.sortByDateNA': 'Fecha (América)',
    'index.sortByDateJP': 'Fecha (Japón)',
    'index.ascending': 'Orden ascendente',
    'index.descending': 'Orden descendente',
    'index.all': 'Todos',
    'index.collected': 'Coleccionados',
    'index.missing': 'Faltantes',
    'index.wishlist': 'Lista de deseos',
    'index.showing': 'Mostrando',
    'index.of': 'de',
    'index.amiibos': 'amiibos',
    'index.fromSeries': 'de la serie',
    'index.noResults': 'No se encontraron amiibos',
    'index.tryDifferent': 'Intenta buscar con términos diferentes.',
    'index.previous': 'Anterior',
    'index.next': 'Siguiente',
    'index.page': 'Página',
    'index.itemsPerPage': 'por página',
    'index.clearFilters': 'Limpiar filtros',
    
    // Toasts
    'toast.added': '¡Agregado!',
    'toast.addedToCollection': 'Amiibo agregado a tu colección.',
    'toast.removed': 'Eliminado',
    'toast.removedFromCollection': 'Amiibo eliminado de tu colección.',
    'toast.removedFromWishlist': 'Amiibo eliminado de tu lista de deseos.',
    'toast.addedToWishlist': 'Amiibo agregado a tu lista de deseos.',
    'toast.updated': '¡Actualizado!',
    'toast.conditionChanged': 'Condición cambiada a',
    'toast.error': 'Error',
    'toast.loadError': 'No se pudieron cargar los datos.',
    'toast.addError': 'No se pudo agregar el amiibo.',
    'toast.removeError': 'No se pudo eliminar el amiibo.',
    'toast.updateError': 'No se pudo actualizar el estado.',
    'toast.conditionError': 'No se pudo actualizar la condición.',
    'toast.wishlistError': 'No se pudo actualizar la lista de deseos.',
    'toast.boxedConditionChanged': 'Marcado como sellado y condición cambiada a Nuevo.',
    
    // Conditions
    'condition.new': 'Nuevo',
    'condition.used': 'Usado',
    'condition.damaged': 'Dañado',
    
    // Card & Modal
    'card.boxed': 'Sellado',
    'card.unboxed': 'Abierto',
    'card.add': 'Agregar',
    'card.addToCollection': 'Agregar a Colección',
    'card.inCollection': 'En colección',
    'card.inWishlist': 'En lista de deseos',
    'card.markAsBoxed': 'Marcar como sellado',
    'card.markAsUnboxed': 'Clic para marcar como abierto',
    'card.removeFromWishlist': 'Quitar de lista de deseos',
    'card.addToWishlist': 'Agregar a lista de deseos',
    'card.condition': 'Condición',
    
    // Stats
    'stats.total': 'Total Amiibos',
    'stats.collected': 'Coleccionados',
    'stats.boxed': 'Sellados',
    'stats.wishlist': 'Lista de deseos',
    'stats.progress': 'Progreso',
    'stats.collectionProgress': 'Progreso de Colección por Serie',
    'stats.noSeries': 'Sin serie',
    'stats.filterCollected': 'Clic para filtrar los amiibos coleccionados de esta serie',
    'stats.noCollected': 'Ningún amiibo coleccionado en esta serie',
    
    // Footer
    'footer.madeWith': 'Hecho con mucho queso',
    
    // Profile
    'profile.title': 'Mi Perfil',
    'profile.name': 'Nombre',
    'profile.namePlaceholder': 'Tu nombre',
    'profile.birthdate': 'Fecha de Nacimiento',
    'profile.country': 'País',
    'profile.countryPlaceholder': 'Selecciona tu país',
    'profile.save': 'Guardar',
    'profile.saving': 'Guardando...',
    'profile.saved': '¡Perfil actualizado!',
    'profile.savedDesc': 'Tu información fue guardada con éxito.',
    'profile.error': 'Error al guardar',
    'profile.deleteAccount': 'Eliminar Cuenta',
    'profile.deleteWarning': 'Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.',
    'profile.deleteConfirm': '¿Estás seguro de que deseas eliminar tu cuenta?',
    'profile.deleteButton': 'Sí, eliminar mi cuenta',
    'profile.cancel': 'Cancelar',
    'profile.deleting': 'Eliminando...',
    'profile.deleted': 'Cuenta eliminada',
    'profile.deletedDesc': 'Tu cuenta fue eliminada con éxito.',
    'profile.changePassword': 'Cambiar Contraseña',
    'profile.currentPassword': 'Contraseña Actual',
    'profile.newPassword': 'Nueva Contraseña',
    'profile.confirmPassword': 'Confirmar Nueva Contraseña',
    'profile.passwordMismatch': 'Las contraseñas no coinciden',
    'profile.passwordChanged': '¡Contraseña cambiada!',
    'profile.passwordChangedDesc': 'Tu contraseña fue cambiada con éxito.',
    'profile.passwordError': 'Error al cambiar contraseña',
    
    // Auth - Forgot Password
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.resetPassword': 'Restablecer Contraseña',
    'auth.resetPasswordDesc': 'Ingresa tu email para recibir un enlace de restablecimiento',
    'auth.sendResetLink': 'Enviar Enlace',
    'auth.sending': 'Enviando...',
    'auth.resetLinkSent': '¡Enlace enviado!',
    'auth.resetLinkSentDesc': 'Revisa tu email para restablecer tu contraseña.',
    'auth.backToLogin': 'Volver al inicio de sesión',
  },
  en: {
    // Header
    'header.toggleTheme': 'Toggle theme',
    'header.signOut': 'Sign out',
    
    // Auth
    'auth.title': 'My Collection',
    'auth.loginSubtitle': 'Sign in to manage your collection',
    'auth.signupSubtitle': 'Create your account and start collecting',
    'auth.username': 'Username',
    'auth.usernamePlaceholder': 'Your name',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'your@email.com',
    'auth.password': 'Password',
    'auth.login': 'Sign in',
    'auth.signup': 'Create account',
    'auth.loggingIn': 'Signing in...',
    'auth.signingUp': 'Creating account...',
    'auth.noAccount': "Don't have an account? Sign up",
    'auth.hasAccount': 'Already have an account? Sign in',
    'auth.footer': 'Organize and track your Amiibo collection',
    'auth.errorLogin': 'Sign in error',
    'auth.errorSignup': 'Sign up error',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.alreadyRegistered': 'This email is already registered',
    'auth.welcomeBack': 'Welcome back!',
    'auth.loginSuccess': 'Signed in successfully.',
    'auth.accountCreated': 'Account created!',
    'auth.accountCreatedSuccess': 'Your account was created successfully.',
    'auth.genericError': 'Something went wrong. Try again.',
    
    // Index
    'index.myCollection': 'My Collection',
    'index.manageAmiibos': 'Manage your Nintendo Amiibos',
    'index.loading': 'Loading...',
    'index.searchPlaceholder': 'Search by name or series...',
    'index.allSeries': 'All series',
    'index.filterBySeries': 'Filter by series',
    'index.allTypes': 'All types',
    'index.filterByType': 'Filter by type',
    'index.sortByName': 'Name (A-Z)',
    'index.sortByDateNA': 'Date (America)',
    'index.sortByDateJP': 'Date (Japan)',
    'index.ascending': 'Ascending order',
    'index.descending': 'Descending order',
    'index.all': 'All',
    'index.collected': 'Collected',
    'index.missing': 'Missing',
    'index.wishlist': 'Wishlist',
    'index.showing': 'Showing',
    'index.of': 'of',
    'index.amiibos': 'amiibos',
    'index.fromSeries': 'from series',
    'index.noResults': 'No amiibos found',
    'index.tryDifferent': 'Try searching with different terms.',
    'index.previous': 'Previous',
    'index.next': 'Next',
    'index.page': 'Page',
    'index.itemsPerPage': 'per page',
    'index.clearFilters': 'Clear filters',
    
    // Toasts
    'toast.added': 'Added!',
    'toast.addedToCollection': 'Amiibo added to your collection.',
    'toast.removed': 'Removed',
    'toast.removedFromCollection': 'Amiibo removed from your collection.',
    'toast.removedFromWishlist': 'Amiibo removed from your wishlist.',
    'toast.addedToWishlist': 'Amiibo added to your wishlist.',
    'toast.updated': 'Updated!',
    'toast.conditionChanged': 'Condition changed to',
    'toast.error': 'Error',
    'toast.loadError': 'Could not load data.',
    'toast.addError': 'Could not add amiibo.',
    'toast.removeError': 'Could not remove amiibo.',
    'toast.updateError': 'Could not update status.',
    'toast.conditionError': 'Could not update condition.',
    'toast.wishlistError': 'Could not update wishlist.',
    'toast.boxedConditionChanged': 'Marked as boxed and condition changed to New.',
    
    // Conditions
    'condition.new': 'New',
    'condition.used': 'Used',
    'condition.damaged': 'Damaged',
    
    // Card & Modal
    'card.boxed': 'Boxed',
    'card.unboxed': 'Unboxed',
    'card.add': 'Add',
    'card.addToCollection': 'Add to Collection',
    'card.inCollection': 'In collection',
    'card.inWishlist': 'In wishlist',
    'card.markAsBoxed': 'Mark as boxed',
    'card.markAsUnboxed': 'Click to mark as unboxed',
    'card.removeFromWishlist': 'Remove from wishlist',
    'card.addToWishlist': 'Add to wishlist',
    'card.condition': 'Condition',
    
    // Stats
    'stats.total': 'Total Amiibos',
    'stats.collected': 'Collected',
    'stats.boxed': 'Boxed',
    'stats.wishlist': 'Wishlist',
    'stats.progress': 'Progress',
    'stats.collectionProgress': 'Collection Progress by Series',
    'stats.noSeries': 'No series',
    'stats.filterCollected': 'Click to filter collected amiibos from this series',
    'stats.noCollected': 'No collected amiibos in this series',
    
    // Footer
    'footer.madeWith': 'Made with lots of cheese',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.name': 'Name',
    'profile.namePlaceholder': 'Your name',
    'profile.birthdate': 'Birthdate',
    'profile.country': 'Country',
    'profile.countryPlaceholder': 'Select your country',
    'profile.save': 'Save',
    'profile.saving': 'Saving...',
    'profile.saved': 'Profile updated!',
    'profile.savedDesc': 'Your information was saved successfully.',
    'profile.error': 'Error saving',
    'profile.deleteAccount': 'Delete Account',
    'profile.deleteWarning': 'This action is irreversible. All your data will be permanently deleted.',
    'profile.deleteConfirm': 'Are you sure you want to delete your account?',
    'profile.deleteButton': 'Yes, delete my account',
    'profile.cancel': 'Cancel',
    'profile.deleting': 'Deleting...',
    'profile.deleted': 'Account deleted',
    'profile.deletedDesc': 'Your account was deleted successfully.',
    'profile.changePassword': 'Change Password',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.passwordMismatch': 'Passwords do not match',
    'profile.passwordChanged': 'Password changed!',
    'profile.passwordChangedDesc': 'Your password was changed successfully.',
    'profile.passwordError': 'Error changing password',
    
    // Auth - Forgot Password
    'auth.forgotPassword': 'Forgot your password?',
    'auth.resetPassword': 'Reset Password',
    'auth.resetPasswordDesc': 'Enter your email to receive a reset link',
    'auth.sendResetLink': 'Send Link',
    'auth.sending': 'Sending...',
    'auth.resetLinkSent': 'Link sent!',
    'auth.resetLinkSentDesc': 'Check your email to reset your password.',
    'auth.backToLogin': 'Back to login',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'pt';
  });
  const [initialized, setInitialized] = useState(false);

  // Load language from user profile when authenticated
  useEffect(() => {
    const loadUserLanguage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.language) {
          setLanguageState(profile.language as Language);
          localStorage.setItem('app-language', profile.language);
        }
      }
      setInitialized(true);
    };

    loadUserLanguage();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('language')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.language) {
            setLanguageState(profile.language as Language);
            localStorage.setItem('app-language', profile.language);
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);

    // Save to user profile if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', session.user.id);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
