import { PageBody } from '@kit/ui/page';

import {
  ChartCardsSkeleton,
  PageHeaderSkeleton,
} from '~/components/skeletons/page-skeletons';

/**
 * The dashboard shape is fixed: a page header, then a grid of chart cards.
 * Reproducing it means the real content drops into space already reserved
 * rather than pushing the page around when it arrives.
 */
export default function HomeLoading() {
  return (
    <>
      <PageHeaderSkeleton />

      <PageBody>
        <ChartCardsSkeleton />
      </PageBody>
    </>
  );
}
