# ADR 0004 — Hallazgos de la Fase 4 (Entrevistas, métricas, cuenta)

Fecha: 2026-08-18.

## Bug real: mutaciones dentro de un diálogo que permanece abierto no reciben props frescas

A diferencia de crear/editar/borrar una postulación (que cierran el diálogo tras la mutación), agregar una etapa de entrevista mantiene el diálogo de edición **abierto** para permitir cargar varias etapas seguidas. Ahí `revalidatePath` + la actualización automática de Next tras una Server Action no alcanzan: la sección de etapas seguía mostrando "Todavía no cargaste ninguna etapa." después de un alta exitosa (toast incluido), y se confirmó por SQL directo que la fila sí se había creado en `interview_stages` — el problema era enteramente de UI, no de la mutación.

Se probó agregar `router.refresh()` explícito tras el `await addStage(...)` y **tampoco alcanzó**: el árbol de Server Components se vuelve a ejecutar, pero un diálogo ya montado y profundamente anidado (`ApplicationRowActions` → `ApplicationFormDialog` → `ApplicationForm` → `StagesSection`) no garantiza recibir las props nuevas de forma visible mientras permanece abierto.

**Solución adoptada:** `StagesSection` deja de depender de que el árbol del servidor se refresque para reflejar cambios propios. Mantiene su propia lista de etapas en estado local (`useState(initialStages)`), inicializada una sola vez al montar (coherente, porque el diálogo se desmonta y remonta en cada apertura), y cada mutación (`addStage`, `updateStage`, `deleteStage`, `toggleStageCompleted`) actualiza ese estado local directamente a partir del valor que devuelve la propia Server Action — sin esperar ningún round-trip de refetch. `router.refresh()` se conserva como sincronización de fondo, solo para que la columna "Etapas" de la tabla externa (que si vive en un árbol que sí se remonta con cada revalidación) quede al día.

Regla general para el resto del proyecto: si una mutación ocurre **dentro de un panel/diálogo que se queda abierto después de la mutación**, no asumir que `revalidatePath`/`router.refresh()` va a actualizar visualmente ese panel — manejar el resultado en estado local del componente. Si la mutación **cierra** el panel (como crear/editar/borrar postulación), sí alcanza con la revalidación del servidor, porque el remount vuelve a leer props frescas.

Se aplicó el mismo `router.refresh()` de respaldo en `StatusSelect` (cambio de estado inline en la tabla) y `PlatformQuickCreate` (para que el filtro de plataformas se entere de la nueva plataforma), aunque estos sí están en árboles que se remontan con la navegación normal.

## `deleteAccount` no puede cerrar sesión desde dentro de `authedAction`

`signOut({ redirectTo })` lanza internamente una excepción especial (`NEXT_REDIRECT`) que Next.js necesita ver propagarse sin capturar para ejecutar la redirección real. El wrapper `authedAction` envuelve el handler en un `try/catch` genérico, así que llamar `signOut` ahí adentro rompería la redirección (quedaría atrapada como "error inesperado"). Se resolvió separando la eliminación de cuenta (`deleteAccount`, envuelta en `authedAction`, sin redirect) del cierre de sesión (`signOutAfterAccountDeletion`, una función suelta con su propio `"use server"`, llamada desde el cliente solo después de que `deleteAccount` confirma éxito).

## Verificado: la eliminación de cuenta borra todo

Con un usuario de prueba con postulaciones, cuentas OAuth y sesión activa: tras `deleteAccount` + `signOutAfterAccountDeletion`, consulta directa por SQL confirma `0` filas en `users`, `applications`, `accounts` y `sessions` para ese usuario. Cumple el criterio de aceptación del plan para el borrado en cascada.

## Consecuencia para el resto del roadmap

Sin cambios de arquitectura. Queda pendiente, fuera del alcance de lo que se puede hacer sin intervención del usuario: credenciales reales de Google OAuth, capturas reales para landing/OG image, auditoría formal de Lighthouse/axe, y el despliegue a producción (dominio, cuenta de Vercel, pantalla de consentimiento de Google).
