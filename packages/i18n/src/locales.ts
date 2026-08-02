import { defaultLocale } from './default-locale';

/**
 * @name locales
 * @description Supported locales
 * @type {string[]}
 * @default [defaultLocale]
 *
 * This kit has no `[locale]` route segment, so the server always renders
 * `defaultLocale` — see `apps/web/i18n/request.ts` for why. Adding locales here
 * is supported, but read that file first: the trade-off it documents applies.
 */
export const locales: string[] = [
  defaultLocale,
  // Add other locales here as needed
  // Example: 'es', 'fr', 'de', etc.
];
