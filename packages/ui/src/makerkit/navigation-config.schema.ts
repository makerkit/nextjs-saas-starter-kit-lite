import * as z from 'zod';

const RouteContextSchema = z
  .enum(['personal', 'organization', 'all'])
  .default('all');

export type RouteContext = z.output<typeof RouteContextSchema>;

const Divider = z.object({
  divider: z.literal(true),
});

const RouteSubChild = z.object({
  label: z.string(),
  path: z.string(),
  Icon: z.custom<React.ReactNode>().optional(),
  highlightMatch: z.string().optional(),
  renderAction: z.custom<React.ReactNode>().optional(),
  context: RouteContextSchema.optional(),
});

const RouteChild = z.object({
  label: z.string(),
  path: z.string(),
  Icon: z.custom<React.ReactNode>().optional(),
  highlightMatch: z.string().optional(),
  children: z.array(RouteSubChild).default([]).optional(),
  collapsible: z.boolean().default(false).optional(),
  collapsed: z.boolean().default(false).optional(),
  renderAction: z.custom<React.ReactNode>().optional(),
  context: RouteContextSchema.optional(),
});

const RouteGroup = z.object({
  label: z.string(),
  collapsible: z.boolean().optional(),
  collapsed: z.boolean().optional(),
  children: z.array(RouteChild),
  renderAction: z.custom<React.ReactNode>().optional(),
});

export const NavigationConfigSchema = z.object({
  sidebarCollapsed: z.stringbool().optional().default(false),
  sidebarCollapsedStyle: z.enum(['icon', 'offcanvas', 'none']).default('icon'),
  routes: z.array(z.union([RouteGroup, Divider])),
  style: z.enum(['sidebar', 'header', 'custom']).default('sidebar'),
});
