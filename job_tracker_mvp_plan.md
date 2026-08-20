# Job Tracker — Plan Técnico del MVP (v3)

Documento de trabajo para ejecutar la implementación. Amplía el plan v1 con: decisiones cerradas (no "A o B"), modelo de datos ejecutable, contratos de datos, especificación de pantallas, criterios de aceptación por fase y un registro explícito de **gaps** detectados.

**Convención del proyecto:** el código no lleva comentarios. Nombres, tipos y funciones pequeñas explican la intención. Si un fragmento necesita comentario, se refactoriza o se documenta aquí.

---

## 0. Historial de cambios

### v2 sobre v1

| #   | v1 decía                                        | v2 decide                                                        |
| :-- | :---------------------------------------------- | :--------------------------------------------------------------- |
| 1   | "JWT **o** Database Sessions"                   | JWT obligatorio (§4.2)                                           |
| 2   | TanStack Query + Server Actions + RSC           | Fuera TanStack Query del MVP (§3.1)                              |
| 3   | `salary_range` (texto)                          | Campos estructurados min/max/moneda/período (§5)                 |
| 4   | "soft delete opcional"                          | Borrado real + `WITHDRAWN` como estado terminal (§3.6)           |
| 5   | FTS con `to_tsvector` en índice GIN             | `pg_trgm` + `ILIKE` en MVP; FTS documentado como upgrade (§7.3)  |
| 6   | Métricas prometidas, sin modelo que las soporte | Tabla `ApplicationEvent` desde el día 1 (§5)                     |
| 7   | Sin testing, CI, ni manejo de errores           | §10, §11 y contrato de acciones (§6.3)                           |
| 8   | Landing con "capturas del dashboard" en Fase 2  | Landing con mock vivo en Fase 2, capturas reales en Fase 4 (§12) |

### v3 sobre v2 (decisiones confirmadas el 2026-08-18)

| #   | Cambio                                                                                                                                                                                                                                     |
| :-- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **LinkedIn eliminado por completo** como método de acceso: sin provider, sin flag, sin variables de entorno. Google + provider de desarrollo. LinkedIn sobrevive únicamente como _plataforma de postulación_ en el seed, que es otra cosa. |
| 2   | **i18n español/inglés** deja de ser no-goal y pasa a ser infraestructura de Fase 1 (§8). Cero strings hardcodeados, verificado por lint y por test.                                                                                        |
| 3   | `User.locale` añadido al modelo para que la preferencia siga al usuario entre dispositivos (§5).                                                                                                                                           |
| 4   | Los esquemas Zod emiten **claves de traducción**, no texto (§6.2).                                                                                                                                                                         |
| 5   | Confirmadas sin cambios las decisiones 1, 2, 4, 5 y 6 de §14.                                                                                                                                                                              |

---

## 1. Alcance

### 1.1. Dentro del MVP

- Landing pública bilingüe (es/en) con SEO por idioma y páginas legales.
- Login OAuth con Google.
- CRUD de postulaciones con filtros combinados, búsqueda, orden y paginación persistidos en la URL.
- Etapas de entrevista por postulación.
- Plataformas globales (seed) + plataformas propias del usuario.
- Franja de métricas básicas del dashboard.
- Ajustes: nombre, idioma, exportar datos (JSON/CSV), eliminar cuenta con cascada.

### 1.2. Fuera del MVP (no-goals explícitos)

Extensión de navegador · parseo de emails · recordatorios/notificaciones · export `.ics` · adjuntos de CV · equipos/multi-usuario · sugerencias con IA · idiomas más allá de `es`/`en` · traducción automática del contenido que escribe el usuario · modo offline · roles/permisos · rate limiting propio.

Declararlos evita que se cuelen en Fase 3.

---

## 2. Stack fijado (con versiones verificadas)

| Capa          | Paquete                                    | Versión objetivo           | Nota                                                                   |
| :------------ | :----------------------------------------- | :------------------------- | :--------------------------------------------------------------------- |
| Framework     | `next`                                     | 16.3.x                     | App Router                                                             |
| UI            | `react` / `react-dom`                      | 19.2.x                     |                                                                        |
| Estilos       | `tailwindcss`                              | 4.3.x                      | config CSS-first (`@theme`), sin `tailwind.config.js`                  |
| Componentes   | `shadcn/ui` (Radix)                        | CLI actual                 | copiados a `src/components/ui`                                         |
| Drawer mobile | `vaul`                                     | 1.1.x                      |                                                                        |
| **i18n**      | **`next-intl`**                            | **4.13.x**                 | RSC-native, funciona en Server Components, Server Actions y middleware |
| ORM           | `prisma` / `@prisma/client`                | 7.9.x                      | ver §2.1                                                               |
| DB            | PostgreSQL (Neon)                          | 17                         | pooled + direct URL                                                    |
| Auth          | `next-auth`                                | **5.0.0-beta.32 pinneado** | ver §4.3                                                               |
| Adapter       | `@auth/prisma-adapter`                     | 2.11.x                     |                                                                        |
| Tabla         | `@tanstack/react-table`                    | 9.1.x                      | API v9 ≠ v8: verificar docs al implementar                             |
| Formularios   | `react-hook-form` + `@hookform/resolvers`  | 7.85.x                     |                                                                        |
| Validación    | `zod`                                      | 4.4.x                      |                                                                        |
| Estado en URL | `nuqs`                                     | 2.9.x                      |                                                                        |
| Tests         | `vitest` 4.1.x + `@playwright/test` 1.62.x |                            |                                                                        |
| Lenguaje      | `typescript`                               | 7.0.x                      | compilador nativo; si alguna herramienta falla, bajar a 5.9            |

