// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    pop: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.NODE_ENV = 'test'

// Mock Web APIs for Node.js environment
global.TextEncoder = global.TextEncoder || require('util').TextEncoder
global.TextDecoder = global.TextDecoder || require('util').TextDecoder

// Mock Request and NextRequest for API testing
global.Request = global.Request || class MockRequest {
  constructor(input, init = {}) {
    Object.defineProperty(this, 'url', {
      value: input,
      writable: false,
      configurable: false
    })
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
  }
  
  async json() {
    try {
      return JSON.parse(this.body)
    } catch {
      return {}
    }
  }
  
  async text() {
    return this.body || ''
  }
}

// Mock Response
global.Response = global.Response || class MockResponse {
  constructor(body, init = {}) {
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.ok = this.status >= 200 && this.status < 300
    this.headers = new Map(Object.entries(init.headers || {}))
    this._body = body
  }
  
  async json() {
    try {
      return JSON.parse(this._body)
    } catch {
      return {}
    }
  }
  
  async text() {
    return this._body || ''
  }
  
  static json(object, init) {
    return new Response(JSON.stringify(object), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })
  }
}

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Add btoa and atob for Node.js environment
global.btoa = global.btoa || function (str) {
  return Buffer.from(str, 'binary').toString('base64')
}

global.atob = global.atob || function (str) {
  return Buffer.from(str, 'base64').toString('binary')
}

// Mock window.localStorage with in-memory store
const __localStore = {}
const localStorageMock = {
  getItem: jest.fn((key) => (key in __localStore ? __localStore[key] : null)),
  setItem: jest.fn((key, value) => {
    __localStore[key] = String(value)
  }),
  removeItem: jest.fn((key) => {
    delete __localStore[key]
  }),
  clear: jest.fn(() => {
    Object.keys(__localStore).forEach((key) => delete __localStore[key])
  }),
  key: jest.fn((index) => Object.keys(__localStore)[index] ?? null),
  get length() {
    return Object.keys(__localStore).length
  },
  hasOwnProperty: Object.prototype.hasOwnProperty.bind(__localStore),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock navigator.clipboard with proper configuration
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
    readText: jest.fn().mockImplementation(() => Promise.resolve('')),
  },
  writable: true,
  configurable: true,
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
})
