import { POST } from '../app/api/otros-telegram/route'

// Mock environment variables
const mockEnvVars = {
  TELEGRAM_BOT_TOKEN: 'test-bot-token',
  TELEGRAM_CHAT_ID: '-1001234567890',
  NODE_ENV: 'test',
}

describe('Telegram API', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock process.env
    Object.defineProperty(process, 'env', {
      value: mockEnvVars,
      writable: true,
    })
    
    // Mock fetch
    global.fetch = jest.fn()
  })

  describe('POST /api/otros-telegram', () => {
    it('returns 400 when name is missing', async () => {
      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: 'Test comment' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Falta el nombre')
    })

    it('returns 400 when name is empty', async () => {
      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '   ', comment: 'Test comment' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Falta el nombre')
    })

    it('returns 500 when TELEGRAM_BOT_TOKEN is missing', async () => {
      Object.defineProperty(process, 'env', {
        value: { ...mockEnvVars, TELEGRAM_BOT_TOKEN: '' },
        writable: true,
      })

      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Juan Pérez' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID')
    })

    it('returns 500 when TELEGRAM_CHAT_ID is missing', async () => {
      Object.defineProperty(process, 'env', {
        value: { ...mockEnvVars, TELEGRAM_CHAT_ID: '' },
        writable: true,
      })

      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Juan Pérez' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID')
    })

    it('sends message to Telegram successfully', async () => {
      // Mock successful Telegram API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })

      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Juan Pérez', comment: 'Test comment' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)

      // Verify Telegram API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-bot-token/sendMessage',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'EntrevistasVistaAzul/1.0'
          },
          body: expect.stringContaining('Juan Pérez'),
          signal: expect.any(AbortSignal)
        }
      )
    })

    it('sends message without comment when comment is empty', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })

      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Juan Pérez' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)

      // Verify message contains "(sin comentario)"
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('(sin comentario)'),
        })
      )
    })

    it('returns 502 when Telegram API fails', async () => {
      // Mock failed Telegram API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      })

      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Juan Pérez' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(502)
      expect(data.error).toBe('No se pudo enviar el mensaje a Telegram')
    })

    it('returns 500 when network error occurs', async () => {
      // Mock network error
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Juan Pérez' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Error procesando la solicitud')
    })

    it('includes timestamp in message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })

      const request = new Request('http://localhost:3000/api/otros-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Juan Pérez' }),
      })

      await POST(request)

      // Verify message contains timestamp
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Fecha:'),
        })
      )
    })
  })
})
