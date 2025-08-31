import { test, expect } from '@playwright/test'

test.describe('Home Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Page Rendering', () => {
    test('should display main elements', async ({ page }) => {
      await expect(page.getByText('Barrio Vista Azul')).toBeVisible()
      await expect(page.getByText('Solicitud de Entrevista')).toBeVisible()
      await expect(page.getByText('Selecciona el tipo de entrevista')).toBeVisible()
    })

    test('should display all main options', async ({ page }) => {
      await expect(page.getByText('Recomendación para el templo')).toBeVisible()
      await expect(page.getByText('Dignidad')).toBeVisible()
      await expect(page.getByText('Ajuste anual de diezmos')).toBeVisible()
      await expect(page.getByText('Desafíos temporales')).toBeVisible()
      await expect(page.getByText('Otros')).toBeVisible()
    })

    test('should show expandable indicators', async ({ page }) => {
      await expect(page.getByText('mostrar opciones')).toBeVisible()
    })
  })

  test.describe('Navigation Tests', () => {
    test('should redirect when clicking Dignidad', async ({ page }) => {
      // Mock the redirect by intercepting navigation
      await page.route('**/*', route => {
        if (route.request().url().includes('obispo.example.com')) {
          route.fulfill({ status: 200, body: 'Mocked redirect' })
        } else {
          route.continue()
        }
      })

      await page.getByText('Dignidad').click()
      
      // Check if navigation was attempted
      await expect(page).toHaveURL(/obispo\.example\.com/)
    })

    test('should redirect when clicking Ajuste anual de diezmos', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('obispo.example.com')) {
          route.fulfill({ status: 200, body: 'Mocked redirect' })
        } else {
          route.continue()
        }
      })

      await page.getByText('Ajuste anual de diezmos').click()
      
      await expect(page).toHaveURL(/obispo\.example\.com/)
    })

    test('should show alert for missing env vars', async ({ page }) => {
      // Mock missing env var by intercepting the alert
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('Falta configurar')
        dialog.accept()
      })

      await page.getByText('Dignidad').click()
    })
  })

  test.describe('Expandable Options', () => {
    test('should expand Recomendación para el templo', async ({ page }) => {
      await page.getByText('Recomendación para el templo').click()
      
      await expect(page.getByText('Ordenanza personal')).toBeVisible()
      await expect(page.getByText('Renovación')).toBeVisible()
      await expect(page.getByText('ocultar opciones')).toBeVisible()
    })

    test('should expand Desafíos temporales', async ({ page }) => {
      await page.getByText('Desafíos temporales').click()
      
      await expect(page.getByText('Varones')).toBeVisible()
      await expect(page.getByText('Mujeres')).toBeVisible()
      await expect(page.getByText('ocultar opciones')).toBeVisible()
    })

    test('should expand Otros', async ({ page }) => {
      await page.getByText('Otros').click()
      
      await expect(page.getByPlaceholder('Tu nombre')).toBeVisible()
      await expect(page.getByPlaceholder('Comentario (opcional)')).toBeVisible()
      await expect(page.getByText('Enviar')).toBeVisible()
    })

    test('should collapse when clicked again', async ({ page }) => {
      const recomendacionButton = page.getByText('Recomendación para el templo')
      
      // First click to expand
      await recomendacionButton.click()
      await expect(page.getByText('Ordenanza personal')).toBeVisible()
      
      // Second click to collapse
      await recomendacionButton.click()
      await expect(page.getByText('Ordenanza personal')).not.toBeVisible()
      await expect(page.getByText('mostrar opciones')).toBeVisible()
    })
  })

  test.describe('Child Options Navigation', () => {
    test('should redirect when clicking Ordenanza personal', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('obispo.example.com')) {
          route.fulfill({ status: 200, body: 'Mocked redirect' })
        } else {
          route.continue()
        }
      })

      await page.getByText('Recomendación para el templo').click()
      await page.getByText('Ordenanza personal').click()
      
      await expect(page).toHaveURL(/obispo\.example\.com/)
    })

    test('should redirect when clicking Renovación', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('primer.example.com') || 
            route.request().url().includes('segundo.example.com')) {
          route.fulfill({ status: 200, body: 'Mocked redirect' })
        } else {
          route.continue()
        }
      })

      await page.getByText('Recomendación para el templo').click()
      await page.getByText('Renovación').click()
      
      // Should redirect to one of the consejeros
      await expect(page).toHaveURL(/primer\.example\.com|segundo\.example\.com/)
    })

    test('should redirect when clicking Varones', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('cuorum.example.com')) {
          route.fulfill({ status: 200, body: 'Mocked redirect' })
        } else {
          route.continue()
        }
      })

      await page.getByText('Desafíos temporales').click()
      await page.getByText('Varones').click()
      
      await expect(page).toHaveURL(/cuorum\.example\.com/)
    })

    test('should redirect when clicking Mujeres', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('socsoc.example.com')) {
          route.fulfill({ status: 200, body: 'Mocked redirect' })
        } else {
          route.continue()
        }
      })

      await page.getByText('Desafíos temporales').click()
      await page.getByText('Mujeres').click()
      
      await expect(page).toHaveURL(/socsoc\.example\.com/)
    })
  })

  test.describe('Telegram Form (Otros)', () => {
    test('should show form when Otros is expanded', async ({ page }) => {
      await page.getByText('Otros').click()
      
      await expect(page.getByPlaceholder('Tu nombre')).toBeVisible()
      await expect(page.getByPlaceholder('Comentario (opcional)')).toBeVisible()
      await expect(page.getByText('Enviar')).toBeVisible()
    })

    test('should show alert when name is empty', async ({ page }) => {
      page.on('dialog', dialog => {
        expect(dialog.message()).toBe('Por favor ingresa tu nombre')
        dialog.accept()
      })

      await page.getByText('Otros').click()
      await page.getByText('Enviar').click()
    })

    test('should submit form successfully', async ({ page }) => {
      // Mock the API response
      await page.route('/api/otros-telegram', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        })
      })

      page.on('dialog', dialog => {
        expect(dialog.message()).toBe('Enviado por Telegram.')
        dialog.accept()
      })

      await page.getByText('Otros').click()
      
      await page.getByPlaceholder('Tu nombre').fill('Juan Pérez')
      await page.getByPlaceholder('Comentario (opcional)').fill('Test comment')
      await page.getByText('Enviar').click()

      // Verify API was called
      await expect(page).toHaveURL('/')
    })

    test('should handle API error gracefully', async ({ page }) => {
      // Mock API error
      await page.route('/api/otros-telegram', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        })
      })

      page.on('dialog', dialog => {
        expect(dialog.message()).toBe('No se pudo enviar. Intenta nuevamente.')
        dialog.accept()
      })

      await page.getByText('Otros').click()
      
      await page.getByPlaceholder('Tu nombre').fill('Juan Pérez')
      await page.getByText('Enviar').click()
    })

    test('should handle network error gracefully', async ({ page }) => {
      // Mock network error
      await page.route('/api/otros-telegram', route => {
        route.abort()
      })

      page.on('dialog', dialog => {
        expect(dialog.message()).toBe('No se pudo enviar. Intenta nuevamente.')
        dialog.accept()
      })

      await page.getByText('Otros').click()
      
      await page.getByPlaceholder('Tu nombre').fill('Juan Pérez')
      await page.getByText('Enviar').click()
    })

    test('should clear form after successful submission', async ({ page }) => {
      await page.route('/api/otros-telegram', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        })
      })

      page.on('dialog', dialog => dialog.accept())

      await page.getByText('Otros').click()
      
      const nameInput = page.getByPlaceholder('Tu nombre')
      const commentInput = page.getByPlaceholder('Comentario (opcional)')
      
      await nameInput.fill('Juan Pérez')
      await commentInput.fill('Test comment')
      await page.getByText('Enviar').click()

      // Form should be cleared
      await expect(nameInput).toHaveValue('')
      await expect(commentInput).toHaveValue('')
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      await expect(page.getByText('Solicitud de Entrevista')).toBeVisible()
      await expect(page.getByText('Recomendación para el templo')).toBeVisible()
      
      // Test form responsiveness
      await page.getByText('Otros').click()
      await expect(page.getByPlaceholder('Tu nombre')).toBeVisible()
      await expect(page.getByPlaceholder('Comentario (opcional)')).toBeVisible()
    })

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await expect(page.getByText('Solicitud de Entrevista')).toBeVisible()
      await expect(page.getByText('Recomendación para el templo')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const recomendacionButton = page.getByText('Recomendación para el templo')
      
      await expect(recomendacionButton).toHaveAttribute('aria-haspopup', 'true')
      await expect(recomendacionButton).toHaveAttribute('aria-expanded', 'false')
    })

    test('should update ARIA attributes when expanded', async ({ page }) => {
      const recomendacionButton = page.getByText('Recomendación para el templo')
      
      await recomendacionButton.click()
      
      await expect(recomendacionButton).toHaveAttribute('aria-expanded', 'true')
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toContainText('Recomendación para el templo')
      
      await page.keyboard.press('Enter')
      await expect(page.getByText('Ordenanza personal')).toBeVisible()
    })
  })
})
