'use client';

import { Fragment, useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Cell,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  Table as ReactTable,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { cn } from '../lib/utils/cn';
import { Button } from '../shadcn/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../shadcn/table';
import { If } from './if';
import { Trans } from './trans';

type DataItem = Record<string, unknown> | object;

export {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
};

interface ReactTableProps<T extends DataItem> {
  data: T[];
  columns: ColumnDef<T>[];
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement;
  pageIndex?: number;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
  pageSize?: number;
  pageCount?: number;
  sorting?: SortingState;
  columnVisibility?: VisibilityState;
  columnPinning?: ColumnPinningState;
  rowSelection?: Record<string, boolean>;
  getRowId?: (row: T) => string;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  onClick?: (props: { row: Row<T>; cell: Cell<T, unknown> }) => void;
  tableProps?: React.ComponentProps<typeof Table> &
    Record<`data-${string}`, string>;
  sticky?: boolean;
  renderCell?: (props: {
    cell: Cell<T, unknown>;
    style?: React.CSSProperties;
    className?: string;
  }) => (props: React.PropsWithChildren<object>) => React.ReactNode;
  renderRow?: (props: {
    row: Row<T>;
  }) => (props: React.PropsWithChildren<object>) => React.ReactNode;
  noResultsMessage?: React.ReactNode;
  forcePagination?: boolean; // Force pagination to show even when pageCount <= 1
  manualSorting?: boolean; // Default true for server-side sorting, set false for client-side sorting
}

export function DataTable<RecordData extends DataItem>({
  data,
  columns,
  pageIndex,
  pageSize,
  pageCount,
  getRowId,
  onPaginationChange,
  onSortingChange,
  onColumnVisibilityChange,
  onColumnPinningChange,
  onRowSelectionChange,
  onClick,
  tableProps,
  className,
  headerClassName,
  footerClassName,
  renderRow,
  renderCell,
  noResultsMessage,
  sorting: controlledSorting,
  columnVisibility: controlledColumnVisibility,
  columnPinning: controlledColumnPinning,
  rowSelection: controlledRowSelection,
  sticky = false,
  forcePagination = false,
  manualSorting = true,
}: ReactTableProps<RecordData>) {
  // TODO: remove when https://github.com/TanStack/table/issues/5567 gets fixed
  'use no memo';

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 15,
  });

  const [sorting, setSorting] = useState<SortingState>(controlledSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Internal states for uncontrolled mode
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>(controlledColumnVisibility ?? {});

  const [internalColumnPinning, setInternalColumnPinning] =
    useState<ColumnPinningState>(
      controlledColumnPinning ?? { left: [], right: [] },
    );

  const [internalRowSelection, setInternalRowSelection] = useState(
    controlledRowSelection ?? {},
  );

  // Computed values for table state - computed inline in callbacks for fresh values

  const navigateToPage = useNavigateToNewPage();

  const table = useReactTable({
    data,
    getRowId,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnPinning: true,
    enableRowSelection: true,
    manualPagination: true,
    manualSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === 'function') {
        const currentVisibility =
          controlledColumnVisibility ?? internalColumnVisibility;
        const nextState = updater(currentVisibility);

        // If controlled mode (callback provided), call it
        if (onColumnVisibilityChange) {
          onColumnVisibilityChange(nextState);
        } else {
          // Otherwise update internal state (uncontrolled mode)
          setInternalColumnVisibility(nextState);
        }
      } else {
        // If controlled mode (callback provided), call it
        if (onColumnVisibilityChange) {
          onColumnVisibilityChange(updater);
        } else {
          // Otherwise update internal state (uncontrolled mode)
          setInternalColumnVisibility(updater);
        }
      }
    },
    onColumnPinningChange: (updater) => {
      if (typeof updater === 'function') {
        const currentPinning = controlledColumnPinning ?? internalColumnPinning;
        const nextState = updater(currentPinning);

        // If controlled mode (callback provided), call it
        if (onColumnPinningChange) {
          onColumnPinningChange(nextState);
        } else {
          // Otherwise update internal state (uncontrolled mode)
          setInternalColumnPinning(nextState);
        }
      } else {
        // If controlled mode (callback provided), call it
        if (onColumnPinningChange) {
          onColumnPinningChange(updater);
        } else {
          // Otherwise update internal state (uncontrolled mode)
          setInternalColumnPinning(updater);
        }
      }
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === 'function') {
        const currentSelection = controlledRowSelection ?? internalRowSelection;
        const nextState = updater(currentSelection);

        // If controlled mode (callback provided), call it
        if (onRowSelectionChange) {
          onRowSelectionChange(nextState);
        } else {
          // Otherwise update internal state (uncontrolled mode)
          setInternalRowSelection(nextState);
        }
      } else {
        // If controlled mode (callback provided), call it
        if (onRowSelectionChange) {
          onRowSelectionChange(updater);
        } else {
          // Otherwise update internal state (uncontrolled mode)
          setInternalRowSelection(updater);
        }
      }
    },
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility: controlledColumnVisibility ?? internalColumnVisibility,
      columnPinning: controlledColumnPinning ?? internalColumnPinning,
      rowSelection: controlledRowSelection ?? internalRowSelection,
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

  if (pagination.pageIndex !== pageIndex && pageIndex !== undefined) {
    setPagination({
      pageIndex,
      pageSize: pagination.pageSize,
    });
  }

  const rows = table.getRowModel().rows;

  const displayPagination =
    rows.length > 0 && pageCount && (pageCount > 1 || forcePagination);

  return (
    <div className="flex h-full flex-1 flex-col">
      <Table
        data-testidid="data-table"
        {...tableProps}
        className={cn(
          'bg-background border-collapse border-spacing-0',
          className,
          {
            'h-full': data.length === 0,
          },
        )}
      >
        <TableHeader
          className={cn(headerClassName, {
            ['bg-background/20 outline-border sticky top-[0px] z-10 outline backdrop-blur-sm']:
              sticky,
          })}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const isPinned = header.column.getIsPinned();
                const size = header.column.getSize();

                // Calculate proper left offset for left-pinned columns
                const left =
                  isPinned === 'left'
                    ? headerGroup.headers
                        .slice(0, index)
                        .filter((h) => h.column.getIsPinned() === 'left')
                        .reduce((acc, h) => acc + h.column.getSize(), 0)
                    : undefined;

                // Calculate right offset for right-pinned columns
                const right =
                  isPinned === 'right'
                    ? headerGroup.headers
                        .slice(index + 1)
                        .filter((h) => h.column.getIsPinned() === 'right')
                        .reduce((acc, h) => acc + h.column.getSize(), 0)
                    : undefined;

                return (
                  <TableHead
                    className={cn(
                      'text-muted-foreground bg-background/80 border-transparent font-sans font-medium',
                      {
                        ['border-r-background border-r']: isPinned === 'left',
                        ['border-l-background border-l']: isPinned === 'right',
                        ['sticky top-0 z-10 opacity-95 backdrop-blur-sm']:
                          isPinned,
                        ['relative z-0']: !isPinned,
                      },
                    )}
                    colSpan={header.colSpan}
                    style={{
                      width: `${size}px`,
                      minWidth: `${size}px`,
                      left: left !== undefined ? `${left}px` : undefined,
                      right: right !== undefined ? `${right}px` : undefined,
                    }}
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        onClick={() =>
                          header.column.getCanSort() &&
                          header.column.toggleSorting(
                            header.column.getIsSorted() === 'asc'
                              ? true
                              : false,
                          )
                        }
                        className={cn(
                          'flex items-center gap-2',
                          header.column.getCanSort()
                            ? 'hover:bg-accent/50 -mx-3 cursor-pointer rounded px-3 py-1 select-none'
                            : '',
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                'h-3 w-3',
                                header.column.getIsSorted() === 'asc'
                                  ? 'text-foreground'
                                  : 'text-muted-foreground/50',
                              )}
                            />

                            <ChevronDown
                              className={cn(
                                '-mt-1 h-3 w-3',
                                header.column.getIsSorted() === 'desc'
                                  ? 'text-foreground'
                                  : 'text-muted-foreground/50',
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            const RowWrapper = renderRow ? renderRow({ row }) : TableRow;

            const children = row.getVisibleCells().map((cell, index) => {
              const isPinned = cell.column.getIsPinned();
              const size = cell.column.getSize();

              // Calculate proper left offset for left-pinned columns
              const left =
                isPinned === 'left'
                  ? row
                      .getVisibleCells()
                      .slice(0, index)
                      .filter((c) => c.column.getIsPinned() === 'left')
                      .reduce((acc, c) => acc + c.column.getSize(), 0)
                  : undefined;

              // Calculate right offset for right-pinned columns
              const right =
                isPinned === 'right'
                  ? row
                      .getVisibleCells()
                      .slice(index + 1)
                      .filter((c) => c.column.getIsPinned() === 'right')
                      .reduce((acc, c) => acc + c.column.getSize(), 0)
                  : undefined;

              const className = cn(
                (cell.column.columnDef?.meta as { className?: string })
                  ?.className,
                [],
                'border-transparent',
                {
                  ['bg-background/90 border-r-border group-hover/row:bg-muted/50 sticky z-[1] border-r opacity-95 backdrop-blur-sm']:
                    isPinned === 'left',
                  ['bg-background/90 border-l-border group-hover/row:bg-muted/50 sticky z-[1] border-l opacity-95 backdrop-blur-sm']:
                    isPinned === 'right',
                  ['relative z-0']: !isPinned,
                },
              );

              const style = {
                width: `${size}px`,
                minWidth: `${size}px`,
                left: left !== undefined ? `${left}px` : undefined,
                right: right !== undefined ? `${right}px` : undefined,
              };

              return renderCell ? (
                <Fragment key={cell.id}>
                  {renderCell({ cell, style, className })({})}
                </Fragment>
              ) : (
                <TableCell
                  key={cell.id}
                  style={style}
                  className={className}
                  onClick={onClick ? () => onClick({ row, cell }) : undefined}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            });

            return (
              <RowWrapper
                key={row.id}
                className={cn('bg-background/80', {
                  'hover:bg-accent/60': !row.getIsSelected(),
                  'active:bg-accent': !!onClick,
                  'cursor-pointer': !!onClick && !row.getIsSelected(),
                })}
                data-state={row.getIsSelected() && 'selected'}
              >
                {children}
              </RowWrapper>
            );
          })}
        </TableBody>
      </Table>

      <If condition={rows.length === 0}>
        <div className={'flex flex-1 flex-col items-center p-8'}>
          <span className="text-muted-foreground text-center text-sm">
            {noResultsMessage || <Trans i18nKey={'common.noData'} />}
          </span>
        </div>
      </If>

      <If condition={displayPagination}>
        <div
          className={cn(
            'bg-background/80 sticky bottom-0 z-10 border-t backdrop-blur-sm',
            {
              ['sticky bottom-0 z-10 max-w-full rounded-none']: sticky,
            },
            footerClassName,
          )}
        >
          <div>
            <div className={'px-2.5 py-1.5'}>
              <Pagination
                table={table}
                totalCount={
                  pageCount && pageSize ? pageCount * pageSize : undefined
                }
              />
            </div>
          </div>
        </div>
      </If>
    </div>
  );
}

