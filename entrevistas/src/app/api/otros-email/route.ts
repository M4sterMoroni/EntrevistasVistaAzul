import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type PostBody = {
  name?: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as PostBody;
    const name = (data.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
    }

    const toEmail = process.env.SECRETARIO;
    if (!toEmail) {
      return NextResponse.json(
        { error: "Falta la variable de entorno SECRETARIO" },
        { status: 500 }
      );
    }

    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

    if (!host || !portStr || !user || !pass) {
      return NextResponse.json(
        {
          error:
            "Faltan variables SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)",
        },
        { status: 500 }
      );
    }

    const port = Number(portStr);
    const secure = process.env.SMTP_SECURE
      ? /^true$/i.test(process.env.SMTP_SECURE)
      : port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const subject = `Solicitud de entrevista (Otros)`;
    const text = `Se recibió una solicitud de entrevista en la opción "Otros".

Nombre del solicitante: ${name}
Fecha: ${new Date().toLocaleString()}`;

    const fromEmail = process.env.SMTP_FROM || user;

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo enviar el correo" },
      { status: 500 }
    );
  }
}


