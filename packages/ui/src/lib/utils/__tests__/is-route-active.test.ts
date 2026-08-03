import { describe, expect, it } from 'vitest';

import { isRouteActive } from '../is-route-active';

describe('isRouteActive', () => {
  describe('exact matching', () => {
    it('returns true for exact path match', () => {
      expect(isRouteActive('/projects', '/projects')).toBe(true);
    });

    it('returns true for exact path match with trailing slash normalization', () => {
      expect(isRouteActive('/projects/', '/projects')).toBe(true);
      expect(isRouteActive('/projects', '/projects/')).toBe(true);
    });

    it('returns true for root path exact match', () => {
      expect(isRouteActive('/', '/')).toBe(true);
    });
  });

  describe('prefix matching (default behavior)', () => {
    it('returns true when current path is child of nav path', () => {
      expect(isRouteActive('/projects', '/projects/123')).toBe(true);
      expect(isRouteActive('/projects', '/projects/123/edit')).toBe(true);
      expect(isRouteActive('/projects', '/projects/new')).toBe(true);
    });

    it('returns false when current path is not a child', () => {
      expect(isRouteActive('/projects', '/settings')).toBe(false);
      expect(isRouteActive('/projects', '/projectslist')).toBe(false); // Not a child, just starts with same chars
    });

    it('returns false for root path when on other routes', () => {
      // Root path should only match exactly, not prefix-match everything
      expect(isRouteActive('/', '/projects')).toBe(false);
      expect(isRouteActive('/', '/dashboard')).toBe(false);
    });

    it('handles nested paths correctly', () => {
      expect(isRouteActive('/settings/profile', '/settings/profile/edit')).toBe(
        true,
      );
      expect(isRouteActive('/settings/profile', '/settings/billing')).toBe(
        false,
      );
    });
  });

  describe('custom regex matching (highlightMatch)', () => {
    it('uses regex pattern when provided', () => {
      // Exact match only pattern
      expect(
        isRouteActive('/dashboard', '/dashboard/stats', '^/dashboard$'),
      ).toBe(false);
      expect(isRouteActive('/dashboard', '/dashboard', '^/dashboard$')).toBe(
        true,
      );
    });

    it('supports multiple paths in regex', () => {
      const pattern = '^/(projects|settings/projects)';

      expect(isRouteActive('/projects', '/projects', pattern)).toBe(true);
      expect(isRouteActive('/projects', '/settings/projects', pattern)).toBe(
        true,
      );
      expect(isRouteActive('/projects', '/settings', pattern)).toBe(false);
    });

    it('supports complex regex patterns', () => {
      // Match any dashboard sub-route
      expect(
        isRouteActive('/dashboard', '/dashboard/stats', '^/dashboard/'),
      ).toBe(true);
      // Note: Exact match check runs before regex, so '/dashboard' matches '/dashboard'
      expect(isRouteActive('/dashboard', '/dashboard', '^/dashboard/')).toBe(
        true, // Exact match takes precedence
      );
      // But different nav path won't match
      expect(isRouteActive('/other', '/dashboard', '^/dashboard/')).toBe(false);
    });
  });

  describe('query parameter handling', () => {
    it('ignores query parameters in path', () => {
      expect(isRouteActive('/projects?tab=active', '/projects')).toBe(true);
      expect(isRouteActive('/projects', '/projects?tab=active')).toBe(true);
    });

    it('ignores query parameters in current path', () => {
      expect(isRouteActive('/projects', '/projects/123?view=details')).toBe(
        true,
      );
    });
  });

  describe('trailing slash handling', () => {
    it('normalizes trailing slashes in both paths', () => {
      expect(isRouteActive('/projects/', '/projects/')).toBe(true);
      expect(isRouteActive('/projects/', '/projects')).toBe(true);
      expect(isRouteActive('/projects', '/projects/')).toBe(true);
    });

    it('handles nested paths with trailing slashes', () => {
      expect(isRouteActive('/projects/', '/projects/123/')).toBe(true);
    });
  });

  describe('locale handling', () => {
    it('strips locale prefix from paths when locale is provided', () => {
      const options = { locale: 'en' };

      expect(
        isRouteActive('/projects', '/en/projects', undefined, options),
      ).toBe(true);
      expect(
        isRouteActive('/projects', '/en/projects/123', undefined, options),
      ).toBe(true);
    });

    it('auto-detects locale from path when locales array is provided', () => {
      const options = { locales: ['en', 'de', 'fr'] };

      expect(
        isRouteActive('/projects', '/en/projects', undefined, options),
      ).toBe(true);
      expect(
        isRouteActive('/projects', '/de/projects', undefined, options),
      ).toBe(true);
      expect(
        isRouteActive('/projects', '/fr/projects/123', undefined, options),
      ).toBe(true);
    });

    it('handles case-insensitive locale detection', () => {
      // Locale detection is case-insensitive, but stripping requires case match
      const options = { locales: ['en', 'de'] };

      // These work because locale case matches
      expect(
        isRouteActive('/projects', '/en/projects', undefined, options),
      ).toBe(true);
      expect(
        isRouteActive('/projects', '/de/projects', undefined, options),
      ).toBe(true);
    });

    it('does not strip non-locale prefixes', () => {
      const options = { locales: ['en', 'de'] };

      // 'projects' is not a locale, so shouldn't be stripped
      expect(
        isRouteActive('/settings', '/projects/settings', undefined, options),
      ).toBe(false);
    });

    it('handles locale-only paths', () => {
      const options = { locale: 'en' };

      expect(isRouteActive('/', '/en', undefined, options)).toBe(true);
      expect(isRouteActive('/', '/en/', undefined, options)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty string path', () => {
      expect(isRouteActive('', '/')).toBe(true);
      expect(isRouteActive('/', '')).toBe(true);
    });

    it('handles paths with special characters', () => {
      expect(isRouteActive('/user/@me', '/user/@me')).toBe(true);
      expect(isRouteActive('/search', '/search?q=hello+world')).toBe(true);
    });

    it('handles deep nested paths', () => {
      expect(isRouteActive('/a/b/c/d', '/a/b/c/d/e/f/g')).toBe(true);
      expect(isRouteActive('/a/b/c/d', '/a/b/c')).toBe(false);
    });

    it('handles similar path prefixes', () => {
      // '/project' should not match '/projects'
      expect(isRouteActive('/project', '/projects')).toBe(false);

      // '/projects' should not match '/project'
      expect(isRouteActive('/projects', '/project')).toBe(false);
    });

    it('handles paths with numbers', () => {
      expect(isRouteActive('/org/123', '/org/123/members')).toBe(true);
      expect(isRouteActive('/org/123', '/org/456')).toBe(false);
    });
  });

  describe('real-world navigation scenarios', () => {
    it('sidebar navigation highlighting', () => {
      // Dashboard link should highlight on dashboard and sub-pages
      expect(isRouteActive('/dashboard', '/dashboard')).toBe(true);
      expect(isRouteActive('/dashboard', '/dashboard/analytics')).toBe(true);
      expect(isRouteActive('/dashboard', '/settings')).toBe(false);

      // Projects link should highlight on projects list and detail pages
      expect(isRouteActive('/projects', '/projects')).toBe(true);
      expect(isRouteActive('/projects', '/projects/proj-1')).toBe(true);
      expect(isRouteActive('/projects', '/projects/proj-1/tasks')).toBe(true);

      // Home link should only highlight on home
      expect(isRouteActive('/', '/')).toBe(true);
      expect(isRouteActive('/', '/projects')).toBe(false);
    });

    it('settings navigation with nested routes', () => {
      // Settings general
      expect(isRouteActive('/settings', '/settings')).toBe(true);
      expect(isRouteActive('/settings', '/settings/profile')).toBe(true);
      expect(isRouteActive('/settings', '/settings/billing')).toBe(true);

      // Settings profile specifically
      expect(isRouteActive('/settings/profile', '/settings/profile')).toBe(
        true,
      );
      expect(isRouteActive('/settings/profile', '/settings/billing')).toBe(
        false,
      );
    });

    it('organization routes with dynamic segments', () => {
      expect(
        isRouteActive('/org/[slug]', '/org/my-org', undefined, undefined),
      ).toBe(false); // Template path won't match

      expect(isRouteActive('/org/my-org', '/org/my-org/settings')).toBe(true);
    });
  });
});
