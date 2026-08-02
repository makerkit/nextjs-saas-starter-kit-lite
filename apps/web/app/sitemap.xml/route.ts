import { cacheLife } from 'next/cache';

import { getServerSideSitemap } from 'next-sitemap';

import appConfig from '~/config/app.config';

/**
 * @description The maximum age of the sitemap in seconds.
 * This is used to set the cache-control header for the sitemap. The cache-control header is used to control how long the sitemap is cached.
 * By default, the cache-control header is set to 'public, max-age=600, s-maxage=3600'.
 * This means that the sitemap will be cached for 600 seconds (10 minutes) and will be considered stale after 3600 seconds (1 hour).
 */
const MAX_AGE = 60;
const S_MAX_AGE = 3600;

export async function GET() {
  const paths = await getPaths();

  const headers = {
    'Cache-Control': `public, max-age=${MAX_AGE}, s-maxage=${S_MAX_AGE}`,
  };

  return getServerSideSitemap([...paths], headers);
}

/**
 * Cached because `lastmod` reads the clock, and an unstable value drops the
 * whole route to per-request rendering. The cache wraps the paths rather than
 * the handler: `getServerSideSitemap` returns a Response, which is a class
 * instance and cannot cross a `use cache` boundary.
 */
async function getPaths() {
  'use cache';

  cacheLife('days');

  const paths = [
    '/',
    '/faq',
    '/cookie-policy',
    '/terms-of-service',
    '/privacy-policy',
    // add more paths here
  ];

  return paths.map((path) => {
    return {
      loc: new URL(path, appConfig.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}
