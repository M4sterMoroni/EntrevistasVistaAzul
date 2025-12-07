import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../app/page'

// Mock the component with environment variables
const mockEnvVars = {
  NEXT_PUBLIC_OBISPO: 'https://obispo.example.com',
  NEXT_PUBLIC_PRIMER_CONSEJERO: 'https://primer.example.com',
  NEXT_PUBLIC_SEGUNDO_CONSEJERO: 'https://segundo.example.com',
  NEXT_PUBLIC_PRES_CUORUM: 'https://cuorum.example.com',
  NEXT_PUBLIC_PRES_SOCSOC: 'https://socsoc.example.com',
}

const originalEnv = { ...process.env }

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv, ...mockEnvVars } as NodeJS.ProcessEnv
  })

  afterEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv
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
      process.env = {
        ...originalEnv,
        ...mockEnvVars,
        NEXT_PUBLIC_OBISPO: '',
      } as NodeJS.ProcessEnv
      
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
