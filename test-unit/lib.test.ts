import { paginateItems } from '@/lib/pagination';
import { absoluteUrl } from '@/lib/utils';
import { describe, it, expect } from 'vitest';

describe('paginateItems', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1); // 1から25までの配列

  it('should return the first page correctly', () => {
    const result = paginateItems(items, 1, 8);
    expect(result.items.length).toBe(8);
    expect(result.items[0]).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(4); // 25 / 8 = 3.125 -> 4 pages
    expect(result.totalItems).toBe(25);
  });

  it('should return a middle page correctly', () => {
    const result = paginateItems(items, 2, 8);
    expect(result.items.length).toBe(8);
    expect(result.items[0]).toBe(9);
    expect(result.currentPage).toBe(2);
  });

  it('should return the last page correctly with fewer items', () => {
    const result = paginateItems(items, 4, 8);
    expect(result.items.length).toBe(1); // 25 - (3*8) = 1 item
    expect(result.items[0]).toBe(25);
    expect(result.currentPage).toBe(4);
  });

  it('should handle page number out of bounds (too high)', () => {
    const result = paginateItems(items, 5, 8);
    expect(result.items.length).toBe(1); // Should default to last page
    expect(result.currentPage).toBe(4);
  });

  it('should handle page number out of bounds (too low)', () => {
    const result = paginateItems(items, 0, 8);
    expect(result.items.length).toBe(8); // Should default to first page
    expect(result.currentPage).toBe(1);
  });

  it('should handle empty items array', () => {
    const result = paginateItems([], 1, 8);
    expect(result.items.length).toBe(0);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1); // totalItems 0 / pageSize 8 -> Math.ceil(0) -> 0, Math.max(1,0) -> 1
    expect(result.totalItems).toBe(0);
  });

  it('should handle different page sizes', () => {
    const result = paginateItems(items, 1, 10);
    expect(result.items.length).toBe(10);
    expect(result.totalPages).toBe(3); // 25 / 10 = 2.5 -> 3 pages
  });
});

describe('absoluteUrl', () => {
  it('should return absolute url with provided url', () => {
    const result = absoluteUrl({ url: 'https://example.com', path: '/test' });
    expect(result).toBe('https://example.com/test');
  });

  it('should use default localhost if url is null', () => {
    const result = absoluteUrl({ url: null, path: '/test' });
    expect(result).toBe('http://localhost:5173/test');
  });

  it('should handle path without leading slash', () => {
    const result = absoluteUrl({ url: 'https://example.com', path: 'test' });
    expect(result).toBe('https://example.comtest'); // Note: Path should ideally start with /
  });

  it('should handle empty path', () => {
    const result = absoluteUrl({ url: 'https://example.com', path: '' });
    expect(result).toBe('https://example.com');
  });
});