### 2.1. Riesgos de versión (verificar con docs antes de escribir código)

- **Prisma 7** cambió el generador por defecto (`prisma-client` con `output` explícito, salida ESM) y empuja _driver adapters_ en lugar del motor Rust. La configuración de `schema.prisma` y del singleton no es la de Prisma 5/6.
- **TanStack Table v9** tiene API distinta a la v8 que circula en la mayoría de ejemplos.
- **Tailwind 4** no usa `tailwind.config.js`; el tema va en CSS.
- **Auth.js v5** sigue en beta: pinnear versión exacta, sin `^`.
- **next-intl 4** con Next 16: confirmar la forma actual de `routing.ts` / `request.ts` y del plugin, que cambió entre v3 y v4.

Primera tarea de Fase 1: consultar documentación actual de estos cinco puntos y dejar un ADR corto en `docs/adr/`.

---

## 3. Decisiones de arquitectura

### 3.1. Obtención de datos: RSC + Server Actions (sin TanStack Query)

**Gap v1:** mezclaba RSC, Server Actions y TanStack Query sin definir dueño del estado. Eso duplica caché (RSC + Query), obliga a sincronizar filtros de la URL con `queryKey` y multiplica el código para un dashboard de una sola lista.

**Decisión:**

- La lista se renderiza en un Server Component que lee `searchParams` y consulta Postgres. Los filtros ya viven en la URL, así que la URL _es_ la caché key: navegar cambia la query, Next re-renderiza.
- Las mutaciones son Server Actions con `revalidatePath`.
- Feedback inmediato con `useOptimistic` + `useActionState` donde aporte (cambio de estado desde la tabla, marcar etapa completada).
- `nuqs` gestiona los parámetros de URL en cliente con transiciones (`shallow: false`).

Se reevalúa TanStack Query solo si aparece una necesidad real de caché cliente (no la hay en el MVP).

### 3.2. Capa de acceso a datos (DAL)

Todo acceso a Prisma vive en `src/server/dal/*`. Ninguna página ni acción llama a `prisma` directamente.

Regla no negociable: **toda** consulta filtra por `userId` obtenido de la sesión en el servidor. Nunca se confía en un `applicationId` del cliente sin `where: { id, userId }`. Esto cierra el gap de autorización de v1, que no mencionaba ownership en ningún punto.

### 3.3. Middleware ≠ autorización

El middleware corre en Edge y no puede consultar Prisma. Hace dos cosas y ninguna es seguridad: resolver el idioma (§8.2) y redirigir a login por ausencia de cookie de sesión. La autorización real siempre ocurre en el DAL.

### 3.4. Contrato de resultado de acciones

```ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; errorKey: string; fieldErrors?: Record<string, string[]> }
```

Wrapper único `authedAction(schema, handler)` que: valida sesión, parsea input con Zod, ejecuta, captura errores conocidos de Prisma y devuelve `ActionResult`. Sin excepciones cruzando el límite servidor→cliente.

`errorKey` y los valores de `fieldErrors` son **claves de traducción**, no texto: el servidor no conoce el idioma del render del cliente (§8.5).

### 3.5. Fechas, números y zonas horarias

`appliedAt` es **fecha sin hora** (`@db.Date`): el usuario elige un día, no un instante. Evita el off-by-one clásico al formatear en otra zona. `scheduledAt` de una etapa sí es `timestamptz`.

Todo formateo pasa por el `formatter` de next-intl (`useFormatter` / `getFormatter`), atado al locale activo: `es-AR` da `18/08/2026`, `en-US` da `08/18/2026`. Prohibido `toLocaleDateString()` suelto en componentes: rompe la coherencia y no respeta el idioma elegido.

### 3.6. Borrado

Sin soft delete. Borrar postulación = borrar fila, con `AlertDialog` de confirmación. Para "ya no me interesa" existe el estado `WITHDRAWN`. Un flag `deletedAt` en el MVP solo añadiría un `where` a cada consulta sin beneficio.

### 3.7. Idiomas

Español e inglés, con español por defecto. Los detalles están en §8 porque el i18n atraviesa routing, modelo de datos, validación, SEO y tests: no es una decisión de presentación.

---

## 4. Autenticación

### 4.1. Proveedores

1. **Google** — único método de acceso del MVP.
2. **Credentials de desarrollo** — habilitado solo si `NODE_ENV !== 'production'`. Permite desarrollo local sin secretos OAuth y, sobre todo, hace posibles los tests E2E de Playwright. Sin esto, E2E requiere automatizar un login de Google (frágil y contra sus ToS).

LinkedIn queda fuera por completo: sin provider, sin variables de entorno, sin botón, sin flag. Añadirlo después es un provider más en `src/server/auth.ts` y un botón; no condiciona ninguna decisión de este plan.

