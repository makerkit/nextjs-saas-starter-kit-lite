'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import * as z from 'zod';

import { cn, isRouteActive } from '../lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../shadcn/collapsible';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from '../shadcn/sidebar';
import { If } from './if';
import { NavigationConfigSchema } from './navigation-config.schema';
import { Trans } from './trans';

type SidebarNavigationConfig = z.output<typeof NavigationConfigSchema>;
type SidebarNavigationRoute = SidebarNavigationConfig['routes'][number];

type SidebarNavigationRouteGroup = Extract<
  SidebarNavigationRoute,
  { children: unknown }
>;

type SidebarNavigationRouteChild =
  SidebarNavigationRouteGroup['children'][number];

function getSidebarNavigationTooltip(
  open: boolean,
  t: ReturnType<typeof useTranslations>,
  label: string,
) {
  if (open) {
    return undefined;
  }

  return t.has(label) ? t(label) : label;
}

function MaybeCollapsible({
  enabled,
  defaultOpen,
  children,
}: React.PropsWithChildren<{
  enabled: boolean;
  defaultOpen: boolean;
}>) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className={'group/collapsible'}>
      {children}
    </Collapsible>
  );
}

function MaybeCollapsibleContent({
  enabled,
  children,
}: React.PropsWithChildren<{
  enabled: boolean;
}>) {
  if (!enabled) {
    return <>{children}</>;
  }

  return <CollapsibleContent>{children}</CollapsibleContent>;
}

function SidebarNavigationRouteItem({
  item,
  index,
  open,
  currentLocale,
  currentPath,
  t,
}: {
  item: SidebarNavigationRoute;
  index: number;
  open: boolean;
  currentLocale: ReturnType<typeof useLocale>;
  currentPath: string;
  t: ReturnType<typeof useTranslations>;
}) {
  if ('divider' in item) {
    return <SidebarSeparator />;
  }

  return (
    <SidebarNavigationRouteGroupItem
      item={item}
      index={index}
      open={open}
      currentLocale={currentLocale}
      currentPath={currentPath}
      t={t}
    />
  );
}

function SidebarNavigationRouteGroupLabel({
  label,
  collapsible,
  open,
}: {
  label: string;
  collapsible: boolean;
  open: boolean;
}) {
  const className = cn({ hidden: !open });

  return (
    <If
      condition={collapsible}
      fallback={
        <SidebarGroupLabel className={className}>
          <Trans i18nKey={label} defaults={label} />
        </SidebarGroupLabel>
      }
    >
      <SidebarGroupLabel className={className}>
        <CollapsibleTrigger>
          <Trans i18nKey={label} defaults={label} />

          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
      </SidebarGroupLabel>
    </If>
  );
}

