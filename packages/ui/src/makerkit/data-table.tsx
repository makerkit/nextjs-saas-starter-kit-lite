'use client';

import { useCallback, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Table as ReactTable,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '../shadcn/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../shadcn/table';
import { Trans } from './trans';

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  manualPagination?: boolean;
  manualSorting?: boolean;
  sorting?: SortingState;
  tableProps?: React.ComponentProps<typeof Table> &
    Record<`data-${string}`, string>;
}

export function DataTable<T extends object>({
  data,
  columns,
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
  onSortingChange,
  tableProps,
  manualPagination = true,
  manualSorting = false,
  sorting: initialSorting,
}: ReactTableProps<T>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 15,
  });

  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const navigateToPage = useNavigateToNewPage();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination,
    manualSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        const nextState = updater(sorting);

        setSorting(nextState);

        if (onSortingChange) {
          onSortingChange(nextState);
        }
      } else {
        setSorting(updater);

        if (onSortingChange) {
          onSortingChange(updater);
        }
      }
    },
    onPaginationChange: (updater) => {
      const navigate = (page: number) => setTimeout(() => navigateToPage(page));

      if (typeof updater === 'function') {
        setPagination((prevState) => {
          const nextState = updater(prevState);

          if (onPaginationChange) {
            onPaginationChange(nextState);
          } else {
            navigate(nextState.pageIndex);
          }

          return nextState;
        });
      } else {
        setPagination(updater);

        if (onPaginationChange) {
          onPaginationChange(updater);
        } else {
          navigate(updater.pageIndex);
        }
      }
    },
  });

  return (
    <div className={'rounded-lg border'}>
      <Table {...tableProps}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  colSpan={header.colSpan}
                  style={{
                    width: header.column.getSize(),
                  }}
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Trans i18nKey={'common.noData'} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter className={'bg-background'}>
          <TableRow>
            <TableCell colSpan={columns.length}>
              <Pagination table={table} />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

function Pagination<T>({
  table,
}: React.PropsWithChildren<{
  table: ReactTable<T>;
}>) {
  return (
    <div className="flex items-center gap-x-4">
      <span className="text-muted-foreground flex items-center text-sm">
        <Trans
          i18nKey={'common.pageOfPages'}
          values={{
            page: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount(),
          }}
        />
      </span>

      <div className="flex items-center gap-x-1">
        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className={'h-4'} />
        </Button>

        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className={'h-4'} />
        </Button>

        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className={'h-4'} />
        </Button>

        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className={'h-4'} />
        </Button>
      </div>
    </div>
  );
}

/**
 * Navigates to a new page using the provided page index and optional page parameter.
 */
function useNavigateToNewPage(
  props: { pageParam?: string } = {
    pageParam: 'page',
  },
) {
  const router = useRouter();
  const param = props.pageParam ?? 'page';

  return useCallback(
    (pageIndex: number) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, String(pageIndex + 1));

      router.push(url.pathname + url.search);
    },
    [param, router],
  );
}
