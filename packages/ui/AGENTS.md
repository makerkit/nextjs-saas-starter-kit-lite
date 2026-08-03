# @kit/ui — UI Components & Styling

## Component Library

This project uses **Base UI** (not Radix UI). Key differences:

- NEVER use `asChild` prop — Base UI uses `render` prop for element composition
- ALWAYS use the `render` prop pattern when you need to render a custom element (e.g., `<Button nativeButton={false} render={<Link />} />`)

## Non-Negotiables

1. ALWAYS import as `@kit/ui/<name>` — no deep paths, no matter the folder structure
2. ALWAYS use `cn()` from `@kit/ui/utils` for class merging
3. ALWAYS use semantic Tailwind classes (`bg-background`, `text-muted-foreground`) — NEVER hardcoded colors (`bg-white`, `text-gray-500`)
4. ALWAYS add `data-test` attributes on interactive elements
5. ALWAYS add `FormMessage` to every form field for error display
6. ALWAYS consider error-handling, not just happy paths.
7. ALWAYS Ensure UI surfaces useful and human-readable errors, not internal ones.
8. NEVER add generics to `useForm` — let Zod resolver infer types
9. NEVER use `watch()` — use `useWatch` hook instead when using React Hook Form
10. NEVER use Radix UI patterns (`asChild`, `@radix-ui/*` imports) — this project uses Base UI
11. NEVER edit files in `src/shadcn/` to add project-specific behavior. Those files mirror upstream shadcn so the shadcn CLI can replace them (e.g., when switching themes). Project additions belong in `src/makerkit/` instead.

## Customizing shadcn primitives

`src/shadcn/` is treated as upstream-owned. The shadcn CLI may overwrite any file there at any time, so anything custom you put in those files will be silently lost on the next theme/component sync.

When you need to extend a shadcn primitive, use one of these patterns and keep `src/shadcn/<name>.tsx` untouched:

- **Wrap and re-export** — for behavioral additions that should be invisible at the call site (e.g., the i18n-aware `FormMessage`, the `toast` re-export). Create `src/makerkit/<name>.tsx` that re-exports the upstream primitives plus your overrides, then point the `"./<name>"` entry in `package.json` at the makerkit file. Call sites continue to import from `@kit/ui/<name>`.
- **Companion token map** — for additional visual variants (e.g., `success`, `warning`, `info` on `Badge`). Export a `const` map of className tokens from `src/makerkit/<name>.tsx` (e.g., `badgeExtras`) and apply at the call site via `cn(badgeExtras.success, ...)`. Expose under a sibling export like `"./<name>-extras"`. The shadcn primitive's `variant` union stays upstream; the named abstraction (`badgeExtras.success`) survives at call sites.

For both patterns: add a header comment in the makerkit file explaining why it exists, and confirm `cn()` (tailwind-merge) resolves any conflicting utility classes the upstream variant applies.

**Worked example:** `src/makerkit/page-style-context.tsx`. `SidebarTrigger` throws
outside a `SidebarProvider`, so callers used to read the `layout-style` cookie to
decide whether to render it — which made every page dynamic under Cache
Components. Rather than exporting the shadcn context, `Page` provides its own
style context and `PageSidebarTrigger` reads it. `src/shadcn/sidebar.tsx` stays
untouched.

## Skills

- `/react-form-builder` — Full form implementation workflow with react-hook-form + Zod

## Key Components

| Component                 | Import                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------- |
| Button, Card, Input, etc. | `@kit/ui/<name>`                                                                       |
| Form fields               | `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from `@kit/ui/form` |
| Translations              | `Trans` from `@kit/ui/trans`                                                           |
| Toast                     | `toast` from `@kit/ui/sonner`                                                          |
| Conditional render        | `If` from `@kit/ui/if`                                                                 |
| Class merging             | `cn` from `@kit/ui/utils`                                                              |

## Zod

- ALWAYS import Zod as `import * as z from 'zod'`
- Place schemas in a separate file so they can be reused with server actions