function Pagination<T>({
  table,
  totalCount,
}: React.PropsWithChildren<{
  table: ReactTable<T>;
  totalCount?: number;
  pageSize?: number;
}>) {
  const currentPageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const rows = table.getRowModel().rows;

  // Calculate what records are being shown on this page
  const startRecord = currentPageIndex * currentPageSize + 1;
  const endRecord = startRecord + rows.length - 1;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-muted-foreground flex items-center text-xs">
        <Trans
          i18nKey={'common.pageOfPages'}
          values={{
            page: currentPageIndex + 1,
            total: table.getPageCount(),
          }}
        />
      </span>

      <div className="flex items-center space-x-1">
        <Button
          type="button"
          className={'h-6 w-6'}
          size={'icon'}
          variant={'outline'}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className={'h-4'} />
        </Button>

        <Button
          type="button"
          className={'h-6 w-6'}
          size={'icon'}
          variant={'outline'}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className={'h-4'} />
        </Button>

        <Button
          type="button"
          className={'h-6 w-6'}
          size={'icon'}
          variant={'outline'}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className={'h-4'} />
        </Button>

        <Button
          type="button"
          className={'h-6 w-6'}
          size={'icon'}
          variant={'outline'}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className={'h-4'} />
        </Button>
      </div>

      <If condition={totalCount && rows.length > 0}>
        <span className="text-muted-foreground flex items-center text-xs">
          Showing {startRecord} to {endRecord} of {totalCount} rows
        </span>
      </If>
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

/**
 * Hook for managing column pinning state
 *
 * @example
 * ```tsx
 * const columnPinning = useColumnPinning({
 *   defaultPinning: { left: ['select'], right: ['actions'] }
 * });
 *
 * // Pin a column to the left
 * columnPinning.toggleColumnPin('name', 'left');
 *
 * // Unpin a column
 * columnPinning.toggleColumnPin('name');
 *
 * // Check if column is pinned
 * const side = columnPinning.isColumnPinned('name'); // 'left' | 'right' | false
 * ```
 */
export function useColumnPinning({
  defaultPinning,
  onPinningChange,
}: {
  defaultPinning?: ColumnPinningState;
  onPinningChange?: (pinning: ColumnPinningState) => void;
}) {
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    defaultPinning ?? { left: [], right: [] },
  );

  const toggleColumnPin = useCallback(
    (columnId: string, side?: 'left' | 'right') => {
      setColumnPinning((prev) => {
        const newPinning = { ...prev };
        const leftColumns = [...(newPinning.left || [])];
        const rightColumns = [...(newPinning.right || [])];

        // Remove column from both sides first
        const leftIndex = leftColumns.indexOf(columnId);
        const rightIndex = rightColumns.indexOf(columnId);

        if (leftIndex > -1) leftColumns.splice(leftIndex, 1);
        if (rightIndex > -1) rightColumns.splice(rightIndex, 1);

        // Add to the specified side if provided
        if (side === 'left') {
          leftColumns.push(columnId);
        } else if (side === 'right') {
          rightColumns.push(columnId);
        }

        const updated = {
          left: leftColumns,
          right: rightColumns,
        };

        if (onPinningChange) {
          onPinningChange(updated);
        }

        return updated;
      });
    },
    [onPinningChange],
  );

  const isColumnPinned = useCallback(
    (columnId: string): 'left' | 'right' | false => {
      if (columnPinning.left?.includes(columnId)) return 'left';
      if (columnPinning.right?.includes(columnId)) return 'right';

      return false;
    },
    [columnPinning],
  );

  const resetPinning = useCallback(() => {
    const defaultState = defaultPinning ?? { left: [], right: [] };
    setColumnPinning(defaultState);

    if (onPinningChange) {
      onPinningChange(defaultState);
    }
  }, [defaultPinning, onPinningChange]);

  return useMemo(
    () => ({
      columnPinning,
      setColumnPinning,
      toggleColumnPin,
      isColumnPinned,
      resetPinning,
    }),
    [
      columnPinning,
      setColumnPinning,
      toggleColumnPin,
      isColumnPinned,
      resetPinning,
    ],
  );
}

