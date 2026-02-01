---
name: nextjs-frontend-pro
description: Define el estándar de arquitectura para el frontend en Next.js dentro de vidrieria-nino.
---

# Next.js Enterprise Pattern

Sigue este flujo para componentes y datos:

## Organización de Archivos
- **UI Components**: `src/components/ui` (componentes sin lógica, solo diseño).
- **Features**: `src/features/{feature-name}` (contiene hooks, componentes de negocio y servicios propios).

## Manejo de Datos
- **TanStack Query**: Obligatorio para fetching de datos de la API de Laravel.
- **TypeScript**: Define interfaces para cada modelo del backend en un archivo `types.ts` dentro de la feature correspondiente.