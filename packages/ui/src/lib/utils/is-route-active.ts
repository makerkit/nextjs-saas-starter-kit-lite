const ROOT_PATH = '/';

export type RouteActiveOptions = {
  locale?: string;
  locales?: string[];
};

/**
 * @name isRouteActive
 * @description Check if a route is active for navigation highlighting.
 *
 * Default behavior: prefix matching (highlights parent when on child routes)
 * Custom behavior: provide a regex pattern via highlightMatch
 *
 * @param path - The navigation item's path
 * @param currentPath - The current browser path
 * @param highlightMatch - Optional regex pattern for custom matching
 * @param options - Locale options for path normalization
 *
 * @example
 * // Default: /projects highlights for /projects, /projects/123, /projects/123/edit
 * isRouteActive('/projects', '/projects/123')  // true
 *
 * // Exact match only
 * isRouteActive('/dashboard', '/dashboard/stats', '^/dashboard$')  // false
 *
 * // Multiple paths
 * isRouteActive('/projects', '/settings/projects', '^/(projects|settings/projects)')  // true
 */
export function isRouteActive(
  path: string,
  currentPath: string,
  highlightMatch?: string,
  options?: RouteActiveOptions,
) {
  const locale =
    options?.locale ?? detectLocaleFromPath(currentPath, options?.locales);

  const normalizedPath = normalizePath(path, { ...options, locale });
  const normalizedCurrentPath = normalizePath(currentPath, {
    ...options,
    locale,
  });

  // Exact match always returns true
  if (normalizedPath === normalizedCurrentPath) {
    return true;
  }

  // Custom regex match
  if (highlightMatch) {
    const regex = new RegExp(highlightMatch);
    return regex.test(normalizedCurrentPath);
  }

  // Default: prefix matching - highlight when current path starts with nav path
  // Special case: root path should only match exactly
  if (normalizedPath === ROOT_PATH) {
    return false;
  }

  return (
    normalizedCurrentPath.startsWith(normalizedPath + '/') ||
    normalizedCurrentPath === normalizedPath
  );
}

function splitIntoSegments(href: string) {
  return href.split('/').filter(Boolean);
}

function normalizePath(path: string, options?: RouteActiveOptions) {
  const [pathname = ROOT_PATH] = path.split('?');
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname || ROOT_PATH;

  if (!options?.locale && !options?.locales?.length) {
    return normalizedPath || ROOT_PATH;
  }

  const locale =
    options?.locale ?? detectLocaleFromPath(normalizedPath, options?.locales);

  if (!locale || !hasLocalePrefix(normalizedPath, locale)) {
    return normalizedPath || ROOT_PATH;
  }

  return stripLocalePrefix(normalizedPath, locale);
}

function detectLocaleFromPath(
  path: string,
  locales: string[] | undefined,
): string | undefined {
  if (!locales?.length) {
    return undefined;
  }

  const [firstSegment] = splitIntoSegments(path);

  if (!firstSegment) {
    return undefined;
  }

  return locales.find(
    (locale) => locale.toLowerCase() === firstSegment.toLowerCase(),
  );
}

function hasLocalePrefix(path: string, locale: string) {
  return path === `/${locale}` || path.startsWith(`/${locale}/`);
}

function stripLocalePrefix(path: string, locale: string) {
  if (!hasLocalePrefix(path, locale)) {
    return path || ROOT_PATH;
  }

  const withoutPrefix = path.slice(locale.length + 1);

  if (!withoutPrefix) {
    return ROOT_PATH;
  }

  return withoutPrefix.startsWith('/') ? withoutPrefix : `/${withoutPrefix}`;
}