### 4.2. Sesiones: JWT

Prisma Adapter persiste `User` y `Account`; la sesión viaja en JWT (cookie). Database sessions añadirían un `SELECT` por request contra Neon serverless sin beneficio para un producto de un solo usuario por cuenta. El `userId` y el `locale` se inyectan en el token en el callback `jwt` y se exponen en `session.user`.

### 4.3. Gaps de OAuth que v1 no contempla

| Gap                                                                                                  | Impacto                                    | Mitigación                                                                                                           |
| :--------------------------------------------------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| Google exige **URL de política de privacidad y términos** en la pantalla de consentimiento           | Bloquea publicar la app fuera de modo test | `/[locale]/legal/privacidad` y `/[locale]/legal/terminos` entran en Fase 2, no en "pulido"                           |
| Las **preview deployments de Vercel tienen dominio dinámico**; Google requiere redirect URIs exactas | OAuth roto en cada preview                 | `AUTH_REDIRECT_PROXY_URL` apuntando a producción, o se acepta que en preview solo funciona el provider de desarrollo |
| `AUTH_URL` detrás del proxy de Vercel                                                                | Callbacks con host equivocado              | `trustHost: true`                                                                                                    |
| Auth.js v5 en beta                                                                                   | Breaking changes entre betas               | Versión pinneada exacta + un solo módulo `src/server/auth.ts` como superficie de contacto                            |
| Las rutas de Auth.js **no deben llevar prefijo de idioma**                                           | `/es/api/auth/callback` rompe el callback  | El matcher del middleware excluye `/api`; `/api/auth/[...nextauth]` vive fuera de `[locale]` (§8.2)                  |

### 4.4. Eliminación de cuenta (RGPD)

Flujo: Ajustes → "Eliminar cuenta" → diálogo que exige escribir el email → Server Action → `prisma.user.delete()` → cascada borra `Account`, `Session`, `Application`, `InterviewStage`, `ApplicationEvent` y las `Platform` propias → `signOut()`.

La cascada se garantiza en el esquema (`onDelete: Cascade`), no en código de aplicación. Complemento de portabilidad: **exportar datos** (JSON y CSV) antes de borrar — el derecho al olvido sin portabilidad es medio cumplimiento y cuesta ~40 líneas.

---

## 5. Modelo de datos

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum ApplicationStatus {
  APPLIED
  SCREENING
  INTERVIEWING
  OFFER
  REJECTED
  WITHDRAWN
}

enum LocationType {
  REMOTE
  HYBRID
  ONSITE
}

enum StageType {
  HR_SCREEN
  TECHNICAL_TEST
  TECH_INTERVIEW
  CULTURE_FIT
  MANAGEMENT
  OFFER_REVIEW
  OTHER
}

enum SalaryPeriod {
  HOURLY
  MONTHLY
  YEARLY
}

