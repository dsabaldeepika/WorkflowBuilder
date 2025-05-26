import '@testing-library/jest-dom';
import { server } from './mocks/server';
import { jest, beforeAll, afterEach, afterAll } from '@jest/globals';

// Extend global types
declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock;
      ResizeObserver: jest.Mock;
      IntersectionObserver: jest.Mock;
    }
  }
}

// Mock fetch
const mockFetch = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
  return Promise.resolve(new Response());
});
(global as any).fetch = mockFetch;

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
(global as any).ResizeObserver = MockResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: readonly number[] = [];
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
}
(global as any).IntersectionObserver = MockIntersectionObserver;

// Mock window.matchMedia
interface MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
  addListener: (callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any)) => void;
  removeListener: (callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any)) => void;
  addEventListener: (type: string, callback: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, callback: EventListenerOrEventListenerObject) => void;
  dispatchEvent: (event: Event) => boolean;
}

const createMediaQueryList = (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => createMediaQueryList(query),
}); 