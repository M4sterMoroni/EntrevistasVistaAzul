import { NextResponse } from "next/server";

type PostBody = {
  name?: string;
  comment?: string;
};

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute

function getClientIP(request: Request): string {
  // In production, get from headers like X-Forwarded-For, X-Real-IP
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  clientData.count++;
  return false;
}

function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

function validateInput(name: string, comment: string): { valid: boolean; error?: string } {
  // Name validation
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Falta el nombre" };
  }
  
  if (name.length > 100) {
    return { valid: false, error: "El nombre es demasiado largo" };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i,
    /vbscript:/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(name) || pattern.test(comment)) {
      return { valid: false, error: "Contenido no permitido" };
    }
  }
  
  return { valid: true };
}

export async function POST(request: Request) {
  try {
    // Rate limiting check (skip in test environment)
    const isTestEnvironment = process.env.NODE_ENV === 'test';
    if (!isTestEnvironment) {
      const clientIP = getClientIP(request);
      if (isRateLimited(clientIP)) {
        return NextResponse.json(
          { error: "Demasiadas solicitudes. Intente de nuevo en 1 minuto." },
          { status: 429 }
        );
      }
    }

    // Parse and validate request body
    let data: PostBody;
    try {
      const bodyText = await request.text();
      if (!bodyText) {
        return NextResponse.json(
          { error: "Cuerpo de la solicitud vacío" },
          { status: 400 }
        );
      }
      data = JSON.parse(bodyText) as PostBody;
    } catch {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const name = sanitizeInput((data.name || "").trim());
    const comment = sanitizeInput((data.comment || "").trim());

    // Validate inputs
    const validation = validateInput(name, comment);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Environment variables validation
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID" },
        { status: 500 }
      );
    }

    // Create message with timestamp and IP logging
    const timestamp = new Date().toLocaleString('es-ES', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const clientIP = getClientIP(request);
    const text = `Solicitud de entrevista (Otros)\n\nNombre: ${name}\nComentario: ${comment || "(sin comentario)"}\nFecha: ${timestamp}\nIP: ${clientIP}`;

    // Send to Telegram with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const tgRes = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "EntrevistasVistaAzul/1.0"
        },
        body: JSON.stringify({ 
          chat_id: chatId, 
          text,
          parse_mode: 'HTML'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!tgRes.ok) {
        return NextResponse.json(
          { error: "No se pudo enviar el mensaje a Telegram" },
          { status: 502 }
        );
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Tiempo de espera agotado" },
          { status: 408 }
        );
      }
      throw error;
    }
  } catch {
    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}