enum ApplicationEventType {
  CREATED
  STATUS_CHANGED
  STAGE_ADDED
  STAGE_COMPLETED
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  locale        String    @default("es") @db.VarChar(5)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts     Account[]
  sessions     Session[]
  applications Application[]
  platforms    Platform[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Platform {
  id        String   @id @default(cuid())
  name      String
  slug      String
  baseUrl   String?
  isDefault Boolean  @default(false)
  userId    String?
  createdAt DateTime @default(now())

  user         User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  applications Application[]

  @@unique([userId, slug])
  @@index([userId])
  @@map("platforms")
}

model Application {
  id             String            @id @default(cuid())
  userId         String
  platformId     String?
  companyName    String            @db.VarChar(120)
  jobTitle       String            @db.VarChar(160)
  jobUrl         String?           @db.VarChar(2048)
  jobUrlKey      String?           @db.VarChar(512)
  salaryMin      Int?
  salaryMax      Int?
  salaryCurrency String?           @db.VarChar(3)
  salaryPeriod   SalaryPeriod?
  locationType   LocationType
  locationCity   String?           @db.VarChar(120)
  status         ApplicationStatus @default(APPLIED)
  appliedAt      DateTime          @db.Date
  notes          String?           @db.VarChar(5000)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  user     User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  platform Platform?          @relation(fields: [platformId], references: [id], onDelete: SetNull)
  stages   InterviewStage[]
  events   ApplicationEvent[]

  @@index([userId, status, appliedAt(sort: Desc)])
  @@index([userId, appliedAt(sort: Desc)])
  @@index([userId, platformId])
  @@index([userId, jobUrlKey])
  @@map("applications")
}

model InterviewStage {
  id            String    @id @default(cuid())
  applicationId String
  type          StageType
  title         String?   @db.VarChar(120)
  position      Int       @default(0)
  scheduledAt   DateTime?
  completedAt   DateTime?
  feedback      String?   @db.VarChar(3000)
  createdAt     DateTime  @default(now())

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([applicationId, position])
  @@map("interview_stages")
}

model ApplicationEvent {
  id            String               @id @default(cuid())
  applicationId String
  type          ApplicationEventType
  fromStatus    ApplicationStatus?
  toStatus      ApplicationStatus?
  createdAt     DateTime             @default(now())

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([applicationId, createdAt])
  @@map("application_events")
}
```

### 5.1. Justificación de los cambios sobre el ERD de v1

| Campo / tabla                                                    | Motivo                                                                                                                                                                   |
| :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User.locale`                                                    | La cookie `NEXT_LOCALE` muere al cambiar de dispositivo o navegador. Persistir la preferencia hace que el idioma siga a la cuenta.                                       |
| `salaryMin/Max/Currency/Period` en vez de `salary_range: String` | Un string no se filtra, no se ordena y no permite métricas. Migrar después obliga a parsear texto libre histórico.                                                       |
| `jobUrlKey`                                                      | URL normalizada (sin `utm_*`, sin fragmento, host en minúsculas) para detectar duplicados. La `jobUrl` original se conserva intacta.                                     |
| `locationCity`                                                   | `LocationType` sola no distingue "híbrido en Córdoba" de "híbrido en Madrid".                                                                                            |
| `InterviewStage.position`                                        | v1 no tenía orden: las etapas son una secuencia, y `scheduledAt` es opcional, así que no sirve para ordenar.                                                             |
| `completedAt` en vez de `completed: Boolean`                     | Un booleano pierde _cuándo_; el timestamp da el booleano gratis.                                                                                                         |
| `StageType.OTHER` + `title`                                      | v1 dejaba "Enum/Text" sin resolver. Enum cerrado + título libre opcional.                                                                                                |
| `ApplicationEvent`                                               | v1 prometía "tiempos de respuesta y métricas de efectividad" sin ninguna tabla que registre transiciones. Sin esto, la promesa del producto es infalsificable.           |
| `platformId` opcional + `SetNull`                                | Permite borrar una plataforma propia sin bloquear ni romper postulaciones históricas, y evita el conflicto de orden entre `Restrict` y la cascada de borrado de usuario. |
| `@@unique([userId, slug])`                                       | Ver gap de unicidad en §5.2.                                                                                                                                             |

Los valores de los enums viven en la base en inglés y **nunca** se muestran crudos: siempre pasan por `t()` (§8.4). El idioma de la UI no toca la base de datos.

### 5.2. Gap de unicidad en `Platform`

v1 marcaba `name (Unique)` con `user_id` opcional. En Postgres, `NULL` no colisiona con `NULL` en un índice único, así que `@@unique([userId, slug])` **no** impide dos plataformas globales con el mismo nombre. Se resuelve con un índice único parcial en migración SQL manual:

```sql
CREATE UNIQUE INDEX platforms_global_slug_key
  ON platforms (slug) WHERE user_id IS NULL;
```

Reglas: `slug` se deriva del nombre (minúsculas, sin acentos, guiones). Las plataformas con `userId IS NULL` son de solo lectura para cualquier usuario. Al crear una propia, si el slug coincide con una global, se reutiliza la global.

### 5.3. Migraciones SQL manuales (fuera del alcance de Prisma)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX applications_company_trgm_idx
  ON applications USING gin (company_name gin_trgm_ops);

CREATE INDEX applications_title_trgm_idx
  ON applications USING gin (job_title gin_trgm_ops);
```

### 5.4. Seed y su frontera con el i18n

Plataformas globales, identificadas por `slug` estable: `linkedin`, `getonboard`, `weworkremotely`, `indeed`, `remotive`, `glassdoor`, `otta`, `torre`, `computrabajo`, `company-site`, `referral`, `other`. Idempotente por `slug` (`upsert`), ejecutable con `prisma db seed` en cualquier entorno.

**Gap detectado:** los nombres del seed son datos en la base, no texto estático de la UI, pero algunos sí necesitan traducirse. Regla:

- Los slugs de marca (`linkedin`, `indeed`, …) se muestran con `name` tal cual: los nombres propios no se traducen.
- Los slugs genéricos (`company-site`, `referral`, `other`) se muestran con `t('platforms.' + slug)`.
- Implementación uniforme: si `isDefault`, se intenta la clave `platforms.<slug>` y se cae a `name` si no existe. Si es del usuario, siempre `name`.

El `name` guardado en la base queda como fallback en español y como valor del export.

---

## 6. Contratos

### 6.1. Parámetros de URL del dashboard

```
/es/dashboard?q=react&status=APPLIED,INTERVIEWING&platform=<id>,<id>
             &location=REMOTE&from=2026-01-01&to=2026-03-31
             &sort=appliedAt&dir=desc&page=2&per=25
```

Parseados por un único `parseApplicationSearchParams` con Zod. **`sort` es un enum cerrado** (`appliedAt | updatedAt | companyName | jobTitle | status`) y `dir` es `asc | desc`: pasar `orderBy` directo desde la URL a Prisma es una inyección de ordenamiento y una fuga de plan de consulta. `per` limitado a `[10, 25, 50]`, `page ≥ 1`.

Los nombres de los parámetros **no se traducen**: son API, no UI. Una URL compartida entre un usuario en español y otro en inglés debe abrir el mismo listado. Cualquier parámetro inválido cae al valor por defecto en vez de lanzar error: una URL compartida y mal editada no debe romper el dashboard.

### 6.2. Esquemas Zod (`src/lib/validation/`)

Cada esquema emite **claves de traducción** como mensaje de error, nunca texto:

```ts
salaryMax: z.number().int().positive().optional(),
```

con refinamiento `{ message: 'validation.salary.maxLowerThanMin', path: ['salaryMax'] }`.

Reglas reales, no solo tipos:

- `applicationInputSchema`
  - `salaryMax >= salaryMin` cuando ambos existen.
  - `jobUrl` debe ser `http`/`https` (rechaza `javascript:`).
  - `appliedAt` no puede ser futura ni anterior a 5 años.
  - `locationCity` obligatoria si `locationType !== REMOTE`.
  - `salaryCurrency` obligatoria si hay algún importe.
- `stageInputSchema` — `title` obligatorio si `type === OTHER`.
- `platformInputSchema` — nombre 2–40, `baseUrl` opcional válida.
- `searchParamsSchema` — §6.1.
- `localeSchema` — `es | en`.
- `deleteAccountSchema` — el email escrito debe coincidir con el de sesión.

Los mismos esquemas se usan en el resolver de React Hook Form y dentro del wrapper de acciones. Una sola fuente de verdad, en un solo idioma: el de las claves.

### 6.3. Server Actions

| Acción                                     | Entrada                 | Efecto                                                |
| :----------------------------------------- | :---------------------- | :---------------------------------------------------- |
| `createApplication`                        | `applicationInput`      | Crea + `ApplicationEvent(CREATED)` en transacción     |
| `updateApplication`                        | `id + applicationInput` | Actualiza; si cambia `status`, emite `STATUS_CHANGED` |
| `updateApplicationStatus`                  | `id, status`            | Atajo para el cambio inline desde la tabla            |
| `deleteApplication`                        | `id`                    | Borra (cascada de etapas y eventos)                   |
| `addStage` / `updateStage` / `deleteStage` |                         | `position` = max+1 al crear                           |
| `toggleStageCompleted`                     | `id`                    | Setea/limpia `completedAt` + evento                   |
| `createPlatform`                           | `platformInput`         | Reutiliza global si el slug coincide                  |
| `updateProfile`                            | `name`                  |                                                       |
| `updateLocale`                             | `locale`                | Persiste en `User.locale` + cookie `NEXT_LOCALE`      |
| `exportUserData`                           | `format`                | Devuelve JSON/CSV con encabezados en el idioma activo |
| `deleteAccount`                            | `email`                 | Cascada + `signOut`                                   |

Regla de negocio a fijar (v1 no la definía): **añadir una etapa no cambia el estado automáticamente.** Se sugiere el cambio en la UI ("¿Mover a _En entrevistas_?") y decide el usuario. La automatización silenciosa genera desconfianza en los datos.

---

## 7. Dashboard

### 7.1. Layout

- **Desktop (≥1024px):** barra de filtros sticky + tabla TanStack (columnas: Empresa, Puesto, Plataforma, Estado, Modalidad, Fecha, Etapas, acciones). Estado editable inline con `Select`.
- **Mobile:** cards apiladas, barra de filtros colapsable en `Sheet`, FAB "Nueva postulación", detalle en `Drawer` (vaul).
- **Detalle:** drawer lateral que recibe la fila ya cargada y pide las etapas al abrirse. Sin route intercepting en el MVP.

### 7.2. Franja de métricas

Cuatro tarjetas sobre una consulta `groupBy` + agregados sobre `ApplicationEvent`:
`Activas` · `Tasa de respuesta` (≥ SCREENING / total) · `Días promedio hasta primera respuesta` · `Entrevistas en curso`.

### 7.3. Búsqueda

**Decisión MVP:** `ILIKE '%q%'` sobre `companyName` y `jobTitle`, apoyado en índices `pg_trgm` (§5.3). Una sola ruta de código, tipada, dentro del query builder de Prisma.

**Por qué no FTS ahora:** el índice de v1 (`to_tsvector('spanish', job_title || ' ' || company_name)`) tiene tres problemas: `||` con un `NULL` produce `NULL` (sin `coalesce` el índice pierde filas), la configuración `spanish` stemmiza mal títulos en inglés, y Prisma no expresa índices de expresión, obligando a `$queryRaw` y a duplicar toda la lógica de filtros en SQL crudo. Con una app bilingüe el problema del stemmer empeora: el contenido del usuario mezcla idiomas dentro de la misma cuenta, y `pg_trgm` es agnóstico al idioma por diseño.

**Upgrade documentado** (cuando un usuario supere ~5.000 postulaciones): columna generada con configuración `simple`, que no stemmiza y por tanto no asume idioma:

```sql
ALTER TABLE applications ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(company_name,'') || ' ' || coalesce(job_title,''))
  ) STORED;