function SidebarNavigationSubItems({
  items,
  open,
  currentLocale,
  currentPath,
}: {
  items: SidebarNavigationRouteChild['children'];
  open: boolean;
  currentLocale: ReturnType<typeof useLocale>;
  currentPath: string;
}) {
  return (
    <If condition={items}>
      {(items) =>
        items.length > 0 && (
          <SidebarMenuSub
            className={cn({
              'mx-0 px-1.5': !open,
            })}
          >
            {items.map((child) => {
              const isActive = isRouteActive(
                child.path,
                currentPath,
                child.highlightMatch,
                { locale: currentLocale },
              );

              const linkClassName = cn('flex items-center', {
                'mx-auto w-full gap-0! [&>svg]:flex-1': !open,
              });

              const spanClassName = cn(
                'w-auto transition-opacity duration-300',
                {
                  'w-0 opacity-0': !open,
                },
              );

              return (
                <SidebarMenuSubItem key={child.path}>
                  <SidebarMenuSubButton
                    isActive={isActive}
                    render={
                      <Link className={linkClassName} href={child.path}>
                        {child.Icon}

                        <span className={spanClassName}>
                          <Trans i18nKey={child.label} defaults={child.label} />
                        </span>
                      </Link>
                    }
                  />
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        )
      }
    </If>
  );
}

function SidebarNavigationRouteChildItem({
  child,
  open,
  currentLocale,
  currentPath,
  t,
}: {
  child: SidebarNavigationRouteChild;
  open: boolean;
  currentLocale: ReturnType<typeof useLocale>;
  currentPath: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const collapsible = Boolean('collapsible' in child && child.collapsible);
  const tooltip = getSidebarNavigationTooltip(open, t, child.label);

  const triggerItem = collapsible ? (
    <CollapsibleTrigger
      render={
        <SidebarMenuButton tooltip={tooltip}>
          <span
            className={cn('flex items-center gap-2', {
              'mx-auto w-full gap-0 [&>svg]:flex-1 [&>svg]:shrink-0': !open,
            })}
          >
            {child.Icon}

            <span
              className={cn(
                'transition-width w-auto transition-opacity duration-500',
                {
                  'w-0 opacity-0': !open,
                },
              )}
            >
              <Trans i18nKey={child.label} defaults={child.label} />
            </span>

            <ChevronDown
              className={cn(
                'ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180',
                {
                  'hidden size-0': !open,
                },
              )}
            />
          </span>
        </SidebarMenuButton>
      }
    />
  ) : (
    (() => {
      const path = 'path' in child ? child.path : '';

      const isActive = isRouteActive(path, currentPath, child.highlightMatch, {
        locale: currentLocale,
      });

      return (
        <SidebarMenuButton
          isActive={isActive}
          tooltip={tooltip}
          render={
            <Link
              className={cn('flex items-center gap-x-2', {
                'mx-auto gap-0! [&>svg]:flex-1': !open,
              })}
              href={path}
            >
              {child.Icon}

              <span
                className={cn('w-auto transition-opacity duration-300', {
                  'w-0 opacity-0': !open,
                })}
              >
                <Trans i18nKey={child.label} defaults={child.label} />
              </span>
            </Link>
          }
        />
      );
    })()
  );

  return (
    <MaybeCollapsible enabled={collapsible} defaultOpen={!child.collapsed}>
      <SidebarMenuItem>
        {triggerItem}

        <MaybeCollapsibleContent enabled={collapsible}>
          <SidebarNavigationSubItems
            items={child.children}
            open={open}
            currentLocale={currentLocale}
            currentPath={currentPath}
          />
        </MaybeCollapsibleContent>

        <If condition={child.renderAction}>
          <SidebarMenuAction>{child.renderAction}</SidebarMenuAction>
        </If>
      </SidebarMenuItem>
    </MaybeCollapsible>
  );
}

function SidebarNavigationRouteGroupItem({
  item,
  index,
  open,
  currentLocale,
  currentPath,
  t,
}: {
  item: SidebarNavigationRouteGroup;
  index: number;
  open: boolean;
  currentLocale: ReturnType<typeof useLocale>;
  currentPath: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const collapsible = Boolean(item.collapsible);

  return (
    <MaybeCollapsible enabled={collapsible} defaultOpen={!item.collapsed}>
      <SidebarGroup key={item.label} className={cn({ 'p-0!': !open })}>
        <SidebarNavigationRouteGroupLabel
          label={item.label}
          collapsible={collapsible}
          open={open}
        />

        <If condition={item.renderAction}>
          <SidebarGroupAction title={item.label}>
            {item.renderAction}
          </SidebarGroupAction>
        </If>

        <SidebarGroupContent>
          <SidebarMenu
            className={cn({
              'gap-y-0.5!': open,
              'items-center': !open,
            })}
          >
            <MaybeCollapsibleContent enabled={collapsible}>
              {item.children.map((child, childIndex) => (
                <SidebarNavigationRouteChildItem
                  key={`group-${index}-${childIndex}`}
                  child={child}
                  open={open}
                  currentLocale={currentLocale}
                  currentPath={currentPath}
                  t={t}
                />
              ))}
            </MaybeCollapsibleContent>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </MaybeCollapsible>
  );
}

export function SidebarNavigation({
  config,
}: React.PropsWithChildren<{
  config: z.output<typeof NavigationConfigSchema>;
}>) {
  const currentLocale = useLocale();
  const currentPath = usePathname() ?? '';
  const { open: sidebarOpen, isMobile } = useSidebar();
  const t = useTranslations();

  // On mobile the sidebar renders as a full-width sheet (never the icon rail),
  // so labels must always be shown regardless of the desktop collapse state.
  const open = sidebarOpen || isMobile;

  return (
    <div className={cn('flex flex-col', { 'gap-y-0': open, 'gap-y-1': !open })}>
      {config.routes.map((item, index) => (
        <SidebarNavigationRouteItem
          key={'divider' in item ? `divider-${index}` : `collapsible-${index}`}
          item={item}
          index={index}
          open={open}
          currentLocale={currentLocale}
          currentPath={currentPath}
          t={t}
        />
      ))}
    </div>
  );
}
