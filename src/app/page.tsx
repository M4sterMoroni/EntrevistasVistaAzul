"use client";

import { useMemo, useState } from "react";

type Option = {
  key: string;
  label: string;
  envVar: string | string[];
  description?: string;
  children?: Option[];
};

const OPTIONS: Option[] = [
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
];

// Next.js only inlines envs referenced with static keys.
// Build a static map of public envs for safe lookup by key.
const PUBLIC_ENV = {
  NEXT_PUBLIC_OBISPO: process.env.NEXT_PUBLIC_OBISPO,
  NEXT_PUBLIC_PRIMER_CONSEJERO: process.env.NEXT_PUBLIC_PRIMER_CONSEJERO,
  NEXT_PUBLIC_SEGUNDO_CONSEJERO: process.env.NEXT_PUBLIC_SEGUNDO_CONSEJERO,
  NEXT_PUBLIC_PRES_CUORUM: process.env.NEXT_PUBLIC_PRES_CUORUM,
  NEXT_PUBLIC_PRES_SOCSOC: process.env.NEXT_PUBLIC_PRES_SOCSOC,
} as const;

function getUrlFromEnv(envKey: string): string | null {
  const value = PUBLIC_ENV[envKey as keyof typeof PUBLIC_ENV];
  return value && value.trim().length > 0 ? value : null;
}

export default function Home() {
  const rootOptions = useMemo(() => OPTIONS, []);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const onNavigate = (envKeys: string | string[]) => {
    const keys = Array.isArray(envKeys) ? envKeys : [envKeys];
    const availableKeys = keys.filter((k) => Boolean(getUrlFromEnv(k)));

    if (availableKeys.length === 0) {
      alert(
        `Falta configurar la(s) variable(s): ${keys.join(", ")}.\n` +
          "Agrégalas en Vercel (NEXT_PUBLIC_*) o en .env.local y vuelve a desplegar."
      );
      return;
    }

    const chosenKey =
      availableKeys.length === 1
        ? availableKeys[0]
        : availableKeys[Math.random() < 0.5 ? 0 : 1];

    const url = getUrlFromEnv(chosenKey)!;
    window.location.href = url;
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 sm:p-10">
      <main className="w-full max-w-xl space-y-8">
        <header className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
            <span>Barrio Vista Azul</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Solicitud de Entrevista</h1>
          <p className="text-sm text-neutral-500">Selecciona el tipo de entrevista</p>
        </header>

        <section className="space-y-3">
          {rootOptions.map((opt) => {
            const isExpandable = Boolean(opt.children && opt.children.length > 0) || opt.key === "otros";
            const isExpanded = isExpandable && expandedKey === opt.key;
            return (
            <div key={opt.key} className="rounded-lg border border-neutral-200/60 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800">
              <button
                className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors"
                onClick={() => {
                  if (isExpandable) {
                    setExpandedKey((prev) => (prev === opt.key ? null : opt.key));
                  } else {
                    onNavigate(opt.envVar);
                  }
                }}
                aria-haspopup={isExpandable ? true : undefined}
                aria-expanded={isExpandable ? isExpanded : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt.label}</span>
                  {isExpandable && (
                    <span className="text-xs text-neutral-500">{isExpanded ? "ocultar opciones" : "mostrar opciones"}</span>
                  )}
                </div>
              </button>

              {isExpanded && opt.children && (
                <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {opt.children.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => onNavigate(child.envVar)}
                      className="rounded-md border border-neutral-200/70 dark:border-neutral-800 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/70 transition-colors"
                    >
                      <span className="text-sm font-medium">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
              {opt.description && (
                <div className="px-4 pb-3 text-xs text-neutral-500">
                  {opt.description}
                </div>
              )}
              {opt.key === "otros" && isExpanded && (
                <div className="px-4 pb-4">
                  <form
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget as HTMLFormElement;
                      const formData = new FormData(form);
                      const name = String(formData.get("name") || "").trim();
                      const comment = String(formData.get("comment") || "").trim();
                      if (!name) {
                        alert("Por favor ingresa tu nombre");
                        return;
                      }
                      try {
                        const res = await fetch("/api/otros-telegram", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name, comment }),
                        });
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          throw new Error(data?.error || "Error al enviar");
                        }
                        alert("Solicitud enviada al secretario.");
                        form.reset();
                      } catch (err) {
                        alert("No se pudo enviar. Intenta nuevamente.");
                      }
                    }}
                  >
                    <input
                      name="name"
                      placeholder="Tu nombre"
                      className="w-full sm:flex-1 rounded-md border border-neutral-200/70 dark:border-neutral-800 px-3 py-2 text-sm bg-white/80 dark:bg-neutral-900/80"
                    />
                    <input
                      name="comment"
                      placeholder="Comentario (opcional)"
                      className="w-full sm:flex-1 rounded-md border border-neutral-200/70 dark:border-neutral-800 px-3 py-2 text-sm bg-white/80 dark:bg-neutral-900/80"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              )}
            </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
