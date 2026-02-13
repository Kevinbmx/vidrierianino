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
Cuando ejecutes comandos mediante ./dev, no uses el modo interactivo (-it) a menos que sea estrictamente necesario (como en un tinker). Prefiere siempre comandos directos para evitar bloqueos del agente.
Si un comando de Laravel falla por permisos en WSL2, intenta ejecutar chmod -R 775 storage bootstrap/cache automáticamente

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