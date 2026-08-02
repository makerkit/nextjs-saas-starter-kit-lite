import { ContentFallback } from '~/components/skeletons/page-skeletons';

/**
 * Marketing pages have no shared shape: the landing page, the FAQ and the legal
 * pages look nothing alike. A confident guess would be wrong on most of them and
 * the layout would jump, so reserve the space and show nothing else.
 *
 * The header and footer come from the layout and are already on screen.
 */
export default function MarketingLoading() {
  return <ContentFallback />;
}
