import i18next, { type InitOptions, i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

// Keep track of the number of iterations
let iteration = 0;

// Maximum number of iterations
const MAX_ITERATIONS = 20;

/**
 * Initialize the i18n instance on the client.
 * @param settings - the i18n settings
 * @param resolver - a function that resolves the i18n resources
 */
export async function initializeI18nClient(
  settings: InitOptions,
  resolver: (lang: string, namespace: string) => Promise<object>,
): Promise<i18n> {
  const loadedLanguages: string[] = [];
  const loadedNamespaces: string[] = [];

  /**
   * The server renders the default language so that the shell can prerender,
   * which means `<html lang>` is always the default and is useless as a signal
   * here. When the app supports more than one language, drop the explicit `lng`
   * so LanguageDetector can resolve the user's language from the `lang` cookie.
   * With a single supported language there is nothing to detect, so keep `lng`
   * and avoid the extra work.
   */
  const isMultiLanguage = (settings.supportedLngs || []).length > 1;

  await i18next
    .use(
      resourcesToBackend(async (language, namespace, callback) => {
        const data = await resolver(language, namespace);

        if (!loadedLanguages.includes(language)) {
          loadedLanguages.push(language);
        }

        if (!loadedNamespaces.includes(namespace)) {
          loadedNamespaces.push(namespace);
        }

        return callback(null, data);
      }),
    )
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(
      {
        ...settings,
        ...(isMultiLanguage ? { lng: undefined } : {}),
        detection: {
          order: ['cookie', 'navigator', 'htmlTag'],
          caches: ['cookie'],
          lookupCookie: 'lang',
        },
        interpolation: {
          escapeValue: false,
        },
      },
      (err) => {
        if (err) {
          console.error('Error initializing i18n client', err);
        }
      },
    );

  // to avoid infinite loops, we return the i18next instance after a certain number of iterations
  // even if the languages and namespaces are not loaded
  if (iteration >= MAX_ITERATIONS) {
    console.debug(`Max iterations reached: ${MAX_ITERATIONS}`);

    return i18next;
  }

  // keep component from rendering if no languages or namespaces are loaded
  if (loadedLanguages.length === 0 || loadedNamespaces.length === 0) {
    iteration++;

    console.debug(
      `Keeping component from rendering if no languages or namespaces are loaded. Iteration: ${iteration}. Will stop after ${MAX_ITERATIONS} iterations.`,
    );

    throw new Error('No languages or namespaces loaded');
  }

  return i18next;
}
