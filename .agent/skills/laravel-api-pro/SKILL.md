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
- **Precisión Numérica**: Usa siempre `decimal(12,4)` en migraciones. Para cálculos, usa `bcmath` para evitar errores de redondeo en milímetros.
- **Validación Física Obligatoria**: Si un Service maneja materiales (vidrio, perfiles, varillas), DEBE implementar un método `validatePhysicalAvailability()`. No basta con `stock > 0`, debe verificar que existan piezas o retazos con las dimensiones mínimas requeridas.
- **Unit of Measure (UOM)**: La lógica de conversión (ej. Paquete -> Metro) debe residir en el Service, nunca en el Controlador.
- **Responses**: Todas las respuestas deben usar `JsonResource`.

## Documentación y Legibilidad
- **Auto-explicación**: Cada función en los Services, Actions y Controllers DEBE tener un comentario breve (PHPDoc) que explique:
  1. Qué hace la función.
  2. El impacto en el negocio (ej: "Calcula el desperdicio mínimo para evitar pérdidas").
  3. Qué unidades de medida espera y devuelve.

## Flujo de Trabajo
1. `./dev artisan make:request [Name]Request`
2. Crear Service manualmente en `app/Services`.
3. Inyectar Service en el Controlador.
4. Devolver `new [Name]Resource($result)`.

