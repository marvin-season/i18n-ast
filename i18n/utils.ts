import data from './languages.json';

const loadLangResources = async (lang: string) => {
  const commonModule = await import(`./${lang}/common.ts`);
  const workflowModule = await import(`./${lang}/workflow.ts`);
  const customModule = await import(`./${lang}/custom.ts`);
  const runLogModule = await import(`./${lang}/run-log.ts`);
  const appDebgModule = await import(`./${lang}/app-debug.ts`);

  return {
    translation: {
      custom: customModule.default,
      common: commonModule.default,
      workflow: workflowModule.default,
      runLog: runLogModule.default,
      appDebug: appDebgModule.default,
    },
  };
};

export const languages = data.languages;

export const LanguagesSupported = languages.filter((item) => item.supported).map((item) => item.value);

export const getResources = async () =>
  LanguagesSupported.reduce(async (accPromise: Promise<Record<string, any>>, lang: string) => {
    const acc = await accPromise;
    acc[lang] = await loadLangResources(lang);
    return acc;
  }, Promise.resolve({}));