/**
 * Hook for managing column visibility state
 *
 * @example
 * ```tsx
 * const columnVisibility = useColumnVisibility({
 *   defaultVisibility: { email: false, phone: false }
 * });
 *
 * // Toggle column visibility
 * columnVisibility.toggleColumnVisibility('email');
 *
 * // Check if column is visible
 * const isVisible = columnVisibility.isColumnVisible('email');
 * ```
 */
export function useColumnVisibility({
  defaultVisibility,
  onVisibilityChange,
}: {
  defaultVisibility?: VisibilityState;
  onVisibilityChange?: (visibility: VisibilityState) => void;
}) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultVisibility ?? {},
  );

  const toggleColumnVisibility = useCallback(
    (columnId: string) => {
      setColumnVisibility((prev) => {
        const updated = {
          ...prev,
          [columnId]: !prev[columnId],
        };

        if (onVisibilityChange) {
          onVisibilityChange(updated);
        }

        return updated;
      });
    },
    [onVisibilityChange],
  );

  const isColumnVisible = useCallback(
    (columnId: string): boolean => {
      return columnVisibility[columnId] !== false;
    },
    [columnVisibility],
  );

  const setColumnVisible = useCallback(
    (columnId: string, visible: boolean) => {
      setColumnVisibility((prev) => {
        const updated = {
          ...prev,
          [columnId]: visible,
        };

        if (onVisibilityChange) {
          onVisibilityChange(updated);
        }

        return updated;
      });
    },
    [onVisibilityChange],
  );

  const resetVisibility = useCallback(() => {
    const defaultState = defaultVisibility ?? {};
    setColumnVisibility(defaultState);

    if (onVisibilityChange) {
      onVisibilityChange(defaultState);
    }
  }, [defaultVisibility, onVisibilityChange]);

  return useMemo(
    () => ({
      columnVisibility,
      setColumnVisibility,
      toggleColumnVisibility,
      isColumnVisible,
      setColumnVisible,
      resetVisibility,
    }),
    [
      columnVisibility,
      setColumnVisibility,
      toggleColumnVisibility,
      isColumnVisible,
      setColumnVisible,
      resetVisibility,
    ],
  );
}

