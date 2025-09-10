import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // Navigation
      events: 'الفعاليات',
      myEvents: 'فعالياتي',
      messages: 'الرسائل',
      profile: 'الملف الشخصي',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      signup: 'إنشاء حساب',
      
      // Events
      activeEvents: 'الفعاليات النشطة',
      createEvent: 'إنشاء فعالية',
      eventTitle: 'عنوان الفعالية',
      eventDescription: 'وصف الفعالية',
      eventLocation: 'مكان الفعالية',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      maxAttendees: 'العدد الأقصى للحضور',
      eventType: 'نوع الفعالية',
      freeEvent: 'فعالية مجانية',
      premiumEvent: 'فعالية مدفوعة',
      adminOnlyEvent: 'فعالية إدارية فقط',
      joinEvent: 'انضمام للفعالية',
      leaveEvent: 'مغادرة الفعالية',
      attendees: 'الحضور',
      createdOn: 'تم الإنشاء في',
      
      // Membership
      freeMember: 'عضو مجاني',
      premiumMember: 'عضو مميز',
      adminMember: 'مدير',
      upgradeToPremium: 'ترقية للعضوية المميزة',
      
      // Messages
      sendMessage: 'إرسال رسالة',
      upgradeToChat: 'ترقية للدردشة مع الأعضاء',
      messagingRestricted: 'التواصل مع الأعضاء متاح للعضوية المميزة فقط',
      
      // Common
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      loading: 'جاري التحميل...',
      welcomeBack: 'مرحباً بعودتك',
      welcome: 'مرحباً بك في كامب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      fullName: 'الاسم الكامل',
      username: 'اسم المستخدم',
      
      // Additional translations
      success: 'نجح',
      error: 'خطأ',
      errorOccurred: 'حدث خطأ',
      leftEvent: 'تم مغادرة الفعالية',
      joinedEvent: 'تم الانضمام للفعالية',
      upgradeToAccess: 'ترقية للوصول',
      restricted: 'مقيد',
      loginToJoin: 'سجل دخول للانضمام',
      createdBy: 'إنشاء بواسطة',
      passwordsMismatch: 'كلمات المرور غير متطابقة',
      accountCreated: 'تم إنشاء الحساب بنجاح',
      discoverEvents: 'أول منصة عراقية للماركة في الفعاليات والأحداث',
      unlockPremiumFeatures: 'فتح الميزات المميزة',
      noEventsYet: 'لا توجد فعاليات حتى الآن',
      beFirstToCreate: 'كن أول من ينشئ فعالية!',
      
      // Categories
      upcomingEvents: 'الفعاليات القادمة',
      premiumEvents: 'الفعاليات المميزة',
      freeEvents: 'الفعاليات المجانية',
      adminEvents: 'فعاليات الإدارة',
      
      // Stats
      totalEvents: 'إجمالي الفعاليات',
      activeUsers: 'المستخدمون النشطون',
      successfulEvents: 'الفعاليات المنجزة',
      
      // Profile
      memberSince: 'عضو منذ',
      editProfile: 'تعديل الملف الشخصي',
      
      // Membership types
      free: 'مجاني',
      premium: 'مميز',
      admin: 'مدير',
      
      // Dashboard & Management
      dashboard: 'لوحة التحكم',
      adminPanel: 'لوحة الإدارة',
      userManagement: 'إدارة المستخدمين',
      eventManagement: 'إدارة الفعاليات',
      siteSettings: 'إعدادات الموقع',
      statistics: 'الإحصائيات',
      
      // Event Management
      createNewEvent: 'إنشاء فعالية جديدة',
      eventCreated: 'تم إنشاء الفعالية بنجاح',
      
      // Messaging
      conversations: 'المحادثات',
      newMessage: 'رسالة جديدة',
      startConversation: 'بدء محادثة',
      
      // Navigation
      activeEventsPage: 'الفعاليات النشطة',
      myEventsPage: 'فعالياتي',
    }
  },
  en: {
    translation: {
      // Navigation
      events: 'Events',
      myEvents: 'My Events',
      messages: 'Messages',
      profile: 'Profile',
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      
      // Events
      activeEvents: 'Active Events',
      createEvent: 'Create Event',
      eventTitle: 'Event Title',
      eventDescription: 'Event Description',
      eventLocation: 'Event Location',
      startDate: 'Start Date',
      endDate: 'End Date',
      maxAttendees: 'Max Attendees',
      eventType: 'Event Type',
      freeEvent: 'Free Event',
      premiumEvent: 'Premium Event',
      adminOnlyEvent: 'Admin Only Event',
      joinEvent: 'Join Event',
      leaveEvent: 'Leave Event',
      attendees: 'Attendees',
      createdOn: 'Created on',
      
      // Membership
      freeMember: 'Free Member',
      premiumMember: 'Premium Member',
      adminMember: 'Admin',
      upgradeToPremium: 'Upgrade to Premium',
      
      // Messages
      sendMessage: 'Send Message',
      upgradeToChat: 'Upgrade to Chat with Members',
      messagingRestricted: 'Messaging is available for premium members only',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading...',
      welcomeBack: 'Welcome Back',
      welcome: 'Welcome to Events Platform',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      username: 'Username',
      
      // Additional translations
      success: 'Success',
      error: 'Error',
      errorOccurred: 'An error occurred',
      leftEvent: 'Left the event',
      joinedEvent: 'Joined the event',
      upgradeToAccess: 'Upgrade to access',
      restricted: 'Restricted',
      loginToJoin: 'Login to join',
      createdBy: 'Created by',
      passwordsMismatch: 'Passwords do not match',
      accountCreated: 'Account created successfully',
      discoverEvents: 'Discover the latest and most exciting events',
      unlockPremiumFeatures: 'Unlock premium features',
      noEventsYet: 'No events yet',
      beFirstToCreate: 'Be the first to create an event!',
      
      // Categories
      upcomingEvents: 'Upcoming Events',
      premiumEvents: 'Premium Events',
      freeEvents: 'Free Events',
      adminEvents: 'Admin Events',
      
      // Stats
      totalEvents: 'Total Events',
      activeUsers: 'Active Users',
      successfulEvents: 'Successful Events',
      
      // Profile
      memberSince: 'Member since',
      editProfile: 'Edit Profile',
      
      // Membership types
      free: 'Free',
      premium: 'Premium',
      admin: 'Admin',
    }
  },
  fr: {
    translation: {
      // Navigation
      events: 'Événements',
      myEvents: 'Mes Événements',
      messages: 'Messages',
      profile: 'Profil',
      login: 'Connexion',
      logout: 'Déconnexion',
      signup: 'S\'inscrire',
      
      // Events
      activeEvents: 'Événements Actifs',
      createEvent: 'Créer un Événement',
      eventTitle: 'Titre de l\'Événement',
      eventDescription: 'Description de l\'Événement',
      eventLocation: 'Lieu de l\'Événement',
      startDate: 'Date de Début',
      endDate: 'Date de Fin',
      maxAttendees: 'Participants Maximum',
      eventType: 'Type d\'Événement',
      freeEvent: 'Événement Gratuit',
      premiumEvent: 'Événement Premium',
      adminOnlyEvent: 'Événement Admin Seulement',
      joinEvent: 'Rejoindre l\'Événement',
      leaveEvent: 'Quitter l\'Événement',
      attendees: 'Participants',
      createdOn: 'Créé le',
      
      // Membership
      freeMember: 'Membre Gratuit',
      premiumMember: 'Membre Premium',
      adminMember: 'Administrateur',
      upgradeToPremium: 'Passer au Premium',
      
      // Messages
      sendMessage: 'Envoyer un Message',
      upgradeToChat: 'Passer au Premium pour Chatter',
      messagingRestricted: 'La messagerie est disponible pour les membres premium uniquement',
      
      // Common
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      loading: 'Chargement...',
      welcomeBack: 'Content de vous revoir',
      welcome: 'Bienvenue sur la Plateforme d\'Événements',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      fullName: 'Nom Complet',
      username: 'Nom d\'utilisateur',
      
      // Additional translations
      success: 'Succès',
      error: 'Erreur',
      errorOccurred: 'Une erreur s\'est produite',
      leftEvent: 'A quitté l\'événement',
      joinedEvent: 'A rejoint l\'événement',
      upgradeToAccess: 'Passer au premium pour accéder',
      restricted: 'Restreint',
      loginToJoin: 'Se connecter pour rejoindre',
      createdBy: 'Créé par',
      passwordsMismatch: 'Les mots de passe ne correspondent pas',
      accountCreated: 'Compte créé avec succès',
      discoverEvents: 'Découvrez les événements les plus récents et passionnants',
      unlockPremiumFeatures: 'Débloquer les fonctionnalités premium',
      noEventsYet: 'Aucun événement pour le moment',
      beFirstToCreate: 'Soyez le premier à créer un événement !',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;