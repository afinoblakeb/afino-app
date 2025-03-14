// Import jest-dom extensions
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder/TextDecoder polyfill for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Add Response polyfill for Node.js environment
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = init.headers || {};
      this.ok = this.status >= 200 && this.status < 300;
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }

    text() {
      return Promise.resolve(this.body);
    }
  };
}

// Add BroadcastChannel polyfill for Node.js environment
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(channel) {
      this.channel = channel;
      this.listeners = {};
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    postMessage(message) {
      // No-op in test environment
    }

    addEventListener(type, listener) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    }

    removeEventListener(type, listener) {
      if (!this.listeners[type]) return;
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }

    close() {
      this.listeners = {};
    }
  };
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
    has: jest.fn().mockReturnValue(false),
    getAll: jest.fn().mockReturnValue([]),
    forEach: jest.fn(),
    entries: jest.fn().mockReturnValue([]),
    keys: jest.fn().mockReturnValue([]),
    values: jest.fn().mockReturnValue([]),
    toString: jest.fn().mockReturnValue(''),
  }),
}));

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
})); 