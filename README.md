# Entrevistas Vista Azul

Aplicación web para gestionar solicitudes de entrevistas del Barrio Vista Azul.

**Autor:** Carlos Mahonri Monterroso Garcia

## 🚀 Características

- **Interfaz moderna y responsiva** con Tailwind CSS
- **Opciones de entrevista** organizadas por categorías
- **Integración con Telegram** para notificaciones
- **Redirección inteligente** basada en el tipo de entrevista
- **Validación de entrada** y sanitización de datos
- **Rate limiting** para prevenir abuso
- **Headers de seguridad** configurados
- **Testing automatizado** con cobertura completa

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Jest, React Testing Library
- **Security**: ESLint Security, Semgrep, TruffleHog
- **CI/CD**: GitHub Actions

## 📋 Requisitos

- Node.js 20+
- pnpm 8+

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd EntrevistasVistaAzul

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# URLs de redirección
NEXT_PUBLIC_OBISPO=https://obispo.example.com
NEXT_PUBLIC_PRIMER_CONSEJERO=https://primer.example.com
NEXT_PUBLIC_SEGUNDO_CONSEJERO=https://segundo.example.com
NEXT_PUBLIC_PRES_CUORUM=https://cuorum.example.com
NEXT_PUBLIC_PRES_SOCSOC=https://socsoc.example.com

# Telegram Bot (para la opción "Otros")
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Configuración de Telegram

1. **Crear un bot**:
   - Habla con [@BotFather](https://t.me/botfather) en Telegram
   - Usa el comando `/newbot`
   - Sigue las instrucciones para crear tu bot
   - Guarda el token que te proporciona

2. **Obtener el Chat ID**:
   - Agrega tu bot al grupo donde quieres recibir las notificaciones
   - Envía un mensaje al grupo
   - Visita: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Busca el `chat.id` en la respuesta

3. **Configurar en Vercel**:
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`

## 🚀 Desarrollo

```bash
# Servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
pnpm test
# Run with coverage
pnpm test:coverage
# Run in watch mode
pnpm test:watch
```

### Security Testing
```bash
# Run security audit
pnpm security:audit

# Run security linting
pnpm lint:security

# Run SAST scan with Semgrep (requires installation)
pnpm security:sast

# Run comprehensive security check
pnpm security:full
```

**Note:** SAST scanning uses native Semgrep integration in the CI/CD pipeline for better performance and reliability.

**Local Semgrep Setup:**
```bash
# Install Semgrep locally (optional, for development)
pip install semgrep
```

### Linting
```bash
pnpm lint
```

## 🔒 Seguridad

### Medidas Implementadas

#### 1. **Headers de Seguridad**
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `Strict-Transport-Security` - Fuerza HTTPS
- `Content-Security-Policy` - Previene XSS
- `Referrer-Policy` - Controla información de referrer
- `Permissions-Policy` - Restringe APIs del navegador

#### 2. **Validación y Sanitización**
- Validación de entrada en el frontend y backend
- Sanitización de datos para prevenir XSS
- Rate limiting (5 requests/minuto por IP)
- Validación de Content-Type
- Timeout en requests externos (10 segundos)

#### 3. **Herramientas de Seguridad**
- **ESLint Security**: Reglas de seguridad para JavaScript/TypeScript
- **SonarJS**: Detección de code smells y vulnerabilidades
- **Semgrep (Native)**: SAST (Static Application Security Testing) con integración nativa
- **pnpm audit**: Auditoría de dependencias

#### 4. **Configuración de Next.js**
- Headers de seguridad configurados
- `poweredByHeader: false` - Oculta información del servidor
- TypeScript en modo estricto
- ESLint obligatorio en builds

### Mejores Prácticas

1. **Variables de Entorno**:
   - Nunca committear secretos al repositorio
   - Usar `NEXT_PUBLIC_` solo para variables públicas
   - Validar variables de entorno en runtime

2. **Validación de Entrada**:
   - Validar y sanitizar toda entrada del usuario
   - Limitar longitud de campos
   - Detectar patrones sospechosos

3. **Manejo de Errores**:
   - No exponer información sensible en errores
   - Logging apropiado para debugging
   - Timeouts en requests externos

4. **Dependencias**:
   - Mantener dependencias actualizadas
   - Revisar auditorías de seguridad regularmente
   - Usar `pnpm audit` antes de cada deploy

## 📊 Test Coverage
- **Unit Tests**: React components, API routes, utility functions
- **Security Tests**: SAST, secrets detection, dependency audit
- **Accessibility**: ARIA attributes, keyboard navigation (covered in unit tests)
- **Responsive**: Mobile, tablet, desktop layouts (manual testing recommended)
- **Error Handling**: API failures, network errors, validation

## 🔄 CI/CD Pipeline

### Workflow Steps
1. **Lint**: ESLint checks for code quality
2. **Security Scan**: SAST, secrets detection, dependency audit
3. **Unit Tests**: Jest tests with coverage reporting
4. **Build Check**: Ensures the app builds successfully
5. **Security Audit**: Comprehensive security review

### Branch Protection
- All tests must pass before merging to `main`
- Security scans must complete successfully
- Code coverage thresholds enforced

### Artifacts
- Coverage reports uploaded to Codecov
- Security scan results stored as artifacts
- Build logs preserved for debugging

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno
3. Vercel automáticamente despliega en cada push a `main`

### Variables de Entorno en Vercel
- `NEXT_PUBLIC_OBISPO`
- `NEXT_PUBLIC_PRIMER_CONSEJERO`
- `NEXT_PUBLIC_SEGUNDO_CONSEJERO`
- `NEXT_PUBLIC_PRES_CUORUM`
- `NEXT_PUBLIC_PRES_SOCSOC`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## 📝 Estructura del Proyecto

```
EntrevistasVistaAzul/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── otros-telegram/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── __tests__/
│       ├── api.test.ts
│       └── page.test.tsx
├── tests/
│   ├── jest.config.js
│   └── jest.setup.js
├── .github/
│   └── workflows/
│       └── test.yml
├── .eslintrc.security.js
├── .semgrep.yml
├── next.config.ts
└── package.json
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guidelines
- Sigue las reglas de ESLint
- Asegúrate de que todos los tests pasen
- Mantén la cobertura de tests alta
- Documenta cambios importantes

## 📄 Licencia

Este proyecto es público y puede ser reutilizado a discreción.

## 🆘 Soporte

Para soporte técnico: Carlos Mahonri Monterroso Garcia
