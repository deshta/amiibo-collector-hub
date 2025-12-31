import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    
    // Conditions
    'condition.new': 'Novo',
    'condition.used': 'Usado',
    'condition.damaged': 'Danificado',
    
    // Card
    'card.boxed': 'Lacrado',
    'card.unboxed': 'Aberto',
    'card.addToCollection': 'Adicionar',
    'card.inCollection': 'Na Coleção',
    
    // Stats
    'stats.total': 'Total',
    'stats.collected': 'Colecionados',
    'stats.boxed': 'Lacrados',
    'stats.wishlist': 'Wishlist',
    'stats.collectionProgress': 'Progresso da Coleção por Série',
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
    
    // Conditions
    'condition.new': 'Nuevo',
    'condition.used': 'Usado',
    'condition.damaged': 'Dañado',
    
    // Card
    'card.boxed': 'Sellado',
    'card.unboxed': 'Abierto',
    'card.addToCollection': 'Agregar',
    'card.inCollection': 'En Colección',
    
    // Stats
    'stats.total': 'Total',
    'stats.collected': 'Coleccionados',
    'stats.boxed': 'Sellados',
    'stats.wishlist': 'Lista de deseos',
    'stats.collectionProgress': 'Progreso de Colección por Serie',
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
    
    // Conditions
    'condition.new': 'New',
    'condition.used': 'Used',
    'condition.damaged': 'Damaged',
    
    // Card
    'card.boxed': 'Boxed',
    'card.unboxed': 'Unboxed',
    'card.addToCollection': 'Add',
    'card.inCollection': 'In Collection',
    
    // Stats
    'stats.total': 'Total',
    'stats.collected': 'Collected',
    'stats.boxed': 'Boxed',
    'stats.wishlist': 'Wishlist',
    'stats.collectionProgress': 'Collection Progress by Series',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
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