/**
 * Combined hook for managing both column visibility and pinning
 * Provides a unified interface for column management
 *
 * @example
 * ```tsx
 * const columnManagement = useColumnManagement({
 *   defaultVisibility: { email: false },
 *   defaultPinning: { left: ['select'] }
 * });
 *
 * // Use in DataTable
 * <DataTable
 *   columnVisibility={columnManagement.columnVisibility}
 *   columnPinning={columnManagement.columnPinning}
 *   onColumnVisibilityChange={columnManagement.setColumnVisibility}
 *   onColumnPinningChange={columnManagement.setColumnPinning}
 * />
 * ```
 */
export function useColumnManagement({
  defaultVisibility,
  defaultPinning,
  onVisibilityChange,
  onPinningChange,
}: {
  defaultVisibility?: VisibilityState;
  defaultPinning?: ColumnPinningState;
  onVisibilityChange?: (visibility: VisibilityState) => void;
  onPinningChange?: (pinning: ColumnPinningState) => void;
}) {
  const visibility = useColumnVisibility({
    defaultVisibility,
    onVisibilityChange,
  });

  const pinning = useColumnPinning({
    defaultPinning,
    onPinningChange,
  });

  const resetPreferences = useCallback(() => {
    visibility.resetVisibility();
    pinning.resetPinning();
  }, [visibility, pinning]);

  return useMemo(
    () => ({
      // Visibility state
      columnVisibility: visibility.columnVisibility,
      setColumnVisibility: visibility.setColumnVisibility,
      toggleColumnVisibility: visibility.toggleColumnVisibility,
      isColumnVisible: visibility.isColumnVisible,
      setColumnVisible: visibility.setColumnVisible,

      // Pinning state
      columnPinning: pinning.columnPinning,
      setColumnPinning: pinning.setColumnPinning,
      toggleColumnPin: pinning.toggleColumnPin,
      isColumnPinned: pinning.isColumnPinned,

      // Combined actions
      resetPreferences,
    }),
    [visibility, pinning, resetPreferences],
  );
}

