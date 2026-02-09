---
name: laravel-api-pro
description: Estandariza el desarrollo de la API en Laravel para el sistema de Vidriería Nino.
---

# Laravel Clean Architecture (Vidriería Edition)

## Arquitectura de Carpetas
- **Services (`app/Services`)**: Lógica de negocio CRUD y flujos estándar.
- **Actions (`app/Actions`)**: Lógica compleja de una sola tarea (ej. `CalculateGlassPrice`, `GenerateCuttingList`).
- **DTOs (`app/DTOs`)**: Para transferir datos entre controladores y servicios de forma tipada.

## Reglas de Oro
- **Precisión Numérica**: Para medidas de vidrios y presupuestos, usa siempre `BCMath` o asegúrate de que los cálculos se manejen con 4 decimales en base de datos (`decimal(12,4)`).
- **Responses**: Todas las respuestas deben usar `JsonResource`. Prohibido devolver `response()->json($data)`.
- **Validation**: Usa `FormRequests`. Define reglas estrictas para dimensiones (ej. `width => 'numeric|min:0.1'`).

## Flujo de Trabajo
1. `sh ./dev artisan make:request [Name]Request`
2. Crear Service manualmente en `app/Services`.
3. Inyectar Service en el Controlador.
4. Devolver `new [Name]Resource($result)`.