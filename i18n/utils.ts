import data from './languages.json';

const loadLangResources = async (lang: string) => {

  const chat = await import(`./${lang}/chat.ts`);

  return {
    translation: {
      chat: chat.default,
    },
  };
};

export const languages = data.languages;

export const LanguagesSupported = languages
  .filter((item) => item.supported)
  .map((item) => item.value);

export const getResources = () =>
  LanguagesSupported.reduce(
    async (accPromise: Promise<Record<string, any>>, lang: string) => {
      const acc = await accPromise;
      acc[lang] = await loadLangResources(lang);
      return acc;
    },
    Promise.resolve({}),
  );
