import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Language = "pt" | "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    "header.toggleTheme": "Alternar tema",
    "header.signOut": "Sair",
    "header.profile": "Perfil",
    "header.about": "Sobre",

    // About
    "about.version": "Versão",
    "about.releaseDate": "Data de lançamento",
    "about.description": "Gerencie e acompanhe sua coleção de Amiibos Nintendo de forma fácil e organizada.",
    "about.changelog": "Novidades",

    // Changelog v1.0
    "changelog.v1_feature1": "Lançamento inicial do app",
    "changelog.v1_feature2": "Gerenciamento completo da coleção de Amiibos",
    "changelog.v1_feature3": "Sistema de wishlist para amiibos desejados",
    "changelog.v1_feature4": "Filtros por série, tipo e status",
    "changelog.v1_feature5": "Suporte a múltiplos idiomas (PT, ES, EN)",
    "changelog.v1_feature6": "Tema claro e escuro",

    // Auth
    "auth.title": "Amiibo Tracker",
    "auth.loginSubtitle": "Entre para gerenciar sua coleção",
    "auth.signupSubtitle": "Crie sua conta e comece a colecionar",
    "auth.username": "Nome de usuário",
    "auth.usernamePlaceholder": "Seu nome",
    "auth.email": "Email",
    "auth.emailPlaceholder": "seu@email.com",
    "auth.password": "Senha",
    "auth.login": "Entrar",
    "auth.signup": "Criar conta",
    "auth.loggingIn": "Entrando...",
    "auth.signingUp": "Criando conta...",
    "auth.noAccount": "Não tem conta? Cadastre-se",
    "auth.hasAccount": "Já tem conta? Entre",
    "auth.footer": "Organize e acompanhe sua coleção de Amiibos",
    "auth.errorLogin": "Erro ao entrar",
    "auth.errorSignup": "Erro ao criar conta",
    "auth.invalidCredentials": "Email ou senha incorretos",
    "auth.alreadyRegistered": "Este email já está cadastrado",
    "auth.welcomeBack": "Bem-vindo de volta!",
    "auth.loginSuccess": "Login realizado com sucesso.",
    "auth.accountCreated": "Conta criada!",
    "auth.accountCreatedSuccess": "Sua conta foi criada com sucesso.",
    "auth.genericError": "Algo deu errado. Tente novamente.",
    "auth.orContinueWith": "ou continue com",

    // Index
    "index.myCollection": "Minha Coleção",
    "index.manageAmiibos": "Gerencie seus Amiibos Nintendo",
    "index.loading": "Carregando...",
    "index.searchPlaceholder": "Buscar por nome ou série...",
    "index.allSeries": "Todas as séries",
    "index.filterBySeries": "Filtrar por série",
    "index.allTypes": "Todos os tipos",
    "index.filterByType": "Filtrar por tipo",
    "index.allCharacters": "Todos personagens",
    "index.filterByCharacter": "Filtrar por personagem",
    "index.sortByName": "Nome (A-Z)",
    "index.sortByDateNA": "Data (América)",
    "index.sortByDateJP": "Data (Japão)",
    "index.sortByDateEU": "Data (Europa)",
    "index.sortByDateAU": "Data (Austrália)",
    "index.ascending": "Ordem crescente",
    "index.descending": "Ordem decrescente",
    "index.all": "Todos",
    "index.collected": "Colecionados",
    "index.missing": "Faltando",
    "index.wishlist": "Wishlist",
    "index.showing": "Mostrando",
    "index.of": "de",
    "index.amiibos": "amiibos",
    "index.fromSeries": "da série",
    "index.noResults": "Nenhum amiibo encontrado",
    "index.tryDifferent": "Tente buscar com termos diferentes.",
    "index.previous": "Anterior",
    "index.next": "Próxima",
    "index.page": "Página",
    "index.itemsPerPage": "por página",
    "index.clearFilters": "Limpar filtros",

    // Toasts
    "toast.added": "Adicionado!",
    "toast.addedToCollection": "Amiibo adicionado à sua coleção.",
    "toast.removed": "Removido",
    "toast.removedFromCollection": "Amiibo removido da sua coleção.",
    "toast.removedFromWishlist": "Amiibo removido da sua wishlist.",
    "toast.addedToWishlist": "Amiibo adicionado à sua wishlist.",
    "toast.updated": "Atualizado!",
    "toast.conditionChanged": "Condição alterada para",
    "toast.error": "Erro",
    "toast.loadError": "Não foi possível carregar os dados.",
    "toast.addError": "Não foi possível adicionar o amiibo.",
    "toast.removeError": "Não foi possível remover o amiibo.",
    "toast.updateError": "Não foi possível atualizar o status.",
    "toast.conditionError": "Não foi possível atualizar a condição.",
    "toast.wishlistError": "Não foi possível atualizar a wishlist.",
    "toast.boxedConditionChanged": "Marcado como lacrado e condição alterada para Novo.",

    // Conditions
    "condition.new": "Novo",
    "condition.used": "Usado",
    "condition.damaged": "Danificado",

    // Card & Modal
    "card.boxed": "Lacrado",
    "card.unboxed": "Aberto",
    "card.add": "Adicionar",
    "card.addToCollection": "Adicionar à Coleção",
    "card.inCollection": "Na coleção",
    "card.inWishlist": "Na wishlist",
    "card.markAsBoxed": "Marcar como lacrado",
    "card.markAsUnboxed": "Clique para marcar como aberto",
    "card.removeFromWishlist": "Remover da wishlist",
    "card.addToWishlist": "Adicionar à wishlist",
    "card.condition": "Condição",

    // Modal
    "modal.swipeToNavigate": "Deslize para navegar",

    // Stats
    "stats.total": "Total Amiibos",
    "stats.collected": "Colecionados",
    "stats.boxed": "Lacrados",
    "stats.wishlist": "Wishlist",
    "stats.progress": "Progresso",
    "stats.collectionProgress": "Progresso da Coleção por Série",
    "stats.noSeries": "Sem série",
    "stats.filterCollected": "Clique para filtrar os amiibos colecionados desta série",
    "stats.noCollected": "Nenhum amiibo colecionado nesta série",

    // Footer
    "footer.madeWith": "Feito com muito queijo",
    "footer.description": "A melhor forma de gerenciar e acompanhar sua coleção de Amiibos Nintendo.",
    "footer.links": "Links Úteis",
    "footer.contact": "Contato",
    "footer.rights": "Todos os direitos reservados.",
    "footer.builtWith": "Construído com",

    // Profile
    "profile.title": "Meu Perfil",
    "profile.name": "Nome",
    "profile.namePlaceholder": "Seu nome",
    "profile.birthdate": "Data de Nascimento",
    "profile.country": "País",
    "profile.countryPlaceholder": "Selecione seu país",
    "profile.save": "Salvar",
    "profile.saving": "Salvando...",
    "profile.saved": "Perfil atualizado!",
    "profile.savedDesc": "Suas informações foram salvas com sucesso.",
    "profile.error": "Erro ao salvar",
    "profile.deleteAccount": "Excluir Conta",
    "profile.deleteWarning": "Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.",
    "profile.deleteConfirm": "Tem certeza que deseja excluir sua conta?",
    "profile.deleteButton": "Sim, excluir minha conta",
    "profile.cancel": "Cancelar",
    "profile.deleting": "Excluindo...",
    "profile.deleted": "Conta excluída",
    "profile.deletedDesc": "Sua conta foi excluída com sucesso.",
    "profile.changePassword": "Alterar Senha",
    "profile.currentPassword": "Senha Atual",
    "profile.newPassword": "Nova Senha",
    "profile.confirmPassword": "Confirmar Nova Senha",
    "profile.passwordMismatch": "As senhas não coincidem",
    "profile.passwordChanged": "Senha alterada!",
    "profile.passwordChangedDesc": "Sua senha foi alterada com sucesso.",
    "profile.passwordError": "Erro ao alterar senha",

    // Auth - Forgot Password
    "auth.forgotPassword": "Esqueceu a senha?",
    "auth.resetPassword": "Redefinir Senha",
    "auth.resetPasswordDesc": "Digite seu email para receber um link de redefinição",
    "auth.sendResetLink": "Enviar Link",
    "auth.sending": "Enviando...",
    "auth.resetLinkSent": "Link enviado!",
    "auth.resetLinkSentDesc": "Verifique seu email para redefinir sua senha.",
    "auth.backToLogin": "Voltar ao login",

    // Admin
    "admin.title": "Administração",
    "admin.subtitle": "Gerencie usuários e amiibos",
    "admin.users": "Usuários",
    "admin.amiibos": "Amiibos",
    "admin.usersManagement": "Gerenciamento de Usuários",
    "admin.amiibosManagement": "Gerenciamento de Amiibos",
    "admin.searchUsers": "Buscar por nome ou ID...",
    "admin.searchAmiibos": "Buscar por nome, série ou tipo...",
    "admin.totalUsers": "usuários",
    "admin.totalAmiibos": "amiibos",
    "admin.username": "Nome",
    "admin.country": "País",
    "admin.createdAt": "Criado em",
    "admin.role": "Função",
    "admin.actions": "Ações",
    "admin.user": "Usuário",
    "admin.makeAdmin": "Tornar Admin",
    "admin.removeAdmin": "Remover Admin",
    "admin.noUsersFound": "Nenhum usuário encontrado",
    "admin.loadUsersError": "Não foi possível carregar os usuários.",
    "admin.roleAdded": "Permissão de admin concedida.",
    "admin.roleRemoved": "Permissão de admin removida.",
    "admin.roleError": "Não foi possível alterar a permissão.",
    "admin.confirmMakeAdmin": "Tornar administrador?",
    "admin.confirmRemoveAdmin": "Remover administrador?",
    "admin.confirmMakeAdminDesc": "Deseja conceder permissão de admin para {user}?",
    "admin.confirmRemoveAdminDesc": "Deseja remover a permissão de admin de {user}?",
    "admin.confirm": "Confirmar",
    "admin.addAmiibo": "Adicionar Amiibo",
    "admin.editAmiibo": "Editar Amiibo",
    "admin.name": "Nome",
    "admin.series": "Série",
    "admin.type": "Tipo",
    "admin.image": "Imagem",
    "admin.imagePath": "URL da Imagem",
    "admin.releaseNA": "Lançamento NA",
    "admin.releaseJP": "Lançamento JP",
    "admin.releaseEU": "Lançamento EU",
    "admin.releaseAU": "Lançamento AU",
    "admin.noAmiibosFound": "Nenhum amiibo encontrado",
    "admin.loadAmiibosError": "Não foi possível carregar os amiibos.",
    "admin.nameRequired": "O nome é obrigatório.",
    "admin.amiiboAdded": "Amiibo adicionado com sucesso.",
    "admin.amiiboUpdated": "Amiibo atualizado com sucesso.",
    "admin.amiiboDeleted": "Amiibo excluído com sucesso.",
    "admin.saveAmiiboError": "Não foi possível salvar o amiibo.",
    "admin.deleteAmiiboError": "Não foi possível excluir o amiibo.",
    "admin.confirmDelete": "Excluir amiibo?",
    "admin.confirmDeleteDesc": "Tem certeza que deseja excluir {name}? Esta ação não pode ser desfeita.",
    "admin.delete": "Excluir",
    "admin.clearFilters": "Limpar filtros",
    "admin.selectSeries": "Selecione a série",
    "admin.selectType": "Selecione o tipo",
    "admin.character": "Personagem",
    "admin.selectCharacter": "Selecione personagem",
    "admin.orTypeNew": "Ou digite um novo...",
    "admin.uploadImage": "Upload de Imagem",
    "admin.orEnterPath": "Ou digite o caminho...",
    "admin.imageUploaded": "Imagem enviada com sucesso.",
    "admin.imageUploadError": "Não foi possível enviar a imagem.",

    // Share
    "share.shareCollection": "Compartilhar Coleção",
    "share.share": "Compartilhar",
    "share.shareDescription": "Compartilhe sua coleção e wishlist com amigos usando este link.",
    "share.copied": "Link copiado!",
    "share.copiedDescription": "O link foi copiado para a área de transferência.",
    "share.copyError": "Não foi possível copiar o link.",
    "share.shareTitle": "Minha Coleção de Amiibos",
    "share.shareText": "Confira minha coleção de Amiibos!",

    // Public Collection
    "publicCollection.collectionOf": "Coleção de",
    "publicCollection.publicView": "Visualização pública da coleção",
    "publicCollection.collection": "Coleção",
    "publicCollection.noAmiibos": "Esta coleção ainda não possui amiibos.",
    "publicCollection.noWishlist": "A wishlist está vazia.",
    "publicCollection.userNotFound": "Usuário não encontrado",
    "publicCollection.loadError": "Erro ao carregar a coleção",
    "publicCollection.backHome": "Voltar ao início",
    "publicCollection.collector": "Colecionador",
  },
  es: {
    // Header
    "header.toggleTheme": "Cambiar tema",
    "header.profile": "Perfil",
    "header.signOut": "Salir",
    "header.about": "Acerca de",

    // About
    "about.version": "Versión",
    "about.releaseDate": "Fecha de lanzamiento",
    "about.description": "Gestiona y sigue tu colección de Amiibos Nintendo de forma fácil y organizada.",
    "about.changelog": "Novedades",

    // Changelog v1.0
    "changelog.v1_feature1": "Lanzamiento inicial de la app",
    "changelog.v1_feature2": "Gestión completa de la colección de Amiibos",
    "changelog.v1_feature3": "Sistema de lista de deseos para amiibos deseados",
    "changelog.v1_feature4": "Filtros por serie, tipo y estado",
    "changelog.v1_feature5": "Soporte a múltiples idiomas (PT, ES, EN)",
    "changelog.v1_feature6": "Tema claro y oscuro",

    // Auth
    "auth.title": "Amiibo Tracker",
    "auth.loginSubtitle": "Ingresa para gestionar tu colección",
    "auth.signupSubtitle": "Crea tu cuenta y empieza a coleccionar",
    "auth.username": "Nombre de usuario",
    "auth.usernamePlaceholder": "Tu nombre",
    "auth.email": "Correo electrónico",
    "auth.emailPlaceholder": "tu@email.com",
    "auth.password": "Contraseña",
    "auth.login": "Ingresar",
    "auth.signup": "Crear cuenta",
    "auth.loggingIn": "Ingresando...",
    "auth.signingUp": "Creando cuenta...",
    "auth.noAccount": "¿No tienes cuenta? Regístrate",
    "auth.hasAccount": "¿Ya tienes cuenta? Ingresa",
    "auth.footer": "Organiza y sigue tu colección de Amiibos",
    "auth.errorLogin": "Error al ingresar",
    "auth.errorSignup": "Error al crear cuenta",
    "auth.invalidCredentials": "Correo o contraseña incorrectos",
    "auth.alreadyRegistered": "Este correo ya está registrado",
    "auth.welcomeBack": "¡Bienvenido de vuelta!",
    "auth.loginSuccess": "Ingreso exitoso.",
    "auth.accountCreated": "¡Cuenta creada!",
    "auth.accountCreatedSuccess": "Tu cuenta fue creada con éxito.",
    "auth.genericError": "Algo salió mal. Inténtalo de nuevo.",
    "auth.orContinueWith": "o continuar con",

    // Index
    "index.myCollection": "Mi Colección",
    "index.manageAmiibos": "Gestiona tus Amiibos Nintendo",
    "index.loading": "Cargando...",
    "index.searchPlaceholder": "Buscar por nombre o serie...",
    "index.allSeries": "Todas las series",
    "index.filterBySeries": "Filtrar por serie",
    "index.allTypes": "Todos los tipos",
    "index.filterByType": "Filtrar por tipo",
    "index.allCharacters": "Todos personajes",
    "index.filterByCharacter": "Filtrar por personaje",
    "index.sortByName": "Nombre (A-Z)",
    "index.sortByDateNA": "Fecha (América)",
    "index.sortByDateJP": "Fecha (Japón)",
    "index.sortByDateEU": "Fecha (Europa)",
    "index.sortByDateAU": "Fecha (Australia)",
    "index.ascending": "Orden ascendente",
    "index.descending": "Orden descendente",
    "index.all": "Todos",
    "index.collected": "Coleccionados",
    "index.missing": "Faltantes",
    "index.wishlist": "Lista de deseos",
    "index.showing": "Mostrando",
    "index.of": "de",
    "index.amiibos": "amiibos",
    "index.fromSeries": "de la serie",
    "index.noResults": "No se encontraron amiibos",
    "index.tryDifferent": "Intenta buscar con términos diferentes.",
    "index.previous": "Anterior",
    "index.next": "Siguiente",
    "index.page": "Página",
    "index.itemsPerPage": "por página",
    "index.clearFilters": "Limpiar filtros",

    // Toasts
    "toast.added": "¡Agregado!",
    "toast.addedToCollection": "Amiibo agregado a tu colección.",
    "toast.removed": "Eliminado",
    "toast.removedFromCollection": "Amiibo eliminado de tu colección.",
    "toast.removedFromWishlist": "Amiibo eliminado de tu lista de deseos.",
    "toast.addedToWishlist": "Amiibo agregado a tu lista de deseos.",
    "toast.updated": "¡Actualizado!",
    "toast.conditionChanged": "Condición cambiada a",
    "toast.error": "Error",
    "toast.loadError": "No se pudieron cargar los datos.",
    "toast.addError": "No se pudo agregar el amiibo.",
    "toast.removeError": "No se pudo eliminar el amiibo.",
    "toast.updateError": "No se pudo actualizar el estado.",
    "toast.conditionError": "No se pudo actualizar la condición.",
    "toast.wishlistError": "No se pudo actualizar la lista de deseos.",
    "toast.boxedConditionChanged": "Marcado como sellado y condición cambiada a Nuevo.",

    // Conditions
    "condition.new": "Nuevo",
    "condition.used": "Usado",
    "condition.damaged": "Dañado",

    // Card & Modal
    "card.boxed": "Sellado",
    "card.unboxed": "Abierto",
    "card.add": "Agregar",
    "card.addToCollection": "Agregar a Colección",
    "card.inCollection": "En colección",
    "card.inWishlist": "En lista de deseos",
    "card.markAsBoxed": "Marcar como sellado",
    "card.markAsUnboxed": "Clic para marcar como abierto",
    "card.removeFromWishlist": "Quitar de lista de deseos",
    "card.addToWishlist": "Agregar a lista de deseos",
    "card.condition": "Condición",

    // Modal
    "modal.swipeToNavigate": "Desliza para navegar",

    // Stats
    "stats.total": "Total Amiibos",
    "stats.collected": "Coleccionados",
    "stats.boxed": "Sellados",
    "stats.wishlist": "Lista de deseos",
    "stats.progress": "Progreso",
    "stats.collectionProgress": "Progreso de Colección por Serie",
    "stats.noSeries": "Sin serie",
    "stats.filterCollected": "Clic para filtrar los amiibos coleccionados de esta serie",
    "stats.noCollected": "Ningún amiibo coleccionado en esta serie",

    // Footer
    "footer.madeWith": "Hecho con mucho queso",
    "footer.description": "La mejor forma de gestionar y seguir tu colección de Amiibos Nintendo.",
    "footer.links": "Enlaces Útiles",
    "footer.contact": "Contacto",
    "footer.rights": "Todos los derechos reservados.",
    "footer.builtWith": "Construido con",

    // Profile
    "profile.title": "Mi Perfil",
    "profile.name": "Nombre",
    "profile.namePlaceholder": "Tu nombre",
    "profile.birthdate": "Fecha de Nacimiento",
    "profile.country": "País",
    "profile.countryPlaceholder": "Selecciona tu país",
    "profile.save": "Guardar",
    "profile.saving": "Guardando...",
    "profile.saved": "¡Perfil actualizado!",
    "profile.savedDesc": "Tu información fue guardada con éxito.",
    "profile.error": "Error al guardar",
    "profile.deleteAccount": "Eliminar Cuenta",
    "profile.deleteWarning": "Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.",
    "profile.deleteConfirm": "¿Estás seguro de que deseas eliminar tu cuenta?",
    "profile.deleteButton": "Sí, eliminar mi cuenta",
    "profile.cancel": "Cancelar",
    "profile.deleting": "Eliminando...",
    "profile.deleted": "Cuenta eliminada",
    "profile.deletedDesc": "Tu cuenta fue eliminada con éxito.",
    "profile.changePassword": "Cambiar Contraseña",
    "profile.currentPassword": "Contraseña Actual",
    "profile.newPassword": "Nueva Contraseña",
    "profile.confirmPassword": "Confirmar Nueva Contraseña",
    "profile.passwordMismatch": "Las contraseñas no coinciden",
    "profile.passwordChanged": "¡Contraseña cambiada!",
    "profile.passwordChangedDesc": "Tu contraseña fue cambiada con éxito.",
    "profile.passwordError": "Error al cambiar contraseña",

    // Auth - Forgot Password
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.resetPassword": "Restablecer Contraseña",
    "auth.resetPasswordDesc": "Ingresa tu email para recibir un enlace de restablecimiento",
    "auth.sendResetLink": "Enviar Enlace",
    "auth.sending": "Enviando...",
    "auth.resetLinkSent": "¡Enlace enviado!",
    "auth.resetLinkSentDesc": "Revisa tu email para restablecer tu contraseña.",
    "auth.backToLogin": "Volver al inicio de sesión",

    // Admin
    "admin.title": "Administración",
    "admin.subtitle": "Gestiona usuarios y amiibos",
    "admin.users": "Usuarios",
    "admin.amiibos": "Amiibos",
    "admin.usersManagement": "Gestión de Usuarios",
    "admin.amiibosManagement": "Gestión de Amiibos",
    "admin.searchUsers": "Buscar por nombre o ID...",
    "admin.searchAmiibos": "Buscar por nombre, serie o tipo...",
    "admin.totalUsers": "usuarios",
    "admin.totalAmiibos": "amiibos",
    "admin.username": "Nombre",
    "admin.country": "País",
    "admin.createdAt": "Creado en",
    "admin.role": "Rol",
    "admin.actions": "Acciones",
    "admin.user": "Usuario",
    "admin.makeAdmin": "Hacer Admin",
    "admin.removeAdmin": "Quitar Admin",
    "admin.noUsersFound": "Ningún usuario encontrado",
    "admin.loadUsersError": "No se pudieron cargar los usuarios.",
    "admin.roleAdded": "Permiso de admin concedido.",
    "admin.roleRemoved": "Permiso de admin removido.",
    "admin.roleError": "No se pudo cambiar el permiso.",
    "admin.confirmMakeAdmin": "¿Hacer administrador?",
    "admin.confirmRemoveAdmin": "¿Quitar administrador?",
    "admin.confirmMakeAdminDesc": "¿Deseas dar permiso de admin a {user}?",
    "admin.confirmRemoveAdminDesc": "¿Deseas quitar el permiso de admin de {user}?",
    "admin.confirm": "Confirmar",
    "admin.addAmiibo": "Agregar Amiibo",
    "admin.editAmiibo": "Editar Amiibo",
    "admin.name": "Nombre",
    "admin.series": "Serie",
    "admin.type": "Tipo",
    "admin.image": "Imagen",
    "admin.imagePath": "URL de la Imagen",
    "admin.releaseNA": "Lanzamiento NA",
    "admin.releaseJP": "Lanzamiento JP",
    "admin.releaseEU": "Lanzamiento EU",
    "admin.releaseAU": "Lanzamiento AU",
    "admin.noAmiibosFound": "Ningún amiibo encontrado",
    "admin.loadAmiibosError": "No se pudieron cargar los amiibos.",
    "admin.nameRequired": "El nombre es obligatorio.",
    "admin.amiiboAdded": "Amiibo agregado con éxito.",
    "admin.amiiboUpdated": "Amiibo actualizado con éxito.",
    "admin.amiiboDeleted": "Amiibo eliminado con éxito.",
    "admin.saveAmiiboError": "No se pudo guardar el amiibo.",
    "admin.deleteAmiiboError": "No se pudo eliminar el amiibo.",
    "admin.confirmDelete": "¿Eliminar amiibo?",
    "admin.confirmDeleteDesc": "¿Estás seguro de que deseas eliminar {name}? Esta acción no se puede deshacer.",
    "admin.delete": "Eliminar",
    "admin.clearFilters": "Limpiar filtros",
    "admin.selectSeries": "Selecciona la serie",
    "admin.selectType": "Selecciona el tipo",
    "admin.character": "Personaje",
    "admin.selectCharacter": "Selecciona personaje",
    "admin.orTypeNew": "O escribe uno nuevo...",
    "admin.uploadImage": "Subir Imagen",
    "admin.orEnterPath": "O ingresa la ruta...",
    "admin.imageUploaded": "Imagen subida con éxito.",
    "admin.imageUploadError": "No se pudo subir la imagen.",

    // Share
    "share.shareCollection": "Compartir Colección",
    "share.share": "Compartir",
    "share.shareDescription": "Comparte tu colección y lista de deseos con amigos usando este enlace.",
    "share.copied": "¡Enlace copiado!",
    "share.copiedDescription": "El enlace fue copiado al portapapeles.",
    "share.copyError": "No se pudo copiar el enlace.",
    "share.shareTitle": "Mi Colección de Amiibos",
    "share.shareText": "¡Mira mi colección de Amiibos!",

    // Public Collection
    "publicCollection.collectionOf": "Colección de",
    "publicCollection.publicView": "Vista pública de la colección",
    "publicCollection.collection": "Colección",
    "publicCollection.noAmiibos": "Esta colección aún no tiene amiibos.",
    "publicCollection.noWishlist": "La lista de deseos está vacía.",
    "publicCollection.userNotFound": "Usuario no encontrado",
    "publicCollection.loadError": "Error al cargar la colección",
    "publicCollection.backHome": "Volver al inicio",
    "publicCollection.collector": "Coleccionista",
  },
  en: {
    // Header
    "header.toggleTheme": "Toggle theme",
    "header.profile": "Profile",
    "header.signOut": "Sign out",
    "header.about": "About",

    // About
    "about.version": "Version",
    "about.releaseDate": "Release date",
    "about.description": "Manage and track your Nintendo Amiibo collection easily and organized.",
    "about.changelog": "Changelog",

    // Changelog v1.0
    "changelog.v1_feature1": "Initial app release",
    "changelog.v1_feature2": "Full Amiibo collection management",
    "changelog.v1_feature3": "Wishlist system for desired amiibos",
    "changelog.v1_feature4": "Filters by series, type, and status",
    "changelog.v1_feature5": "Multi-language support (PT, ES, EN)",
    "changelog.v1_feature6": "Light and dark theme",

    // Auth
    "auth.title": "Amiibo Tracker",
    "auth.loginSubtitle": "Sign in to manage your collection",
    "auth.signupSubtitle": "Create your account and start collecting",
    "auth.username": "Username",
    "auth.usernamePlaceholder": "Your name",
    "auth.email": "Email",
    "auth.emailPlaceholder": "your@email.com",
    "auth.password": "Password",
    "auth.login": "Sign in",
    "auth.signup": "Create account",
    "auth.loggingIn": "Signing in...",
    "auth.signingUp": "Creating account...",
    "auth.noAccount": "Don't have an account? Sign up",
    "auth.hasAccount": "Already have an account? Sign in",
    "auth.footer": "Organize and track your Amiibo collection",
    "auth.errorLogin": "Sign in error",
    "auth.errorSignup": "Sign up error",
    "auth.invalidCredentials": "Invalid email or password",
    "auth.alreadyRegistered": "This email is already registered",
    "auth.welcomeBack": "Welcome back!",
    "auth.loginSuccess": "Signed in successfully.",
    "auth.accountCreated": "Account created!",
    "auth.accountCreatedSuccess": "Your account was created successfully.",
    "auth.genericError": "Something went wrong. Try again.",
    "auth.orContinueWith": "or continue with",

    // Index
    "index.myCollection": "My Collection",
    "index.manageAmiibos": "Manage your Nintendo Amiibos",
    "index.loading": "Loading...",
    "index.searchPlaceholder": "Search by name or series...",
    "index.allSeries": "All series",
    "index.filterBySeries": "Filter by series",
    "index.allTypes": "All types",
    "index.filterByType": "Filter by type",
    "index.allCharacters": "All characters",
    "index.filterByCharacter": "Filter by character",
    "index.sortByName": "Name (A-Z)",
    "index.sortByDateNA": "Date (America)",
    "index.sortByDateJP": "Date (Japan)",
    "index.sortByDateEU": "Date (Europe)",
    "index.sortByDateAU": "Date (Australia)",
    "index.ascending": "Ascending order",
    "index.descending": "Descending order",
    "index.all": "All",
    "index.collected": "Collected",
    "index.missing": "Missing",
    "index.wishlist": "Wishlist",
    "index.showing": "Showing",
    "index.of": "of",
    "index.amiibos": "amiibos",
    "index.fromSeries": "from series",
    "index.noResults": "No amiibos found",
    "index.tryDifferent": "Try searching with different terms.",
    "index.previous": "Previous",
    "index.next": "Next",
    "index.page": "Page",
    "index.itemsPerPage": "per page",
    "index.clearFilters": "Clear filters",

    // Toasts
    "toast.added": "Added!",
    "toast.addedToCollection": "Amiibo added to your collection.",
    "toast.removed": "Removed",
    "toast.removedFromCollection": "Amiibo removed from your collection.",
    "toast.removedFromWishlist": "Amiibo removed from your wishlist.",
    "toast.addedToWishlist": "Amiibo added to your wishlist.",
    "toast.updated": "Updated!",
    "toast.conditionChanged": "Condition changed to",
    "toast.error": "Error",
    "toast.loadError": "Could not load data.",
    "toast.addError": "Could not add amiibo.",
    "toast.removeError": "Could not remove amiibo.",
    "toast.updateError": "Could not update status.",
    "toast.conditionError": "Could not update condition.",
    "toast.wishlistError": "Could not update wishlist.",
    "toast.boxedConditionChanged": "Marked as boxed and condition changed to New.",

    // Conditions
    "condition.new": "New",
    "condition.used": "Used",
    "condition.damaged": "Damaged",

    // Card & Modal
    "card.boxed": "Boxed",
    "card.unboxed": "Unboxed",
    "card.add": "Add",
    "card.addToCollection": "Add to Collection",
    "card.inCollection": "In collection",
    "card.inWishlist": "In wishlist",
    "card.markAsBoxed": "Mark as boxed",
    "card.markAsUnboxed": "Click to mark as unboxed",
    "card.removeFromWishlist": "Remove from wishlist",
    "card.addToWishlist": "Add to wishlist",
    "card.condition": "Condition",

    // Modal
    "modal.swipeToNavigate": "Swipe to navigate",

    // Stats
    "stats.total": "Total Amiibos",
    "stats.collected": "Collected",
    "stats.boxed": "Boxed",
    "stats.wishlist": "Wishlist",
    "stats.progress": "Progress",
    "stats.collectionProgress": "Collection Progress by Series",
    "stats.noSeries": "No series",
    "stats.filterCollected": "Click to filter collected amiibos from this series",
    "stats.noCollected": "No collected amiibos in this series",

    // Footer
    "footer.madeWith": "Made with lots of cheese",
    "footer.description": "The best way to manage and track your Nintendo Amiibo collection.",
    "footer.links": "Useful Links",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "footer.builtWith": "Built with",

    // Profile
    "profile.title": "My Profile",
    "profile.name": "Name",
    "profile.namePlaceholder": "Your name",
    "profile.birthdate": "Birthdate",
    "profile.country": "Country",
    "profile.countryPlaceholder": "Select your country",
    "profile.save": "Save",
    "profile.saving": "Saving...",
    "profile.saved": "Profile updated!",
    "profile.savedDesc": "Your information was saved successfully.",
    "profile.error": "Error saving",
    "profile.deleteAccount": "Delete Account",
    "profile.deleteWarning": "This action is irreversible. All your data will be permanently deleted.",
    "profile.deleteConfirm": "Are you sure you want to delete your account?",
    "profile.deleteButton": "Yes, delete my account",
    "profile.cancel": "Cancel",
    "profile.deleting": "Deleting...",
    "profile.deleted": "Account deleted",
    "profile.deletedDesc": "Your account was deleted successfully.",
    "profile.changePassword": "Change Password",
    "profile.currentPassword": "Current Password",
    "profile.newPassword": "New Password",
    "profile.confirmPassword": "Confirm New Password",
    "profile.passwordMismatch": "Passwords do not match",
    "profile.passwordChanged": "Password changed!",
    "profile.passwordChangedDesc": "Your password was changed successfully.",
    "profile.passwordError": "Error changing password",

    // Auth - Forgot Password
    "auth.forgotPassword": "Forgot your password?",
    "auth.resetPassword": "Reset Password",
    "auth.resetPasswordDesc": "Enter your email to receive a reset link",
    "auth.sendResetLink": "Send Link",
    "auth.sending": "Sending...",
    "auth.resetLinkSent": "Link sent!",
    "auth.resetLinkSentDesc": "Check your email to reset your password.",
    "auth.backToLogin": "Back to login",

    // Admin
    "admin.title": "Administration",
    "admin.subtitle": "Manage users and amiibos",
    "admin.users": "Users",
    "admin.amiibos": "Amiibos",
    "admin.usersManagement": "User Management",
    "admin.amiibosManagement": "Amiibo Management",
    "admin.searchUsers": "Search by name or ID...",
    "admin.searchAmiibos": "Search by name, series or type...",
    "admin.totalUsers": "users",
    "admin.totalAmiibos": "amiibos",
    "admin.username": "Name",
    "admin.country": "Country",
    "admin.createdAt": "Created at",
    "admin.role": "Role",
    "admin.actions": "Actions",
    "admin.user": "User",
    "admin.makeAdmin": "Make Admin",
    "admin.removeAdmin": "Remove Admin",
    "admin.noUsersFound": "No users found",
    "admin.loadUsersError": "Could not load users.",
    "admin.roleAdded": "Admin permission granted.",
    "admin.roleRemoved": "Admin permission removed.",
    "admin.roleError": "Could not change permission.",
    "admin.confirmMakeAdmin": "Make administrator?",
    "admin.confirmRemoveAdmin": "Remove administrator?",
    "admin.confirmMakeAdminDesc": "Do you want to grant admin permission to {user}?",
    "admin.confirmRemoveAdminDesc": "Do you want to remove admin permission from {user}?",
    "admin.confirm": "Confirm",
    "admin.addAmiibo": "Add Amiibo",
    "admin.editAmiibo": "Edit Amiibo",
    "admin.name": "Name",
    "admin.series": "Series",
    "admin.type": "Type",
    "admin.image": "Image",
    "admin.imagePath": "Image URL",
    "admin.releaseNA": "Release NA",
    "admin.releaseJP": "Release JP",
    "admin.releaseEU": "Release EU",
    "admin.releaseAU": "Release AU",
    "admin.noAmiibosFound": "No amiibos found",
    "admin.loadAmiibosError": "Could not load amiibos.",
    "admin.nameRequired": "Name is required.",
    "admin.amiiboAdded": "Amiibo added successfully.",
    "admin.amiiboUpdated": "Amiibo updated successfully.",
    "admin.amiiboDeleted": "Amiibo deleted successfully.",
    "admin.saveAmiiboError": "Could not save amiibo.",
    "admin.deleteAmiiboError": "Could not delete amiibo.",
    "admin.confirmDelete": "Delete amiibo?",
    "admin.confirmDeleteDesc": "Are you sure you want to delete {name}? This action cannot be undone.",
    "admin.delete": "Delete",
    "admin.clearFilters": "Clear filters",
    "admin.selectSeries": "Select series",
    "admin.selectType": "Select type",
    "admin.character": "Character",
    "admin.selectCharacter": "Select character",
    "admin.orTypeNew": "Or type a new one...",
    "admin.uploadImage": "Upload Image",
    "admin.orEnterPath": "Or enter the path...",
    "admin.imageUploaded": "Image uploaded successfully.",
    "admin.imageUploadError": "Could not upload image.",

    // Share
    "share.shareCollection": "Share Collection",
    "share.share": "Share",
    "share.shareDescription": "Share your collection and wishlist with friends using this link.",
    "share.copied": "Link copied!",
    "share.copiedDescription": "The link has been copied to your clipboard.",
    "share.copyError": "Could not copy link.",
    "share.shareTitle": "My Amiibo Collection",
    "share.shareText": "Check out my Amiibo collection!",

    // Public Collection
    "publicCollection.collectionOf": "Collection of",
    "publicCollection.publicView": "Public view of the collection",
    "publicCollection.collection": "Collection",
    "publicCollection.noAmiibos": "This collection has no amiibos yet.",
    "publicCollection.noWishlist": "The wishlist is empty.",
    "publicCollection.userNotFound": "User not found",
    "publicCollection.loadError": "Error loading collection",
    "publicCollection.backHome": "Back to home",
    "publicCollection.collector": "Collector",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "pt";
  });
  const [initialized, setInitialized] = useState(false);

  // Load language from user profile when authenticated
  useEffect(() => {
    const loadUserLanguage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("language").eq("id", session.user.id).single();

        if (profile?.language) {
          setLanguageState(profile.language as Language);
          localStorage.setItem("app-language", profile.language);
        }
      }
      setInitialized(true);
    };

    loadUserLanguage();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("language")
            .eq("id", session.user.id)
            .single();

          if (profile?.language) {
            setLanguageState(profile.language as Language);
            localStorage.setItem("app-language", profile.language);
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);

    // Save to user profile if authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({ language: lang }).eq("id", session.user.id);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["pt"]] || key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
