'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  height?: number | string;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
  onScroll?: (scrollOffset: number) => void;
  scrollToIndex?: number;
  scrollToAlignment?: 'start' | 'center' | 'end' | 'auto';
}

export function VirtualizedList<T>({
  items,
  height = '100%',
  itemHeight,
  renderItem,
  className = '',
  overscanCount = 5,
  onScroll,
  scrollToIndex,
  scrollToAlignment = 'auto',
}: VirtualizedListProps<T>) {
  const [listRef, setListRef] = useState<List | null>(null);

  // Memoize the item renderer to prevent unnecessary re-renders
  const itemRenderer = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = items[index];
      if (!item) return null;

      return (
        <div style={style}>
          {renderItem(item, index)}
        </div>
      );
    },
    [items, renderItem]
  );

  // Scroll to specific index when scrollToIndex changes
  useEffect(() => {
    if (listRef && scrollToIndex !== undefined && scrollToIndex >= 0 && scrollToIndex < items.length) {
      listRef.scrollToItem(scrollToIndex, scrollToAlignment);
    }
  }, [listRef, scrollToIndex, scrollToAlignment, items.length]);

  // Handle scroll events
  const handleScroll = useCallback(
    ({ scrollOffset }: { scrollOffset: number }) => {
      onScroll?.(scrollOffset);
    },
    [onScroll]
  );

  // Memoize the list component to prevent unnecessary re-renders
  const listComponent = useMemo(() => (
    <List
      ref={setListRef}
      height={typeof height === 'number' ? height : 400}
      width={800}
      itemCount={items.length}
      itemSize={itemHeight}
      overscanCount={overscanCount}
      onScroll={handleScroll}
      className={className}
    >
      {itemRenderer}
    </List>
  ), [items.length, itemHeight, overscanCount, handleScroll, className, itemRenderer]);

  // If height is a percentage or viewport unit, wrap in AutoSizer
  if (typeof height === 'string' && (height.includes('%') || height.includes('vh'))) {
    return (
      <div style={{ height }}>
        <AutoSizer>
          {({ height: autoHeight, width }) => (
            <List
              ref={setListRef}
              height={autoHeight}
              width={width}
              itemCount={items.length}
              itemSize={itemHeight}
              overscanCount={overscanCount}
              onScroll={handleScroll}
              className={className}
            >
              {itemRenderer}
            </List>
          )}
        </AutoSizer>
      </div>
    );
  }

  return listComponent;
}

// Hook for managing virtualized list state
export function useVirtualizedList<T>(
  items: T[],
  options: {
    initialScrollToIndex?: number;
    itemHeight: number;
    overscanCount?: number;
  }
) {
  const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(
    options.initialScrollToIndex
  );
  const [scrollOffset, setScrollOffset] = useState(0);

  const scrollToItem = useCallback((index: number, alignment: 'start' | 'center' | 'end' | 'auto' = 'auto') => {
    setScrollToIndex(index);
  }, []);

  const handleScroll = useCallback((offset: number) => {
    setScrollOffset(offset);
  }, []);

  return {
    scrollToIndex,
    scrollOffset,
    scrollToItem,
    handleScroll,
  };
}

// Optimized virtualized list with search functionality
interface SearchableVirtualizedListProps<T> extends VirtualizedListProps<T> {
  searchTerm: string;
  searchKeys: (keyof T)[];
  placeholder?: string;
  onSearchChange?: (term: string) => void;
}

export function SearchableVirtualizedList<T>({
  items,
  searchTerm,
  searchKeys,
  placeholder = 'Search...',
  onSearchChange,
  ...listProps
}: SearchableVirtualizedListProps<T>) {
  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (typeof value === 'number') {
          return value.toString().includes(term);
        }
        return false;
      })
    );
  }, [items, searchTerm, searchKeys]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <VirtualizedList
        items={filteredItems}
        {...listProps}
      />
    </div>
  );
}

// Virtualized list with infinite scroll
interface InfiniteVirtualizedListProps<T> extends VirtualizedListProps<T> {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadingComponent?: React.ReactNode;
}

export function InfiniteVirtualizedList<T>({
  items,
  hasMore,
  isLoading,
  onLoadMore,
  loadingComponent,
  onScroll,
  ...listProps
}: InfiniteVirtualizedListProps<T>) {
  const handleScroll = useCallback(
    (scrollOffset: number) => {
      onScroll?.(scrollOffset);
      // Check if we're near the bottom and should load more
      const { height, itemHeight } = listProps;
      const listHeight = typeof height === 'number' ? height : 400;
      const visibleItems = Math.ceil(listHeight / itemHeight);
      const threshold = items.length - visibleItems - 5; // Load 5 items before reaching the end
      if (hasMore && !isLoading && scrollOffset >= threshold * itemHeight) {
        onLoadMore();
      }
    },
    [onScroll, hasMore, isLoading, onLoadMore, items.length, listProps.itemHeight]
  );

  return (
    <>
      <VirtualizedList
        items={items}
        {...listProps}
        onScroll={handleScroll}
      />
      {isLoading && hasMore && (
        <div className="flex items-center justify-center p-4">
          {loadingComponent || <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>}
        </div>
      )}
    </>
  );
}

// Virtualized grid component
interface VirtualizedGridProps<T> {
  items: T[];
  height?: number | string;
  itemHeight: number;
  itemWidth: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

export function VirtualizedGrid<T>({
  items,
  height = '100%',
  itemHeight,
  itemWidth,
  renderItem,
  className = '',
  overscanCount = 5,
}: VirtualizedGridProps<T>) {
  const itemRenderer = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = items[index];
      if (!item) return null;

      return (
        <div style={style}>
          {renderItem(item, index)}
        </div>
      );
    },
    [items, renderItem]
  );

  return (
    <div style={{ height }}>
      <AutoSizer>
        {({ height: autoHeight, width }) => {
          const columnsCount = Math.floor(width / itemWidth);
          const rowsCount = Math.ceil(items.length / columnsCount);

          return (
            <List
              height={autoHeight}
              width={width}
              itemCount={rowsCount}
              itemSize={itemHeight}
              overscanCount={overscanCount}
              className={className}
            >
              {({ index: rowIndex, style }) => (
                <div style={style} className="flex">
                  {Array.from({ length: columnsCount }, (_, colIndex) => {
                    const itemIndex = rowIndex * columnsCount + colIndex;
                    const item = items[itemIndex];
                    
                    if (!item) return null;

                    return (
                      <div
                        key={colIndex}
                        style={{ width: itemWidth, height: itemHeight }}
                        className="flex-shrink-0"
                      >
                        {renderItem(item, itemIndex)}
                      </div>
                    );
                  })}
                </div>
              )}
            </List>
          );
        }}
      </AutoSizer>
    </div>
  );
} 