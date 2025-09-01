import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the component with environment variables
const mockEnvVars = {
  NEXT_PUBLIC_OBISPO: 'https://obispo.example.com',
  NEXT_PUBLIC_PRIMER_CONSEJERO: 'https://primer.example.com',
  NEXT_PUBLIC_SEGUNDO_CONSEJERO: 'https://segundo.example.com',
  NEXT_PUBLIC_PRES_CUORUM: 'https://cuorum.example.com',
  NEXT_PUBLIC_PRES_SOCSOC: 'https://socsoc.example.com',
}

// Mock the component with environment variables
jest.mock('../app/page', () => {
  const originalModule = jest.requireActual('../app/page')
  
  // Mock the PUBLIC_ENV object that Next.js inlines
  const mockPublicEnv = {
    NEXT_PUBLIC_OBISPO: 'https://obispo.example.com',
    NEXT_PUBLIC_PRIMER_CONSEJERO: 'https://primer.example.com',
    NEXT_PUBLIC_SEGUNDO_CONSEJERO: 'https://segundo.example.com',
    NEXT_PUBLIC_PRES_CUORUM: 'https://cuorum.example.com',
    NEXT_PUBLIC_PRES_SOCSOC: 'https://socsoc.example.com',
  }

  return {
    __esModule: true,
    default: function MockHome() {
      // Override the PUBLIC_ENV object in the module
      const module = originalModule
      module.PUBLIC_ENV = mockPublicEnv
      
      // Override the getUrlFromEnv function
      const originalGetUrlFromEnv = module.getUrlFromEnv || ((envKey: string): string | null => {
        const value = mockPublicEnv[envKey as keyof typeof mockPublicEnv]
        return value && value.trim().length > 0 ? value : null
      })
      
      // Create a mock component that uses our mocked environment variables
      const React = require('react')
      const { useMemo, useState } = React

      const OPTIONS = [
        {
          key: "recomendacion",
          label: "Recomendación para el templo",
          envVar: "NEXT_PUBLIC_OBISPO",
          children: [
            {
              key: "primera-ordenanza",
              label: "Ordenanza personal",
              envVar: "NEXT_PUBLIC_OBISPO",
            },
            {
              key: "renovacion",
              label: "Renovación",
              envVar: ["NEXT_PUBLIC_PRIMER_CONSEJERO", "NEXT_PUBLIC_SEGUNDO_CONSEJERO"],
            },
          ],
        },
        { key: "dignidad", label: "Dignidad", envVar: "NEXT_PUBLIC_OBISPO" },
        { key: "ajuste-diezmos", label: "Ajuste anual de diezmos", envVar: "NEXT_PUBLIC_OBISPO" },
        {
          key: "autosuficiencia",
          label: "Desafíos temporales",
          description: "Plan de autosuficiencia",
          envVar: "#",
          children: [
            {
              key: "autosuficiencia-varones",
              label: "Varones",
              envVar: "NEXT_PUBLIC_PRES_CUORUM",
            },
            {
              key: "autosuficiencia-mujeres",
              label: "Mujeres",
              envVar: "NEXT_PUBLIC_PRES_SOCSOC",
            },
          ],
        },
        { key: "otros", label: "Otros", envVar: "#", description: "Solicitud a secretario" },
      ]

      const rootOptions = useMemo(() => OPTIONS, [])
      const [expandedKey, setExpandedKey] = useState(null)

      const onNavigate = (envKeys: string | string[]) => {
        const keys = Array.isArray(envKeys) ? envKeys : [envKeys]
        const availableKeys = keys.filter((k) => Boolean(originalGetUrlFromEnv(k)))

        if (availableKeys.length === 0) {
          alert(
            `Falta configurar la(s) variable(s): ${keys.join(", ")}.\n` +
              "Agrégalas en Vercel (NEXT_PUBLIC_*) o en .env.local y vuelve a desplegar."
          )
          return
        }

        const chosenKey =
          availableKeys.length === 1
            ? availableKeys[0]
            : availableKeys[Math.random() < 0.5 ? 0 : 1]

        const url = originalGetUrlFromEnv(chosenKey)!
        window.location.href = url
      }

      return originalModule.default()
    }
  }
})

