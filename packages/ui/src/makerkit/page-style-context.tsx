'use client';

import { createContext, useContext } from 'react';

import { SidebarTrigger } from '../shadcn/sidebar';

type PageStyle = 'sidebar' | 'header' | 'custom';

const PageStyleContext = createContext<PageStyle>('sidebar');

export function PageStyleProvider(
  props: React.PropsWithChildren<{ style: PageStyle }>,
) {
  return (
    <PageStyleContext.Provider value={props.style}>
      {props.children}
    </PageStyleContext.Provider>
  );
}

/**
 * Renders the trigger only for the sidebar layout.
 *
 * `Page` already knows its style, so headers don't need to re-derive it from
 * the `layout-style` cookie — reading it made every page dynamic.
 */
export function PageSidebarTrigger(
  props: React.ComponentProps<typeof SidebarTrigger>,
) {
  const style = useContext(PageStyleContext);

  if (style !== 'sidebar') {
    return null;
  }

  return <SidebarTrigger {...props} />;
}
