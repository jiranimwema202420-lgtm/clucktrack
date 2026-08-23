'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'hi';

export interface Translation {
  nav: {
    dashboard: string;
    inventory: string;
    sales: string;
    expenditure: string;
    contacts: string;
    financials: string;
    reports: string;
    feedAI: string;
    healthAI: string;
    poultryQA: string;
    settings: string;
    help: string;
  };
  sections: {
    main: string;
    farm: string;
    analytics: string;
    aiTools: string;
    general: string;
  };
  dashboard: {
    avgWeight: string;
    fcr: string;
    avgEggProd: string;
    totalFlock: string;
    flockGrowth: string;
    environmentalControl: string;
    temperature: string;
    humidity: string;
    ventilation: string;
    applyChanges: string;
    aiFeedOptimizer: string;
    aiHealthPredictor: string;
    optimizeFeed: string;
    predictHealth: string;
    acrossAllFlocks: string;
    feedConversionRatio: string;
    totalEggs: string;
    activeFlocks: string;
    weightGain: string;
    remotelyAdjust: string;
    analyzeConsumption: string;
    useHistorical: string;
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    signUp: string;
    email: string;
    password: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    anonymous: string;
    member: string;
    myAccount: string;
  };
}

const translations: Record<Language, Translation> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      sales: 'Sales',
      expenditure: 'Expenditure',
      contacts: 'Contacts',
      financials: 'Financials',
      reports: 'Reports',
      feedAI: 'Feed AI',
      healthAI: 'Health AI',
      poultryQA: 'Poultry Q&A',
      settings: 'Settings',
      help: 'Help',
    },
    sections: {
      main: 'Main',
      farm: 'Farm',
      analytics: 'Analytics',
      aiTools: 'AI Tools',
      general: 'General',
    },
    dashboard: {
      avgWeight: 'Avg. Weight (Broilers)',
      fcr: 'FCR (Broilers)',
      avgEggProd: 'Avg Egg Prod. (Layers)',
      totalFlock: 'Total Flock Size',
      flockGrowth: 'Flock Growth Projection',
      environmentalControl: 'Environmental Control',
      temperature: 'Temperature',
      humidity: 'Humidity',
      ventilation: 'Ventilation (Ammonia)',
      applyChanges: 'Apply Changes',
      aiFeedOptimizer: 'AI Feed Optimizer',
      aiHealthPredictor: 'AI Health Predictor',
      optimizeFeed: 'Optimize Feed Mix',
      predictHealth: 'Predict Health Issues',
      acrossAllFlocks: 'Across all broiler flocks',
      feedConversionRatio: 'Feed Conversion Ratio',
      totalEggs: 'total eggs',
      activeFlocks: 'active flocks',
      weightGain: 'Average weight gain for a typical broiler flock.',
      remotelyAdjust: 'Remotely adjust farm conditions.',
      analyzeConsumption: 'Analyze consumption patterns and nutrient requirements to get the optimal feed mix for growth and cost-efficiency.',
      useHistorical: 'Use historical and real-time data to forecast potential health issues and receive proactive alerts.',
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      anonymous: 'Anonymous',
      member: 'Member',
      myAccount: 'My Account',
    },
  },
  es: {
    nav: {
      dashboard: 'Panel de Control',
      inventory: 'Inventario',
      sales: 'Ventas',
      expenditure: 'Gastos',
      contacts: 'Contactos',
      financials: 'Finanzas',
      reports: 'Informes',
      feedAI: 'IA de Alimentación',
      healthAI: 'IA de Salud',
      poultryQA: 'Preguntas y Respuestas',
      settings: 'Configuración',
      help: 'Ayuda',
    },
    sections: {
      main: 'Principal',
      farm: 'Granja',
      analytics: 'Análisis',
      aiTools: 'Herramientas IA',
      general: 'General',
    },
    dashboard: {
      avgWeight: 'Peso Promedio (Pollos de Engorde)',
      fcr: 'TCA (Pollos de Engorde)',
      avgEggProd: 'Prod. Huevos Promedio (Gallinas Ponedoras)',
      totalFlock: 'Tamaño Total del Rebaño',
      flockGrowth: 'Proyección de Crecimiento del Rebaño',
      environmentalControl: 'Control Ambiental',
      temperature: 'Temperatura',
      humidity: 'Humedad',
      ventilation: 'Ventilación (Amoníaco)',
      applyChanges: 'Aplicar Cambios',
      aiFeedOptimizer: 'Optimizador de Alimentación IA',
      aiHealthPredictor: 'Predictor de Salud IA',
      optimizeFeed: 'Optimizar Mezcla de Alimento',
      predictHealth: 'Predecir Problemas de Salud',
      acrossAllFlocks: 'En todos los rebaños de pollos de engorde',
      feedConversionRatio: 'Tasa de Conversión Alimenticia',
      totalEggs: 'huevos totales',
      activeFlocks: 'rebaños activos',
      weightGain: 'Ganancia de peso promedio para un rebaño típico de pollos de engorde.',
      remotelyAdjust: 'Ajuste remoto de las condiciones de la granja.',
      analyzeConsumption: 'Analice los patrones de consumo y los requisitos de nutrientes para obtener la mezcla óptima de alimento.',
      useHistorical: 'Utilice datos históricos y en tiempo real para prever posibles problemas de salud.',
    },
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
    },
    auth: {
      signIn: 'Iniciar Sesión',
      signOut: 'Cerrar Sesión',
      signUp: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidó su contraseña?',
      noAccount: '¿No tiene una cuenta?',
      hasAccount: '¿Ya tiene una cuenta?',
      anonymous: 'Anónimo',
      member: 'Miembro',
      myAccount: 'Mi Cuenta',
    },
  },
  fr: {
    nav: {
      dashboard: 'Tableau de Bord',
      inventory: 'Inventaire',
      sales: 'Ventes',
      expenditure: 'Dépenses',
      contacts: 'Contacts',
      financials: 'Finances',
      reports: 'Rapports',
      feedAI: 'IA Alimentation',
      healthAI: 'IA Santé',
      poultryQA: 'Q&R Volailles',
      settings: 'Paramètres',
      help: 'Aide',
    },
    sections: {
      main: 'Principal',
      farm: 'Ferme',
      analytics: 'Analytique',
      aiTools: 'Outils IA',
      general: 'Général',
    },
    dashboard: {
      avgWeight: 'Poids Moy. (Poulets de Chair)',
      fcr: 'ICA (Poulets de Chair)',
      avgEggProd: 'Prod. Œufs Moy. (Poules Pondeuses)',
      totalFlock: 'Taille Totale du Troupeau',
      flockGrowth: 'Projection de Croissance du Troupeau',
      environmentalControl: 'Contrôle Environnemental',
      temperature: 'Température',
      humidity: 'Humidité',
      ventilation: 'Ventilation (Ammoniac)',
      applyChanges: 'Appliquer les Modifications',
      aiFeedOptimizer: 'Optimiseur d\'Alimentation IA',
      aiHealthPredictor: 'Prédicteur de Santé IA',
      optimizeFeed: 'Optimiser le Mélange d\'Aliment',
      predictHealth: 'Prédire les Problèmes de Santé',
      acrossAllFlocks: 'Dans tous les troupeaux de poulets de chair',
      feedConversionRatio: 'Taux de Conversion Alimentaire',
      totalEggs: 'œufs totaux',
      activeFlocks: 'troupeaux actifs',
      weightGain: 'Gain de poids moyen pour un troupeau typique de poulets de chair.',
      remotelyAdjust: 'Ajustez à distance les conditions de la ferme.',
      analyzeConsumption: 'Analysez les modèles de consommation et les besoins nutritionnels.',
      useHistorical: 'Utilisez les données historiques et en temps réel pour prévoir les problèmes de santé.',
    },
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer',
      success: 'Succès',
      error: 'Erreur',
      warning: 'Avertissement',
      info: 'Info',
    },
    auth: {
      signIn: 'Se Connecter',
      signOut: 'Se Déconnecter',
      signUp: "S'inscrire",
      email: 'Email',
      password: 'Mot de Passe',
      forgotPassword: 'Mot de passe oublié?',
      noAccount: 'Vous n\'avez pas de compte?',
      hasAccount: 'Vous avez déjà un compte?',
      anonymous: 'Anonyme',
      member: 'Membre',
      myAccount: 'Mon Compte',
    },
  },
  de: {
    nav: {
      dashboard: 'Dashboard',
      inventory: 'Inventar',
      sales: 'Verkäufe',
      expenditure: 'Ausgaben',
      contacts: 'Kontakte',
      financials: 'Finanzen',
      reports: 'Berichte',
      feedAI: 'Futter-KI',
      healthAI: 'Gesundheits-KI',
      poultryQA: 'Geflügel Q&A',
      settings: 'Einstellungen',
      help: 'Hilfe',
    },
    sections: {
      main: 'Haupt',
      farm: 'Bauernhof',
      analytics: 'Analytik',
      aiTools: 'KI-Tools',
      general: 'Allgemein',
    },
    dashboard: {
      avgWeight: 'Durchschn. Gewicht (Masthähnchen)',
      fcr: 'FCR (Masthähnchen)',
      avgEggProd: 'Durchschn. Eierprod. (Legehennen)',
      totalFlock: 'Gesamte Herdengröße',
      flockGrowth: 'Herdenwachstumsprognose',
      environmentalControl: 'Umweltsteuerung',
      temperature: 'Temperatur',
      humidity: 'Luftfeuchtigkeit',
      ventilation: 'Belüftung (Ammoniak)',
      applyChanges: 'Änderungen Anwenden',
      aiFeedOptimizer: 'KI-Futtermitteloptimierer',
      aiHealthPredictor: 'KI-Gesundheitsvorhersage',
      optimizeFeed: 'Futtermischung Optimieren',
      predictHealth: 'Gesundheitsprobleme Vorhersagen',
      acrossAllFlocks: 'Über alle Masthähnchenherden',
      feedConversionRatio: 'Futterverwertungsverhältnis',
      totalEggs: 'Gesamteier',
      activeFlocks: 'aktive Herden',
      weightGain: 'Durchschnittliche Gewichtszunahme für eine typische Masthähnchenherde.',
      remotelyAdjust: 'Ferngesteuerte Anpassung der Betriebsbedingungen.',
      analyzeConsumption: 'Analysieren Sie Verbrauchsmuster und Nährstoffanforderungen.',
      useHistorical: 'Nutzen Sie historische und Echtzeitdaten zur Vorhersage von Gesundheitsproblemen.',
    },
    common: {
      loading: 'Laden...',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      search: 'Suchen',
      filter: 'Filtern',
      export: 'Exportieren',
      import: 'Importieren',
      success: 'Erfolg',
      error: 'Fehler',
      warning: 'Warnung',
      info: 'Info',
    },
    auth: {
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      signUp: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Kein Konto?',
      hasAccount: 'Bereits ein Konto?',
      anonymous: 'Anonym',
      member: 'Mitglied',
      myAccount: 'Mein Konto',
    },
  },
  pt: {
    nav: {
      dashboard: 'Painel de Controle',
      inventory: 'Inventário',
      sales: 'Vendas',
      expenditure: 'Despesas',
      contacts: 'Contatos',
      financials: 'Finanças',
      reports: 'Relatórios',
      feedAI: 'IA de Alimentação',
      healthAI: 'IA de Saúde',
      poultryQA: 'Perguntas e Respostas',
      settings: 'Configurações',
      help: 'Ajuda',
    },
    sections: {
      main: 'Principal',
      farm: 'Fazenda',
      analytics: 'Análises',
      aiTools: 'Ferramentas IA',
      general: 'Geral',
    },
    dashboard: {
      avgWeight: 'Peso Médio (Frangos de Corte)',
      fcr: 'TCA (Frangos de Corte)',
      avgEggProd: 'Prod. Ovos Média (Galinhas Poedeiras)',
      totalFlock: 'Tamanho Total do Rebanho',
      flockGrowth: 'Projeção de Crescimento do Rebanho',
      environmentalControl: 'Controle Ambiental',
      temperature: 'Temperatura',
      humidity: 'Umidade',
      ventilation: 'Ventilação (Amônia)',
      applyChanges: 'Aplicar Alterações',
      aiFeedOptimizer: 'Otimizador de Alimentação IA',
      aiHealthPredictor: 'Preditores de Saúde IA',
      optimizeFeed: 'Otimizar Mistura de Ração',
      predictHealth: 'Prever Problemas de Saúde',
      acrossAllFlocks: 'Em todos os rebanhos de frangos de corte',
      feedConversionRatio: 'Taxa de Conversão Alimentar',
      totalEggs: 'ovos totais',
      activeFlocks: 'rebanhos ativos',
      weightGain: 'Ganho de peso médio para um rebanho típico de frangos de corte.',
      remotelyAdjust: 'Ajuste remotamente as condições da fazenda.',
      analyzeConsumption: 'Analise padrões de consumo e requisitos nutricionais.',
      useHistorical: 'Use dados históricos e em tempo real para prever problemas de saúde.',
    },
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      search: 'Pesquisar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Info',
    },
    auth: {
      signIn: 'Entrar',
      signOut: 'Sair',
      signUp: 'Cadastrar',
      email: 'E-mail',
      password: 'Senha',
      forgotPassword: 'Esqueceu a senha?',
      noAccount: 'Não tem uma conta?',
      hasAccount: 'Já tem uma conta?',
      anonymous: 'Anônimo',
      member: 'Membro',
      myAccount: 'Minha Conta',
    },
  },
  zh: {
    nav: {
      dashboard: '仪表板',
      inventory: '库存',
      sales: '销售',
      expenditure: '支出',
      contacts: '联系人',
      financials: '财务',
      reports: '报告',
      feedAI: '饲料 AI',
      healthAI: '健康 AI',
      poultryQA: '家禽问答',
      settings: '设置',
      help: '帮助',
    },
    sections: {
      main: '主要',
      farm: '农场',
      analytics: '分析',
      aiTools: 'AI 工具',
      general: '常规',
    },
    dashboard: {
      avgWeight: '平均体重（肉鸡）',
      fcr: '料肉比（肉鸡）',
      avgEggProd: '平均产蛋率（蛋鸡）',
      totalFlock: '总群规模',
      flockGrowth: '群体增长预测',
      environmentalControl: '环境控制',
      temperature: '温度',
      humidity: '湿度',
      ventilation: '通风（氨气）',
      applyChanges: '应用更改',
      aiFeedOptimizer: 'AI 饲料优化器',
      aiHealthPredictor: 'AI 健康预测器',
      optimizeFeed: '优化饲料配方',
      predictHealth: '预测健康问题',
      acrossAllFlocks: '所有肉鸡群',
      feedConversionRatio: '饲料转化率',
      totalEggs: '总蛋数',
      activeFlocks: '活跃群组',
      weightGain: '典型肉鸡群的平均增重。',
      remotelyAdjust: '远程调整农场条件。',
      analyzeConsumption: '分析消费模式和营养需求。',
      useHistorical: '使用历史和实时数据预测潜在健康问题。',
    },
    common: {
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      filter: '筛选',
      export: '导出',
      import: '导入',
      success: '成功',
      error: '错误',
      warning: '警告',
      info: '信息',
    },
    auth: {
      signIn: '登录',
      signOut: '登出',
      signUp: '注册',
      email: '电子邮件',
      password: '密码',
      forgotPassword: '忘记密码？',
      noAccount: '没有账户？',
      hasAccount: '已有账户？',
      anonymous: '匿名',
      member: '会员',
      myAccount: '我的账户',
    },
  },
  hi: {
    nav: {
      dashboard: 'डैशबोर्ड',
      inventory: 'सूची',
      sales: 'बिक्री',
      expenditure: 'व्यय',
      contacts: 'संपर्क',
      financials: 'वित्त',
      reports: 'रिपोर्ट',
      feedAI: 'फीड एआई',
      healthAI: 'स्वास्थ्य एआई',
      poultryQA: 'पोल्ट्री प्रश्नोत्तर',
      settings: 'सेटिंग्स',
      help: 'सहायता',
    },
    sections: {
      main: 'मुख्य',
      farm: 'फार्म',
      analytics: 'विश्लेषण',
      aiTools: 'एआई उपकरण',
      general: 'सामान्य',
    },
    dashboard: {
      avgWeight: 'औसत वजन (ब्रॉयलर)',
      fcr: 'एफसीआर (ब्रॉयलर)',
      avgEggProd: 'औसत अंडा उत्पादन (लेयर्स)',
      totalFlock: 'कुल झुंड का आकार',
      flockGrowth: 'झुंड विकास अनुमान',
      environmentalControl: 'पर्यावरण नियंत्रण',
      temperature: 'तापमान',
      humidity: 'आर्द्रता',
      ventilation: 'वेंटिलेशन (अमोनिया)',
      applyChanges: 'परिवर्तन लागू करें',
      aiFeedOptimizer: 'एआई फीड ऑप्टिमाइज़र',
      aiHealthPredictor: 'एआई स्वास्थ्य भविष्यवक्ता',
      optimizeFeed: 'फीड मिश्रण अनुकूलित करें',
      predictHealth: 'स्वास्थ्य समस्याओं की भविष्यवाणी करें',
      acrossAllFlocks: 'सभी ब्रॉयलर झुंडों में',
      feedConversionRatio: 'फीड रूपांतरण अनुपात',
      totalEggs: 'कुल अंडे',
      activeFlocks: 'सक्रिय झुंड',
      weightGain: 'एक विशिष्ट ब्रॉयलर झुंड के लिए औसत वजन लाभ।',
      remotelyAdjust: 'फार्म की स्थितियों को दूरस्थ रूप से समायोजित करें।',
      analyzeConsumption: 'उपभोग पैटर्न और पोषक तत्व आवश्यकताओं का विश्लेषण करें।',
      useHistorical: 'संभावित स्वास्थ्य समस्याओं की भविष्यवाणी करने के लिए ऐतिहासिक और वास्तविक समय डेटा का उपयोग करें।',
    },
    common: {
      loading: 'लोड हो रहा है...',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      add: 'जोड़ें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      export: 'निर्यात',
      import: 'आयात',
      success: 'सफलता',
      error: 'त्रुटि',
      warning: 'चेतावनी',
      info: 'जानकारी',
    },
    auth: {
      signIn: 'साइन इन',
      signOut: 'साइन आउट',
      signUp: 'साइन अप',
      email: 'ईमेल',
      password: 'पासवर्ड',
      forgotPassword: 'पासवर्ड भूल गए?',
      noAccount: 'खाता नहीं है?',
      hasAccount: 'पहले से खाता है?',
      anonymous: 'अनाम',
      member: 'सदस्य',
      myAccount: 'मेरा खाता',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Try to get language from localStorage or browser
    const savedLang = localStorage.getItem('clucktrack_language') as Language | null;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.slice(0, 2) as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('clucktrack_language', lang);
    document.documentElement.lang = lang;
  };

  const dir: 'ltr' | 'rtl' = 'ltr'; // Can be extended for RTL languages like Arabic

  const value = {
    language,
    setLanguage,
    t: translations[language],
    dir,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