CREATE INDEX applications_search_idx ON applications USING gin (search_vector);
```

### 7.4. Estados de UI obligatorios

Cada vista define: carga (skeleton), vacío inicial (onboarding con CTA), vacío por filtros (con "limpiar filtros"), error (`error.tsx` con reintento) y estado de envío en formularios. v1 no mencionaba ninguno; son la mitad del trabajo real de un dashboard. Todos sus textos salen de `messages`.

### 7.5. Duplicados

Al crear, si existe una postulación con el mismo `jobUrlKey`, o misma empresa+puesto en los últimos 90 días, se muestra un aviso no bloqueante con enlace a la existente.

---

## 8. Internacionalización

Requisito: la aplicación funciona en **español e inglés**, sin ningún string hardcodeado en el front. Se traduce el sitio, no los datos del usuario.

### 8.1. Qué se traduce y qué no

| Se traduce                                                          | No se traduce                                                       |
| :------------------------------------------------------------------ | :------------------------------------------------------------------ |
| Navegación, botones, títulos, ayudas, textos de la landing, legales | Empresa, puesto, notas, feedback, ciudad: lo que escribe el usuario |
| Labels, placeholders y errores de validación de los formularios     | Los **valores** cargados en esos formularios                        |
| Etiquetas de enums (`APPLIED` → "Postulado" / "Applied")            | Los valores de enum en la base                                      |
| Nombres de plataformas globales genéricas (§5.4)                    | Nombres propios de marca y plataformas creadas por el usuario       |
| Metadatos SEO, OG, legales                                          | Códigos de moneda, URLs, parámetros de query                        |
| Encabezados del export CSV                                          | Las filas del export                                                |

Consecuencia directa de la regla del usuario: **los formularios operan en un solo idioma de datos**, el que haya cargado la persona. Cambiar el idioma de la interfaz reetiqueta los campos, nunca reescribe los valores.

### 8.2. Routing

`next-intl` con segmento `[locale]` y `localePrefix: 'always'`: `/es/dashboard`, `/en/dashboard`. Prefijo siempre explícito porque simplifica el `hreflang`, el sitemap y el canonical, y elimina la ambigüedad de qué idioma sirve `/`.

Resolución en el middleware, en este orden: cookie `NEXT_LOCALE` → `User.locale` (si hay sesión, inyectado en el JWT) → cabecera `Accept-Language` → `es`.

Un único `middleware.ts` compone dos responsabilidades: primero next-intl resuelve y reescribe el locale, después la comprobación optimista de sesión redirige a `/${locale}/login`. El `matcher` excluye `/api`, `/_next` y estáticos — con `/api/auth` fuera del prefijo, o los callbacks de Google se rompen (§4.3).

### 8.3. Mensajes y tipado

`src/messages/es.json` y `src/messages/en.json`, con namespaces por dominio: `common`, `nav`, `landing`, `auth`, `dashboard`, `application`, `stage`, `platform`, `settings`, `enums`, `validation`, `errors`, `metrics`, `legal`.

`es.json` es la fuente de verdad de las claves y tipa `IntlMessages` por augmentación de módulo: **una clave inexistente o mal escrita es un error de compilación**, no un `dashboard.titel` renderizado en producción. Esto es lo que convierte "nada hardcodeado" en una regla verificable en vez de una intención.

### 8.4. Enums y etiquetas de dominio

`ApplicationStatus`, `LocationType`, `StageType` y `SalaryPeriod` se muestran con `t('enums.status.' + value)`. Desaparece el `lib/labels.ts` que planteaba v2: los mensajes son el único diccionario. Ningún componente contiene un `switch` de estados a texto.

### 8.5. Validación y errores

El servidor no sabe en qué idioma se está renderizando el cliente, así que **nunca** devuelve texto. Los esquemas Zod emiten claves (§6.2) y las Server Actions devuelven `errorKey` (§3.4). El componente de formulario traduce en el punto de render con `t(fieldError)`.

Beneficio lateral: los tests unitarios de los esquemas asertan claves estables en vez de frases, y dejan de romperse cada vez que se reescribe un texto.

### 8.6. Formato de fechas, números y moneda

`useFormatter` / `getFormatter` de next-intl con el locale activo. La moneda es dato del usuario (`salaryCurrency`), el formato es de la interfaz: `USD 3.500` en `es-AR` y `$3,500` en `en-US` salen del mismo registro. Un solo `lib/salary.ts` y un solo `lib/dates.ts` concentran la presentación.

### 8.7. SEO bilingüe

- `generateMetadata` por locale, con título y descripción desde `messages`.
- `alternates.languages` con `es`, `en` y `x-default`.
- `sitemap.ts` emite ambas variantes de cada ruta pública con sus alternates.
- `<html lang={locale}>` dinámico en el layout.
- `opengraph-image.tsx` por locale.

### 8.8. Cómo se impide el hardcodeo

1. Tipado estricto de claves (§8.3).
2. Regla de ESLint que prohíbe literales de texto en JSX (`react/jsx-no-literals`), con una allowlist mínima para símbolos y separadores.
3. Test de paridad: `es.json` y `en.json` deben tener **exactamente** el mismo conjunto de claves, sin huérfanas en ninguno de los dos (§10).
4. Revisión: cualquier PR que añada UI toca `messages/`; si no lo toca, o no añadió texto o lo hardcodeó.

### 8.9. Selector de idioma

Presente en el header de la landing y en Ajustes. Al cambiar: escribe la cookie, persiste en `User.locale` si hay sesión (`updateLocale`) y navega a la misma ruta en el otro locale conservando los `searchParams` — cambiar de idioma no debe perder los filtros del dashboard.

---

## 9. Estructura de carpetas

```
src/
  app/
    [locale]/
      (marketing)/
        page.tsx
        legal/privacidad/page.tsx
        legal/terminos/page.tsx
        opengraph-image.tsx
      (auth)/login/page.tsx
      (app)/
        layout.tsx
        dashboard/page.tsx
        dashboard/settings/page.tsx
      layout.tsx
      error.tsx
      not-found.tsx
    api/auth/[...nextauth]/route.ts
    sitemap.ts
    robots.ts
  i18n/
    routing.ts
    request.ts
    navigation.ts
  messages/
    es.json
    en.json
  components/
    ui/
    applications/
    platforms/
    layout/
    marketing/
  server/
    auth.ts
    db.ts
    dal/{applications,stages,platforms,users,metrics}.ts
    actions/{application,stage,platform,account}.ts
    actions/authed-action.ts
  lib/
    validation/
    search-params.ts
    dates.ts
    salary.ts
    url.ts
  types/
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/
  unit/
  e2e/
