# ADR 0002 — Hallazgos de la Fase 2 (Auth, landing, legales)

Fecha: 2026-08-18.

## Bug real: `z.string().min(1).optional().default("")` rechaza `""`

`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` en `.env` valen `""` (string vacío, no `undefined`) mientras no están configuradas. `.min(1)` se evalúa **antes** que `.optional()`/`.default()`, así que Zod rechazaba el string vacío real con `Too small: expected string to have >=1 characters`, y el build fallaba en cualquier ruta que importara `src/lib/env.ts` (incluida `/robots.txt`, que no tiene nada que ver con auth). Corregido a `z.string().default("")` sin `.min(1)`; la verificación de "¿está configurado?" vive en `googleConfigured = Boolean(id && secret)` en `src/server/auth.ts`, no en el schema de entorno.

## `metadataBase` explícito para Open Graph

Next avisa (no bloquea el build) si falta `metadataBase` cuando hay imágenes OG relativas. Se agregó `metadataBase: new URL(env.NEXT_PUBLIC_APP_URL)` en `generateMetadata` del layout raíz de `[locale]`.

## Falsa alarma: "el dev-login y el selector de idioma no funcionan"

Una primera corrida de Playwright contra la app dio resultados que parecían dos bugs graves: el login de desarrollo no redirigía a `/dashboard`, y clickear el selector de idioma no cambiaba la URL. Antes de tocar código de producción, se aisló cada paso:

1. **POST directo a `/api/auth/callback/dev`** (sin pasar por el navegador) devolvió la sesión y el HTML del dashboard correctamente, rápido. Esto descartó Prisma, el adapter, y la lógica de `authorize()`.
2. **Playwright con selectores acotados y esperas explícitas** (`page.locator("[role=group] button", has_text="en")` en vez de `page.click("[role=group] >> text=en")`) mostró que el switcher de idioma navega perfecto.
3. El selector anterior (`text=en`, sin acotar a `button`) hacía **substring match case-insensitive** contra toda la página, y probablemente clickeaba la primera coincidencia casual (p. ej. dentro de "Entrar"), no el botón real.
4. El "sign out que no funciona" fue el mismo problema pero más tonto: el test buscaba el texto **"Cerrar sesión" después de haber cambiado el idioma a inglés**, donde el botón ya decía "Sign out".

Conclusión: no había ningún bug en `LanguageSwitcher`, en `signOut`, ni en el flujo de credentials. El único bug real de esta fase fue el de `env.ts` de arriba. Lección para los próximos smoke tests: acotar selectores de Playwright al rol/contenedor específico y no reusar aserciones de un idioma después de cambiar de locale.

## UI real corregida: botón de Google deshabilitado desbordaba texto

`GoogleSignInButton` mostraba el mensaje largo "El inicio de sesión con Google todavía no está configurado…" **como texto del botón** cuando Google no está configurado, y se cortaba visualmente al no envolver el texto dentro del ancho fijo del botón. Se cambió el contrato del componente: el botón siempre muestra `label` (corto, "Continuar con Google"), y si Google no está configurado, se agrega `unavailableHint` como texto de ayuda debajo, en `text-xs text-balance`. Actualizado en `hero.tsx`, `final-cta.tsx` y `login/page.tsx`.

## Consecuencia para el resto del roadmap

Sin cambios de arquitectura. La Fase 2 queda funcionalmente completa a nivel local (falta solo que el usuario complete credenciales reales de Google — ver mensaje de cierre de fase).
