---
name: laravel-api-pro
description: Estandariza el desarrollo de la API en Laravel. Úsalo para crear modelos, controladores y lógica de negocio en vidrierianinoBackend.
---

# Laravel Clean Architecture

Al trabajar en el backend, sigue estas reglas:

## Reglas de Oro
- **Logic Location**: Prohibida la lógica en controladores. Todo debe ir en `app/Services`.
- **Validation**: Usa siempre `php artisan make:request` para validaciones.
- **Data Transformation**: Usa `Eloquent Resources` para todas las respuestas JSON.

## Comandos de ejecución
Usa siempre el script local `./dev` para no entrar al contenedor:
- Crear Service: No hay comando nativo, crea el archivo manualmente en `app/Services`.
- Comandos Artisan: `./dev artisan [comando]`