/**
 * Hook for batch selection of items in a data table
 *
 * @param items - The items to select from
 * @param getItemId - A function to get the id of an item
 * @param options - Optional configuration for batch selection
 *
 * @example
 * ```tsx
 * const batchSelection = useBatchSelection(
 *   data,
 *   (item) => item.id,
 *   { maxSelectable: 50 }
 * );
 *
 * // Check if item is selected
 * const isSelected = batchSelection.isSelected('item-1');
 *
 * // Toggle selection
 * batchSelection.toggleSelection('item-1');
 *
 * // Select all items on current page
 * batchSelection.toggleSelectAll(true);
 *
 * // Get selected records
 * const selected = batchSelection.getSelectedRecords();
 *
 * // Clear all selections
 * batchSelection.clearSelection();
 * ```
 */
export function useBatchSelection<T>(
  items: T[],
  getItemId: (item: T) => string,
  options?: {
    maxSelectable?: number;
    onSelectionChange?: (selectedRecords: Map<string, T>) => void;
  },
) {
  const [selectedRecords, setSelectedRecords] = useState<Map<string, T>>(
    new Map(),
  );

  const selectedIds = useMemo(
    () => new Set(selectedRecords.keys()),
    [selectedRecords],
  );

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedRecords((prev) => {
        const newMap = new Map(prev);

        if (newMap.has(id)) {
          newMap.delete(id);
        } else {
          if (options?.maxSelectable && newMap.size >= options.maxSelectable) {
            return prev;
          }

          // Find the item in the current items array
          const item = items.find((item) => getItemId(item) === id);

          if (item) {
            newMap.set(id, item);
          }
        }

        if (options?.onSelectionChange) {
          options.onSelectionChange(newMap);
        }

        return newMap;
      });
    },
    [items, getItemId, options],
  );

  const toggleSelectAll = useCallback(
    (selectAll: boolean) => {
      setSelectedRecords((prev) => {
        const newMap = new Map(prev);

        if (selectAll) {
          if (options?.maxSelectable && items.length > options.maxSelectable) {
            return prev;
          }

          // Add all current items to selection
          items.forEach((item) => {
            const id = getItemId(item);
            newMap.set(id, item);
          });
        } else {
          // Remove only current page items from selection
          items.forEach((item) => {
            const id = getItemId(item);
            newMap.delete(id);
          });
        }

        if (options?.onSelectionChange) {
          options.onSelectionChange(newMap);
        }

        return newMap;
      });
    },
    [items, getItemId, options],
  );

  const clearSelection = useCallback(() => {
    const newMap = new Map<string, T>();
    setSelectedRecords(newMap);

    if (options?.onSelectionChange) {
      options.onSelectionChange(newMap);
    }
  }, [options]);

  const isSelected = useCallback(
    (id: string) => selectedRecords.has(id),
    [selectedRecords],
  );

  const isAllSelected = useMemo(() => {
    if (items.length === 0) {
      return false;
    }

    return items.every((item) => selectedRecords.has(getItemId(item)));
  }, [items, selectedRecords, getItemId]);

  const isAnySelected = useMemo(() => {
    if (items.length === 0) {
      return false;
    }

    return items.some((item) => selectedRecords.has(getItemId(item)));
  }, [items, selectedRecords, getItemId]);

  const isSomeSelected = useMemo(() => {
    if (items.length === 0) {
      return false;
    }

    const currentPageSelectedCount = items.filter((item) =>
      selectedRecords.has(getItemId(item)),
    ).length;

    return (
      currentPageSelectedCount > 0 && currentPageSelectedCount < items.length
    );
  }, [items, selectedRecords, getItemId]);

  const selectedCount = selectedRecords.size;

  // Get array of selected records
  const getSelectedRecords = useCallback(() => {
    return Array.from(selectedRecords.values());
  }, [selectedRecords]);

  return useMemo(
    () => ({
      selectedIds,
      selectedRecords,
      selectedCount,
      isSelected,
      isAnySelected,
      isAllSelected,
      isSomeSelected,
      toggleSelection,
      toggleSelectAll,
      clearSelection,
      getSelectedRecords,
      setSelectedRecords,
    }),
    [
      selectedIds,
      selectedRecords,
      selectedCount,
      isSelected,
      isAnySelected,
      isAllSelected,
      isSomeSelected,
      toggleSelection,
      toggleSelectAll,
      clearSelection,
      getSelectedRecords,
    ],
  );
}

export type BatchSelection<T = unknown> = ReturnType<
  typeof useBatchSelection<T>
>;
