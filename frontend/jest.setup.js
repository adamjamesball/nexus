import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => {
  return {
    useRouter() {
      return {
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        pathname: '/',
        query: {},
        asPath: '/',
      }
    },
    useSearchParams() {
      return new URLSearchParams()
    },
    usePathname() {
      return '/'
    },
  }
})

// Note: individual tests should mock 'next-themes' as needed

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  Toaster: () => null,
}))

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

// Suppress console warnings in tests
const originalConsoleWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: React.jsx: type is invalid')
    ) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalConsoleWarn
})