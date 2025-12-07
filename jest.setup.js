import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock alert
global.alert = jest.fn()

// Mock Request for API tests
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.body = options.body
    this.headers = new Map(Object.entries(options.headers || {}))
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
  
  async text() {
    return this.body || ''
  }
}

// Mock Response for API tests
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.headers = options.headers || {}
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
}

// Mock NextResponse for API tests
global.NextResponse = {
  json: (data, options = {}) => {
    return new global.Response(JSON.stringify(data), {
      status: options.status || 200,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    })
  }
}

// Mock next/server module
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, options = {}) => {
      return new global.Response(JSON.stringify(data), {
        status: options.status || 200,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      })
    }
  }
}))
