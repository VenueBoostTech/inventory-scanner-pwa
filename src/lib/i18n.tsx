import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import enTranslations from '@/locales/en.json';
import sqTranslations from '@/locales/sq.json';

type Language = 'en' | 'sq';
type TranslationKey = string;

const translations = {
  en: enTranslations as Record<string, any>,
  sq: sqTranslations as Record<string, any>,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or profile, default to 'en'
    const saved = localStorage.getItem('app-language');
    if (saved === 'sq' || saved === 'al') return 'sq';
    // Try to get from authStore if available
    try {
      const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const profileLang = authState?.state?.profile?.preferences?.language;
      if (profileLang === 'sq' || profileLang === 'al') return 'sq';
    } catch {
      // Ignore errors
    }
    return 'en';
  });

  // Sync with profile language on mount
  useEffect(() => {
    try {
      const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const profileLang = authState?.state?.profile?.preferences?.language;
      if (profileLang === 'sq' || profileLang === 'al') {
        if (language !== 'sq') {
          setLanguageState('sq');
          localStorage.setItem('app-language', 'sq');
        }
      } else if (profileLang === 'en' && language !== 'en') {
        setLanguageState('en');
        localStorage.setItem('app-language', 'en');
      }
    } catch {
      // Ignore errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
    // Also update profile if available
    try {
      const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      if (authState?.state?.profile) {
        authState.state.profile.preferences = {
          ...authState.state.profile.preferences,
          language: lang === 'sq' ? 'al' : 'en', // Map sq to al for profile
        };
        localStorage.setItem('auth-storage', JSON.stringify(authState));
      }
    } catch {
      // Ignore errors
    }
  };

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    // Try current language first
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            // If still not found, return the full key
            return key;
          }
        }
        break;
      }
    }

    // Return the value if it's a string, otherwise return the key
    if (typeof value === 'string') {
      return value;
    }
    // If value is not a string, return the full key (not just the last part)
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
