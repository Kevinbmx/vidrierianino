---
name: nextjs-frontend-pro
description: Define el estándar de arquitectura para el frontend en Next.js dentro de vidrieria-nino.
---

# Next.js Enterprise Pattern

## Organización de Archivos
- **Features (`src/features/`)**: Estructura por dominio (ej. `features/quoting`, `features/inventory`). Cada una con sus propios hooks y servicios.
- **UI (`src/components/ui`)**: Componentes atómicos (botones, inputs) basados en Shadcn/UI si es posible.

## Manejo de Datos y Estado
- **TanStack Query**: Obligatorio. Usa `useQuery` para obtener materiales y `useMutation` para crear presupuestos.
- **Zod**: Todas las interfaces de TypeScript deben tener una validación de esquema correspondiente con Zod para los formularios.
- **Type Safety**: Crea `src/types/api.d.ts` para espejar los modelos de Laravel.

## Reglas de Interfaz
- **Mobile First**: El personal de la vidriería usará tablets o celulares. Diseña con Tailwind pensando en táctil.
- **Optimistic Updates**: Al cambiar el estado de un pedido (ej. de "Pendiente" a "Cortado"), actualiza la UI antes de que termine la petición.