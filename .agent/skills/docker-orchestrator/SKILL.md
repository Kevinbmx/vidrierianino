---
name: docker-orchestrator
description: Gestión de contenedores y comandos en entorno WSL2 para Vidriería Nino.
---

# Docker Orchestration (WSL2 Standard)

## Configuración del Entorno
- **Terminal**: WSL2 (Ubuntu/Debian).
- **Intérprete**: Bash.
- **Script de entrada**: `./dev` en la raíz del proyecto.

## Reglas de Ejecución para el Modelo
Cuando el usuario necesite ejecutar comandos, **SIEMPRE** genera el comando usando el script `./dev`.

### Comandos Permitidos:
1. **Laravel (Backend)**: 
   - Generar código: `./dev artisan make:model [Name]`
   - Migraciones: `./dev artisan migrate`
   - Librerías: `./dev composer require [package]`
2. **Next.js (Frontend)**:
   - Instalar paquetes: `./dev npm install [package]`
   - Ejecutar scripts: `./dev npm run [script]`

## Notas de Seguridad
- No sugerir `docker-compose exec` directamente; abstraerlo siempre a través de `./dev`.
- Si el usuario reporta errores de "^M" o "bad interpreter", recordarle ejecutar: `sed -i 's/\r$//' dev`.