import Home from '../app/page'

describe('Home Page', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock process.env with our test values
    Object.defineProperty(process, 'env', {
      value: mockEnvVars,
      writable: true,
    })
    
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000' },
      writable: true,
    })
  })

  describe('Rendering', () => {
    it('renders the main heading and description', () => {
      render(<Home />)
      
      expect(screen.getByText('Solicitud de Entrevista')).toBeInTheDocument()
      expect(screen.getByText('Selecciona el tipo de entrevista')).toBeInTheDocument()
    })

    it('renders the Barrio Vista Azul badge', () => {
      render(<Home />)
      
      expect(screen.getByText('Barrio Vista Azul')).toBeInTheDocument()
    })

    it('renders all main options', () => {
      render(<Home />)
      
      expect(screen.getByText('Recomendación para el templo')).toBeInTheDocument()
      expect(screen.getByText('Dignidad')).toBeInTheDocument()
      expect(screen.getByText('Ajuste anual de diezmos')).toBeInTheDocument()
      expect(screen.getByText('Desafíos temporales')).toBeInTheDocument()
      expect(screen.getByText('Otros')).toBeInTheDocument()
    })

    it('shows expandable indicators for options with children', () => {
      render(<Home />)
      
      // Check that expandable indicators exist (there should be multiple)
      const expandableIndicators = screen.getAllByText('mostrar opciones')
      expect(expandableIndicators.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('shows alert when env var is missing', () => {
      // Mock missing env var
      Object.defineProperty(process, 'env', {
        value: { ...mockEnvVars, NEXT_PUBLIC_OBISPO: '' },
        writable: true,
      })
      
      render(<Home />)
      
      const dignidadButton = screen.getByText('Dignidad').closest('button')
      fireEvent.click(dignidadButton!)
      
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Falta configurar la(s) variable(s): NEXT_PUBLIC_OBISPO')
      )
    })
  })

  describe('Expandable Options', () => {
    it('expands Recomendación para el templo when clicked', async () => {
      render(<Home />)
      
      const recomendacionButton = screen.getByText('Recomendación para el templo').closest('button')
      fireEvent.click(recomendacionButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Ordenanza personal')).toBeInTheDocument()
        expect(screen.getByText('Renovación')).toBeInTheDocument()
      })
    })

    it('expands Desafíos temporales when clicked', async () => {
      render(<Home />)
      
      const desafiosButton = screen.getByText('Desafíos temporales').closest('button')
      fireEvent.click(desafiosButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Varones')).toBeInTheDocument()
        expect(screen.getByText('Mujeres')).toBeInTheDocument()
      })
    })

    it('expands Otros when clicked', async () => {
      render(<Home />)
      
      const otrosButton = screen.getByText('Otros').closest('button')
      fireEvent.click(otrosButton!)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Comentario (opcional)')).toBeInTheDocument()
        expect(screen.getByText('Enviar')).toBeInTheDocument()
      })
    })

    it('collapses when clicked again', async () => {
      render(<Home />)
      
      const recomendacionButton = screen.getByText('Recomendación para el templo').closest('button')
      
      // First click to expand
      fireEvent.click(recomendacionButton!)
      await waitFor(() => {
        expect(screen.getByText('Ordenanza personal')).toBeInTheDocument()
      })
      
      // Second click to collapse
      fireEvent.click(recomendacionButton!)
      await waitFor(() => {
        expect(screen.queryByText('Ordenanza personal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Child Options Navigation', () => {
    it('shows child options when parent is expanded', async () => {
      render(<Home />)
      
      const recomendacionButton = screen.getByText('Recomendación para el templo').closest('button')
      fireEvent.click(recomendacionButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Ordenanza personal')).toBeInTheDocument()
        expect(screen.getByText('Renovación')).toBeInTheDocument()
      })
    })

    it('shows desafíos options when parent is expanded', async () => {
      render(<Home />)
      
      const desafiosButton = screen.getByText('Desafíos temporales').closest('button')
      fireEvent.click(desafiosButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Varones')).toBeInTheDocument()
        expect(screen.getByText('Mujeres')).toBeInTheDocument()
      })
    })
  })

  describe('Telegram Form (Otros)', () => {
    beforeEach(() => {
      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })
    })

    it('shows form when Otros is expanded', async () => {
      render(<Home />)
      
      const otrosButton = screen.getByText('Otros').closest('button')
      fireEvent.click(otrosButton!)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Comentario (opcional)')).toBeInTheDocument()
        expect(screen.getByText('Enviar')).toBeInTheDocument()
      })
    })

    it('shows alert when name is empty', async () => {
      render(<Home />)
      
      const otrosButton = screen.getByText('Otros').closest('button')
      fireEvent.click(otrosButton!)
      
      await waitFor(() => {
        const submitButton = screen.getByText('Enviar')
        fireEvent.click(submitButton)
      })
      
      expect(global.alert).toHaveBeenCalledWith('Por favor ingresa tu nombre')
    })

    it('submits form successfully with name and comment', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      const otrosButton = screen.getByText('Otros').closest('button')
      fireEvent.click(otrosButton!)
      
      await waitFor(async () => {
        const nameInput = screen.getByPlaceholderText('Tu nombre')
        const commentInput = screen.getByPlaceholderText('Comentario (opcional)')
        const submitButton = screen.getByText('Enviar')
        
        await user.type(nameInput, 'Juan Pérez')
        await user.type(commentInput, 'Necesito una entrevista urgente')
        await user.click(submitButton)
      })
      
      expect(global.fetch).toHaveBeenCalledWith('/api/otros-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Juan Pérez', comment: 'Necesito una entrevista urgente' }),
      })
      
      expect(global.alert).toHaveBeenCalledWith('Solicitud enviada al secretario.')
    })

    it('handles API error gracefully', async () => {
      // Mock failed fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
      
      const user = userEvent.setup()
      render(<Home />)
      
      const otrosButton = screen.getByText('Otros').closest('button')
      fireEvent.click(otrosButton!)
      
      await waitFor(async () => {
        const nameInput = screen.getByPlaceholderText('Tu nombre')
        const submitButton = screen.getByText('Enviar')
        
        await user.type(nameInput, 'Juan Pérez')
        await user.click(submitButton)
      })
      
      expect(global.alert).toHaveBeenCalledWith('No se pudo enviar. Intenta nuevamente.')
    })

    it('handles network error gracefully', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      const user = userEvent.setup()
      render(<Home />)
      
      const otrosButton = screen.getByText('Otros').closest('button')
      fireEvent.click(otrosButton!)
      
      await waitFor(async () => {
        const nameInput = screen.getByPlaceholderText('Tu nombre')
        const submitButton = screen.getByText('Enviar')
        
        await user.type(nameInput, 'Juan Pérez')
        await user.click(submitButton)
      })
      
      expect(global.alert).toHaveBeenCalledWith('No se pudo enviar. Intenta nuevamente.')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes for expandable buttons', () => {
      render(<Home />)
      
      const recomendacionButton = screen.getByText('Recomendación para el templo').closest('button')
      expect(recomendacionButton).toHaveAttribute('aria-haspopup', 'true')
      expect(recomendacionButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('updates ARIA attributes when expanded', async () => {
      render(<Home />)
      
      const recomendacionButton = screen.getByText('Recomendación para el templo').closest('button')
      fireEvent.click(recomendacionButton!)
      
      await waitFor(() => {
        expect(recomendacionButton).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })
})
