import * as React from 'react';

import { cn } from '../lib/utils';
import { Separator } from '../shadcn/separator';
import { If } from './if';
import { PageSidebarTrigger, PageStyleProvider } from './page-style-context';

export type PageLayoutStyle = 'sidebar' | 'header' | 'custom';

type PageProps = React.PropsWithChildren<{
  style?: PageLayoutStyle;
  contentContainerClassName?: string;
  className?: string;
  sticky?: boolean;
}>;

export function Page(props: PageProps) {
  return (
    <PageStyleProvider style={props.style ?? 'sidebar'}>
      {renderPage(props)}
    </PageStyleProvider>
  );
}

function renderPage(props: PageProps) {
  switch (props.style) {
    case 'header':
      return <PageWithHeader {...props} />;

    case 'custom':
      return props.children;

    default:
      return <PageWithSidebar {...props} />;
  }
}

function PageWithSidebar(props: PageProps) {
  const { Navigation, Children, MobileNavigation } = getSlotsFromPage(props);

  return (
    <div
      className={cn('flex min-w-0 flex-1 overflow-x-hidden', props.className)}
    >
      {Navigation}

      <div
        className={
          props.contentContainerClassName ??
          'mx-auto flex h-screen w-full min-w-0 flex-1 flex-col bg-inherit'
        }
      >
        {MobileNavigation}

        <div
          className={'bg-background flex min-w-0 flex-1 flex-col px-4 lg:px-0'}
        >
          {Children}
        </div>
      </div>
    </div>
  );
}

export function PageMobileNavigation(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  return (
    <div
      className={cn(
        'container flex w-full items-center justify-between px-0 py-2 group-data-[slot="sidebar-wrapper"]/sidebar-wrapper:border-b group-data-[slot="sidebar-wrapper"]/sidebar-wrapper:px-4 lg:hidden',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

function PageWithHeader(props: PageProps) {
  const { Navigation, Children, MobileNavigation } = getSlotsFromPage(props);

  return (
    <div
      className={cn(
        'bg-background flex min-h-screen flex-1 flex-col',
        props.className,
      )}
    >
      <div
        className={props.contentContainerClassName ?? 'flex flex-1 flex-col'}
      >
        <div
          className={cn(
            'bg-background/95 supports-[backdrop-filter]:bg-background/80 border-b',
            {
              'sticky top-0 z-10 backdrop-blur-md': props.sticky ?? true,
            },
          )}
        >
          <div className="container mx-auto flex h-14 w-full items-center">
            <div
              className={
                'hidden w-full min-w-0 flex-1 items-center space-x-4 lg:flex lg:px-4'
              }
            >
              {Navigation}
            </div>

            {MobileNavigation}
          </div>
        </div>

        <div className="container mx-auto flex w-full flex-1 flex-col">
          {Children}
        </div>
      </div>
    </div>
  );
}

export function PageBody(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  const className = cn('flex min-w-0 flex-1 flex-col lg:px-4', props.className);

  return <div className={className}>{props.children}</div>;
}

export function PageNavigation(props: React.PropsWithChildren) {
  return (
    <div
      className={
        'flex flex-1 flex-col bg-inherit group-data-[slot="sidebar-wrapper"]/sidebar-wrapper:flex-initial'
      }
    >
      {props.children}
    </div>
  );
}

export function PageDescription(props: React.PropsWithChildren) {
  return (
    <div className={'flex h-6 items-center'}>
      <div className={'text-muted-foreground text-xs leading-none font-normal'}>
        {props.children}
      </div>
    </div>
  );
}

export function PageTitle(props: React.PropsWithChildren) {
  return (
    <h1
      className={
        'font-heading text-base leading-none font-bold tracking-tight dark:text-white'
      }
    >
      {props.children}
    </h1>
  );
}

export function PageHeaderActions(props: React.PropsWithChildren) {
  return <div className={'flex items-center space-x-2'}>{props.children}</div>;
}

export function PageHeader({
  children,
  title,
  description,
  className,
  displaySidebarTrigger = true,
}: React.PropsWithChildren<{
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  displaySidebarTrigger?: boolean;
}>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 py-4 sm:py-5 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className={'flex min-w-0 flex-col gap-y-2'}>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <If condition={displaySidebarTrigger}>
            <PageSidebarTrigger className="text-muted-foreground hover:text-secondary-foreground h-4.5 w-4.5 cursor-pointer" />
          </If>

          <If condition={description}>
            <Separator
              orientation="vertical"
              className="hidden h-4 w-px lg:group-data-[collapsible=icon]:block"
            />

            <PageDescription>{description}</PageDescription>
          </If>
        </div>

        <If condition={title}>
          <PageTitle>{title}</PageTitle>
        </If>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
        {children}
      </div>
    </div>
  );
}

function getSlotsFromPage(props: React.PropsWithChildren) {
  return React.Children.toArray(props.children).reduce<{
    Children: React.ReactElement | null;
    Navigation: React.ReactElement | null;
    MobileNavigation: React.ReactElement | null;
  }>(
    (acc, child) => {
      if (!React.isValidElement(child)) {
        return acc;
      }

      if (child.type === PageNavigation) {
        return {
          ...acc,
          Navigation: child,
        };
      }

      if (child.type === PageMobileNavigation) {
        return {
          ...acc,
          MobileNavigation: child,
        };
      }

      return {
        ...acc,
        Children: child,
      };
    },
    {
      Children: null,
      Navigation: null,
      MobileNavigation: null,
    },
  );
}
