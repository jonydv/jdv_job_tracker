# ADR 0003 — Hallazgos de la Fase 3 (CRUD y dashboard)

Fecha: 2026-08-18.

## Bug real: `revalidatePath` con route groups necesita el patrón de archivo completo

Las Server Actions de `applications`/`platforms` llamaban `revalidatePath("/[locale]/dashboard", "page")`. La ruta real del archivo es `src/app/[locale]/(app)/dashboard/page.tsx`. Next.js exige que el patrón pasado a `revalidatePath` incluya los route groups tal como aparecen en el filesystem — `/[locale]/(app)/dashboard`, no la URL limpia sin paréntesis. Con el patrón incorrecto, `revalidatePath` no encuentra ninguna entrada de caché que coincida y no hace nada, **sin lanzar error ni warning visible**: el toast de éxito aparece, la fila se guarda en la base, pero el dashboard sigue mostrando el estado viejo hasta un refresh manual.

Síntoma: crear una postulación mostraba el toast "Postulación creada" pero el panel seguía en el estado vacío. Verificado en la base que la fila sí se había creado — el bug era puramente de invalidación de caché, no de la mutación.

Corregido en `src/server/actions/application.ts` y `platform.ts`:

```ts
const DASHBOARD_PATH = "/[locale]/(app)/dashboard"
```

## Zod `.coerce` + RHF + zodResolver no combinan bien con tipado estricto

`z.coerce.date()`/`z.coerce.number()` tienen tipo de **entrada** `unknown`, distinto del tipo de **salida** (`Date`/`number`). `zodResolver` genera un `Resolver<T>` cuyo tipo de entrada depende de eso, y como `useForm<T>` estaba tipado con la forma de _salida_ (`z.infer`), TypeScript reportaba dos tipos `Resolver` "no relacionados" — un error confuso que no señala la causa real.

Como el formulario ya convierte los valores a su tipo final antes de que React Hook Form los guarde (el `Controller` de `appliedAt` hace `new Date(event.target.value)`, y los inputs de salario usan `setValueAs` para convertir a `number | undefined`), `z.coerce` era innecesario: se sacó de `applicationInputSchema` y el tipo de entrada y salida del schema quedaron idénticos. Ver `src/lib/validation/application.ts`.

Nota aparte: `valueAsNumber: true` de RHF convierte un input vacío a `NaN`, no a `undefined` — para un campo numérico opcional hay que usar `setValueAs: (v) => v === "" ? undefined : Number(v)`.

## TanStack Table v9: no hace falta para tablas server-driven

Con filtrado/orden/paginación 100% server-side (URL como fuente de verdad, per plan §3.1), no se necesita ningún `RowModel` de TanStack más allá del core (`tableFeatures({})` vacío). `useTable` se usa solo por su composición de columnas (`createColumnHelper`) y renderizado (`table.FlexRender`), no por su estado interactivo — el ordenamiento se resuelve con links (`<Link>`) que cambian `sort`/`dir` en la URL, no con `getToggleSortingHandler()`.

## React Compiler (ESLint) exige no llamar `setState` de forma síncrona dentro de un efecto

Dos patrones que rompieron `react-hooks/set-state-in-effect`:

- Sincronizar `useState(platforms)` con la prop `platforms` vía `useEffect` — innecesario acá porque el diálogo se desmonta y remonta en cada apertura (Radix `Dialog`/`Drawer` no usan `forceMount`), así que el valor inicial de `useState` ya alcanza. Se eliminó el efecto.
- El chequeo de postulación duplicada llamaba `setDuplicate(null)` de forma síncrona en la rama temprana del efecto. Se movió esa llamada adentro del `setTimeout` (debounce) existente, dejando el cuerpo del efecto sin `setState` síncrono.

## Testing E2E: cuidado con `networkidle` + Suspense/`loading.tsx`

Varias fallas "fantasma" durante las pruebas manuales con Playwright resultaron ser capturas tomadas contra el fallback de `loading.tsx` (el esqueleto), no contra el contenido final: `page.wait_for_load_state("networkidle")` no garantiza que el streaming de un Server Component con Suspense haya terminado. La corrección fue esperar contenido real (`wait_for_selector` sobre un texto/rol específico) en vez de depender de `networkidle`. No hubo ningún bug de aplicación detrás de esas fallas — se confirmó con inspección directa de la base de datos que cada mutación se aplicaba correctamente incluso cuando el test reportaba "0 filas".

## Consecuencia para el resto del roadmap

Sin cambios de arquitectura. Los hallazgos son de implementación; el diseño de la Fase 3 (DAL con `userId` obligatorio, Server Actions con `authedAction`, filtros en la URL, tabla desktop / cards mobile) sigue vigente tal cual está en `job_tracker_mvp_plan.md`.
