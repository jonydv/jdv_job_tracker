# ADR 0001 — Versiones verificadas para la Fase 1

Fecha: 2026-08-18. Registra los cambios de ruptura reales encontrados al levantar el stack, tal como pedía `job_tracker_mvp_plan.md` §2.1 antes de escribir código.

## Next.js 16: `middleware.ts` → `proxy.ts`

`middleware` fue renombrado a `proxy` para clarificar que es una frontera de red. Convención actual:

- Archivo en `src/proxy.ts` (no `middleware.ts`).
- Export nombrado `proxy` (o default), no `middleware`.
- Runtime siempre `nodejs`, **no** soporta `edge`. No es configurable.
- Flags con el nombre `middleware` fueron renombrados (`skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`).

`next-intl@4.13` ya publica su ejemplo oficial como `src/proxy.ts`; el export interno sigue llamándose `createMiddleware`, solo cambia el nombre de archivo/export en el proyecto consumidor. Sin impacto en la arquitectura del plan (`proxy.ts` sigue siendo solo optimista, la autorización real vive en el DAL).

## Prisma 7: la configuración de conexión sale del schema

- `datasource { url, directUrl }` ya **no** se acepta en `schema.prisma`. Error: `P1012`.
- Las URLs van en `prisma.config.ts` (raíz del proyecto), vía `defineConfig` de `"prisma/config"`:

  ```ts
  import "dotenv/config"
  import { defineConfig, env } from "prisma/config"

  export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
    datasource: { url: env("DIRECT_URL") },
  })
  ```

- `PrismaClient` **requiere** un driver adapter — ya no existe el motor Rust por defecto. Se eligió `@prisma/adapter-pg` (TCP estándar, sin lock-in a Neon) en vez de `@prisma/adapter-neon` (HTTP/WebSocket, pensado para edge/Workers). Nuestro runtime es siempre `nodejs`, así que TCP simple alcanza.
- El generador pasa de `prisma-client-js` a `prisma-client`, con `output` explícito y `importFileExtension = ""` para que el bundler de Next lo resuelva sin extensión:

  ```prisma
  generator client {
    provider            = "prisma-client"
    output              = "../src/generated/prisma"
    importFileExtension = ""
  }
  ```

- El punto de entrada generado es `<output>/client`, **no** `<output>/index`. Importar `@/generated/prisma` a secas falla con `MODULE_NOT_FOUND`; hay que importar `@/generated/prisma/client`.
- `prisma migrate dev` no siempre regeneró el cliente de forma confiable tras editar el schema en esta sesión (`prisma.platforms.baseUrl does not exist` con el cliente ya desactualizado). Regla adoptada: correr `prisma generate` explícitamente después de cualquier edición de schema, sin confiar en la regeneración implícita.
- Los filtros `where` de una unique compuesta **rechazan `null` explícito** en un campo nullable (`Argument userId must not be null`), aunque el campo sea nullable en el modelo. El patrón `upsert` con clave compuesta que incluye un campo nullable no sirve tal cual; se resolvió con `findFirst({ where: { userId: null, slug } })` + `create`/`update` condicional (ver `prisma/seed.ts`).
- `prisma migrate reset` (y variantes destructivas) tienen una guarda propia de Prisma que detecta ejecución por un agente de IA y exige consentimiento explícito del usuario vía `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`. Se resolvió pidiendo confirmación explícita antes de setear esa variable.

## shadcn/ui: el componente `form` del registry está vacío

`npx shadcn add form` no falla pero tampoco crea archivos: el registry item existe (`"name": "form", "type": "registry:ui"`) sin `files`. Se escribió `src/components/ui/form.tsx` a mano siguiendo el patrón clásico de wrapper sobre `react-hook-form` (`Controller` + `FormProvider`), adaptado al paquete consolidado `radix-ui` (no `@radix-ui/react-slot` suelto) que ya usan los demás componentes generados.

## TypeScript: se mantiene en `^5`

`create-next-app` fijó `typescript@^5` pese a que `typescript@7.0.x` (compilador nativo) es la versión `latest` en npm. Confirma el riesgo ya anotado en el plan (§14): no forzar TS7 todavía.

## Auth.js v5 beta: augmentar `JWT` requiere apuntar a `@auth/core/jwt`, no a `next-auth/jwt`

La documentación oficial indica `declare module "next-auth/jwt" { interface JWT {...} }`. En `next-auth@5.0.0-beta.32`, `next-auth/jwt.d.ts` es un simple `export * from "@auth/core/jwt"` — no una redeclaración — así que TypeScript no fusiona la augmentación ahí; el campo agregado (`locale`) queda invisible para el callback `jwt`, y el error solo aparece como un mensaje confuso (`Type '{}' is not assignable to type 'string'`) en el callback `session` al leer `token.locale`. Se resuelve apuntando la augmentación directamente al módulo donde `JWT` se declara de verdad:

```ts
declare module "@auth/core/jwt" {
  interface JWT {
    locale?: string
  }
}
```

La augmentación de `Session` sí funciona apuntando a `"next-auth"` como documenta la guía oficial; el problema es específico de `next-auth/jwt`. Ver `src/types/next-auth.d.ts`.

## Consecuencia para el resto del roadmap

Ningún cambio de alcance. Los puntos anteriores son de implementación, no de arquitectura: el plan (RSC + Server Actions, DAL con `userId` obligatorio, `proxy.ts` optimista, i18n con next-intl) sigue vigente tal cual está escrito en `job_tracker_mvp_plan.md`.