docs/adr/
middleware.ts
```

Todo `Link` y `redirect` sale de `src/i18n/navigation.ts` (wrappers locale-aware de next-intl), nunca de `next/link` directo: importar el original es la forma habitual de perder el prefijo de idioma al navegar.

---

## 10. Diseño y accesibilidad

- Tokens de color en `@theme` (Tailwind 4), modo claro/oscuro vía `prefers-color-scheme` + toggle.
- **Los badges de estado nunca comunican solo por color:** color + texto + icono (daltonismo y contraste).
- Foco visible en todo elemento interactivo; `Dialog`/`Drawer` con trampa de foco y retorno al disparador al cerrar (Radix lo da, hay que verificarlo).
- Tabla navegable por teclado; acciones de fila alcanzables sin hover.
- Toasts con `aria-live="polite"`; errores de formulario asociados con `aria-describedby`.
- `<html lang>` correcto por locale: un lector de pantalla en inglés leyendo texto marcado como español pronuncia mal todo.
- El layout debe tolerar textos ~30% más largos: el inglés y el español no miden igual, y los botones de ancho fijo se rompen con "Nueva postulación" vs "New application".
- Objetivos medibles: Lighthouse ≥95 en Performance/Accesibilidad/SEO en la landing; ≥90 Accesibilidad en el dashboard; LCP < 2.0s en 4G simulada; cero violaciones serias en `axe`.

---

## 11. Testing

| Nivel       | Herramienta               | Qué cubre                                                                                                                                                                  |
| :---------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | Vitest                    | Esquemas Zod (casos límite de §6.2, asertando claves), parser de searchParams, normalización de URL, formateo de salario y fechas en ambos locales, cálculo de métricas    |
| i18n        | Vitest                    | Paridad exacta de claves entre `es.json` y `en.json`; ninguna clave vacía; toda clave de `validation.*` usada por algún esquema                                            |
| Integración | Vitest + Postgres efímero | DAL: aislamiento por usuario (un usuario **no** ve ni edita datos de otro), cascada de borrado de cuenta, unicidad de plataformas                                          |
| E2E         | Playwright                | 4 flujos: login (provider dev) → crear → filtrar/buscar → editar estado → borrar; añadir y completar etapa; cambiar idioma conservando filtros; exportar y eliminar cuenta |

El test de aislamiento por usuario es el más importante del proyecto: es el único bug de esta app con consecuencias legales.

---

## 12. Entornos, CI/CD y variables

```
DATABASE_URL          # Neon pooled (pgbouncer)
DIRECT_URL            # Neon directa, para migraciones
AUTH_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_REDIRECT_PROXY_URL
NEXT_PUBLIC_APP_URL
```

`.env.example` versionado. Validación de entorno al arrancar con Zod (`src/lib/env.ts`): fallar en el build es mejor que fallar en el primer login en producción.

Ramas de Neon: `main` (prod) y una rama por entorno de desarrollo/test. GitHub Actions en cada PR: `typecheck` → `lint` → `test:unit` → `build`; E2E contra el preview de Vercel. Migraciones con `prisma migrate deploy` en el paso de build de producción (nunca `migrate dev` en CI).

---

## 13. Roadmap con criterios de aceptación

### Fase 1 — Fundaciones, datos e i18n

1. `create-next-app` (TS, Tailwind 4, ESLint, App Router) + Prettier + rutas de import absolutas.
2. ADR de versiones (§2.1) tras consultar documentación actual.
3. **Infraestructura i18n antes que cualquier UI**: `next-intl`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, estructura `app/[locale]`, `messages/{es,en}.json` semilla, tipado de `IntlMessages`, regla de lint anti-literales.
4. Proyecto Neon, `DATABASE_URL`/`DIRECT_URL`, singleton de Prisma.
5. `schema.prisma` (§5) + migración inicial.
6. Migración SQL manual: `pg_trgm`, índices trigram, índice único parcial de plataformas globales.
7. `seed.ts` idempotente con los slugs de §5.4.
8. `src/lib/env.ts` con validación Zod.

**Hecho cuando:** `prisma migrate reset && prisma db seed` reconstruye la base desde cero sin intervención manual, `/es` y `/en` sirven una página de prueba con texto traducido, y `npm run build` pasa en limpio.

_Nota de orden:_ el i18n va en Fase 1, no al final. Retrofitear traducciones sobre una UI ya escrita implica revisitar cada componente, y en la práctica siempre queda texto hardcodeado.

### Fase 2 — Auth, landing y legales

1. `src/server/auth.ts` (Auth.js v5 pinneado, Prisma adapter, JWT, `userId` y `locale` en sesión).
2. Provider de desarrollo con guardia de `NODE_ENV`.
3. Google OAuth configurado (localhost + producción).
4. Middleware compuesto: locale + redirección optimista (§8.2).
5. Landing bilingüe: hero, características, prueba social, CTA. Sin capturas: un componente mock del dashboard renderizado en vivo (evita el bloqueo circular de v1, que pedía capturas de una UI aún inexistente).
6. Metadatos por locale, `alternates.languages`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, JSON-LD.
7. `/legal/privacidad` y `/legal/terminos` en ambos idiomas (requisito de Google, §4.3).
8. `/login` con redirección si ya hay sesión.
9. Selector de idioma en el header.

**Hecho cuando:** se entra con Google en producción, `/dashboard` sin sesión redirige a `/{locale}/login`, la landing existe completa en ambos idiomas y Lighthouse SEO ≥95.

### Fase 3 — CRUD y dashboard

1. DAL de applications con filtros, orden, paginación y conteos.
2. `authed-action.ts` + acciones de §6.3.
3. Esquemas Zod completos con claves de traducción.
4. Tabla TanStack (desktop) y cards (mobile).
5. Barra de filtros con `nuqs` (búsqueda con debounce, multi-select de estado y plataforma, rango de fechas, limpiar filtros).
6. Formulario crear/editar en Dialog (desktop) / Drawer (mobile) con RHF + Zod, incluido el alta rápida de plataforma propia.
7. Borrado con confirmación y feedback optimista.
8. Estados vacío / carga / error (§7.4) y aviso de duplicados.

**Hecho cuando:** un usuario recorre alta → filtro → edición → borrado sin recargar manualmente, la URL es compartible y restaura el estado exacto, todo el dashboard existe en ambos idiomas, y el test de aislamiento entre usuarios pasa.

### Fase 4 — Entrevistas, métricas, cuenta y despliegue

1. Etapas dentro del detalle: alta, reordenamiento, completar, feedback.
2. Franja de métricas (§7.2).
3. Ajustes: perfil, idioma, exportación JSON/CSV, eliminación de cuenta con doble confirmación.
4. Capturas reales para la landing y la OG image, en ambos idiomas.
5. Auditoría `axe` + Lighthouse en `es` y `en`, corrección de hallazgos.
6. Suite E2E en verde contra preview.
7. Despliegue a producción, dominio, verificación de la pantalla de consentimiento de Google.

**Hecho cuando:** el flujo completo funciona en el dominio de producción en ambos idiomas y la eliminación de cuenta deja cero filas del usuario en todas las tablas (verificado por consulta directa).

---

## 14. Riesgos

| Riesgo                                                                              | Prob. | Impacto | Mitigación                                               |
| :---------------------------------------------------------------------------------- | :---- | :------ | :------------------------------------------------------- |
| Breaking change en Auth.js beta                                                     | Media | Alto    | Versión exacta; superficie aislada en un módulo          |
| API de Prisma 7 / TanStack Table v9 / next-intl 4 distinta a los ejemplos conocidos | Alta  | Medio   | ADR con documentación verificada antes de codificar      |
| Deriva entre `es.json` y `en.json`                                                  | Alta  | Medio   | Test de paridad + tipado de claves + lint anti-literales |
| Textos hardcodeados que se cuelan en componentes nuevos                             | Media | Medio   | `react/jsx-no-literals` en CI, no solo en el editor      |
| Layout roto por longitud de texto entre idiomas                                     | Media | Bajo    | Revisión visual en ambos locales en cada fase            |
| Cold starts de Neon free tier                                                       | Media | Bajo    | Skeletons; aceptado en MVP                               |
| Alcance creciendo hacia recordatorios/IA                                            | Alta  | Alto    | §1.2 como contrato                                       |
| TypeScript 7 nativo incompatible con alguna herramienta                             | Media | Bajo    | Bajar a 5.9                                              |

---

## 15. Decisiones confirmadas (2026-08-18)

1. Sin TanStack Query en el MVP (§3.1).
2. Salario estructurado, no texto libre (§5).
3. **LinkedIn eliminado por completo** como método de acceso (§4.1).
4. Provider de credenciales solo en desarrollo, para E2E (§4.1).
5. `ApplicationEvent` desde el día 1 (§5).
6. Sin soft delete (§3.6).
7. i18n es/en como infraestructura de Fase 1; nada hardcodeado; formularios en un único idioma de datos (§8).

---

## 16. Backlog post-MVP

Recordatorios de entrevistas · export `.ics` · extensión de navegador para alta en un clic · gráficos de embudo y series temporales · notas en Markdown · adjuntar CV por postulación · tablero Kanban · vista de calendario · autocompletado de empresa · login con LinkedIn · más locales (pt-BR).
