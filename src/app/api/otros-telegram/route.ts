import { NextResponse } from "next/server";

type PostBody = {
  name?: string;
  comment?: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as PostBody;
    const name = (data.name || "").trim();
    const comment = (data.comment || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID" },
        { status: 500 }
      );
    }

    const text = `Solicitud de entrevista (Otros)\n\nNombre: ${name}\nComentario: ${comment || "(sin comentario)"}\nFecha: ${new Date().toLocaleString()}`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!tgRes.ok) {
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje a Telegram" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}


