import * as z from 'zod';

import {
  NavigationConfigSchema,
  type RouteContext,
} from './navigation-config.schema';

type AccountMode = 'personal-only' | 'organizations-only' | 'hybrid';

/**
 * Determines if a navigation item should be visible based on context and mode
 */
function shouldShowNavItem(
  itemContext: RouteContext,
  currentContext: 'personal' | 'organization',
  mode: AccountMode,
): boolean {
  // In organizations-only mode, skip personal-only items
  if (mode === 'organizations-only' && itemContext === 'personal') {
    return false;
  }

  // In personal-only mode, skip organization-only items
  if (mode === 'personal-only' && itemContext === 'organization') {
    return false;
  }

  // Items for 'all' contexts are always visible
  if (itemContext === 'all') {
    return true;
  }

  // Filter by current context
  return itemContext === currentContext;
}

/**
 * Filter navigation routes based on account context and mode
 * Adapts navigation based on:
 * 1. Current context (personal vs organization)
 * 2. Account mode configuration (personal-only, organizations-only, hybrid)
 */
export function getContextAwareNavigation(
  routes: z.output<typeof NavigationConfigSchema>['routes'],
  params: {
    isOrganization: boolean;
    mode: AccountMode;
    sidebarCollapsed?: boolean;
  },
) {
  const currentContext = params.isOrganization ? 'organization' : 'personal';

  const filteredRoutes = routes
    .map((section) => {
      // Pass through dividers unchanged
      if ('divider' in section) {
        return section;
      }

      const filteredChildren = section.children
        .filter((child) =>
          shouldShowNavItem(
            child.context ?? 'all',
            currentContext,
            params.mode,
          ),
        )
        .map((child) => {
          // Filter nested children if present
          if (child.children && child.children.length > 0) {
            const filteredNestedChildren = child.children.filter((subChild) =>
              shouldShowNavItem(
                subChild.context ?? 'all',
                currentContext,
                params.mode,
              ),
            );

            return {
              ...child,
              children: filteredNestedChildren,
            };
          }

          return child;
        });

      // Skip empty sections
      if (filteredChildren.length === 0) {
        return null;
      }

      return {
        ...section,
        children: filteredChildren,
      };
    })
    .filter((section) => section !== null);

  return NavigationConfigSchema.parse({
    routes: filteredRoutes,
    sidebarCollapsed: params.sidebarCollapsed ?? false,
  });
}
