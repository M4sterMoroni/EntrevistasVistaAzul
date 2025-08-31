import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../app/page'

// Mock environment variables
const mockEnvVars = {
  NEXT_PUBLIC_OBISPO: 'https://obispo.example.com',
  NEXT_PUBLIC_PRIMER_CONSEJERO: 'https://primer.example.com',
  NEXT_PUBLIC_SEGUNDO_CONSEJERO: 'https://segundo.example.com',
  NEXT_PUBLIC_PRES_CUORUM: 'https://cuorum.example.com',
  NEXT_PUBLIC_PRES_SOCSOC: 'https://socsoc.example.com',
}

describe('Home Page', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock process.env
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
      
      expect(screen.getByText('mostrar opciones')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('redirects to OBISPO when clicking Dignidad', async () => {
      render(<Home />)
      
      const dignidadButton = screen.getByText('Dignidad').closest('button')
      fireEvent.click(dignidadButton!)
      
      expect(window.location.href).toBe('https://obispo.example.com')
    })

    it('redirects to OBISPO when clicking Ajuste anual de diezmos', async () => {
      render(<Home />)
      
      const ajusteButton = screen.getByText('Ajuste anual de diezmos').closest('button')
      fireEvent.click(ajusteButton!)
      
      expect(window.location.href).toBe('https://obispo.example.com')
    })

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
    it('redirects to OBISPO when clicking Ordenanza personal', async () => {
      render(<Home />)
      
      const recomendacionButton = screen.getByText('Recomendación para el templo').closest('button')
      fireEvent.click(recomendacionButton!)
      
      await waitFor(() => {
        const ordenanzaButton = screen.getByText('Ordenanza personal').closest('button')
        fireEvent.click(ordenanzaButton!)
      })
      
      expect(window.location.href).toBe('https://obispo.example.com')
    })

    it('redirects randomly between consejeros when clicking Renovación', async () => {
      render(<Home />)
      
      const recomendacionButton = screen.getByText('Recomendación para el templo').closest('button')
      fireEvent.click(recomendacionButton!)
      
      await waitFor(() => {
        const renovacionButton = screen.getByText('Renovación').closest('button')
        fireEvent.click(renovacionButton!)
      })
      
      // Should redirect to one of the consejeros
      expect(['https://primer.example.com', 'https://segundo.example.com']).toContain(window.location.href)
    })

    it('redirects to PRES_CUORUM when clicking Varones', async () => {
      render(<Home />)
      
      const desafiosButton = screen.getByText('Desafíos temporales').closest('button')
      fireEvent.click(desafiosButton!)
      
      await waitFor(() => {
        const varonesButton = screen.getByText('Varones').closest('button')
        fireEvent.click(varonesButton!)
      })
      
      expect(window.location.href).toBe('https://cuorum.example.com')
    })

    it('redirects to PRES_SOCSOC when clicking Mujeres', async () => {
      render(<Home />)
      
      const desafiosButton = screen.getByText('Desafíos temporales').closest('button')
      fireEvent.click(desafiosButton!)
      
      await waitFor(() => {
        const mujeresButton = screen.getByText('Mujeres').closest('button')
        fireEvent.click(mujeresButton!)
      })
      
      expect(window.location.href).toBe('https://socsoc.example.com')
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
      
      expect(global.alert).toHaveBeenCalledWith('Enviado por Telegram.')
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
