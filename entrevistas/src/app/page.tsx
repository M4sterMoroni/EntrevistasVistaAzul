"use client";

import { useMemo } from "react";

type Option = {
  key: string;
  label: string;
  envVar: string;
  children?: Option[];
};

const OPTIONS: Option[] = [
  {
    key: "recomendacion",
    label: "Recomendación para el templo",
    envVar: "NEXT_PUBLIC_URL_RECOMENDACION",
    children: [
      {
        key: "primera-ordenanza",
        label: "Primera ordenanza personal",
        envVar: "NEXT_PUBLIC_URL_RECOMENDACION_PRIMERA_ORDENANZA",
      },
      {
        key: "renovacion",
        label: "Renovación",
        envVar: "NEXT_PUBLIC_URL_RECOMENDACION_RENOVACION",
      },
    ],
  },
  { key: "dignidad", label: "Dignidad", envVar: "NEXT_PUBLIC_URL_DIGNIDAD" },
  {
    key: "autosuficiencia",
    label: "Plan de autosuficiencia",
    envVar: "NEXT_PUBLIC_URL_AUTOSUFICIENCIA",
  },
  { key: "otros", label: "Otros", envVar: "NEXT_PUBLIC_URL_OTROS" },
];

function getUrlFromEnv(envKey: string): string | null {
  const value = process.env[envKey];
  return value && value.trim().length > 0 ? value : null;
}

export default function Home() {
  const rootOptions = useMemo(() => OPTIONS, []);

  const onNavigate = (envKey: string) => {
    const url = getUrlFromEnv(envKey) ?? "#";
    if (url === "#") {
      alert(
        "La URL correspondiente no está configurada aún. Agrega la variable en .env.local y recarga."
      );
      return;
    }
    window.location.href = url;
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 sm:p-10">
      <main className="w-full max-w-xl space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Gestión de entrevistas</h1>
          <p className="text-sm text-neutral-500">Selecciona el tipo de entrevista</p>
        </header>

        <section className="space-y-3">
          {rootOptions.map((opt) => (
            <div key={opt.key} className="rounded-lg border border-neutral-200/60 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800">
              <button
                className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors"
                onClick={() => (opt.children ? undefined : onNavigate(opt.envVar))}
                aria-haspopup={opt.children ? "true" : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt.label}</span>
                  {opt.children && (
                    <span className="text-xs text-neutral-500">elige una opción</span>
                  )}
                </div>
              </button>

              {opt.children && (
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
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
