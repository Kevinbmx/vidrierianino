---
name: docker-orchestrator
description: Gestiona comandos y contenedores de Docker. Úsalo para ejecutar tareas sin entrar manualmente a los contenedores.
---

# Docker & DX Skill

## Nombres de Contenedores
- Backend: `vidrierianinoback`
- Frontend: `vidrierianinofront`

## Automatización
Si el usuario necesita instalar una librería o ejecutar un comando, usa el script de orquestación `./dev`:
- `composer`: `./dev composer require [package]`
- `npm`: `./dev npm-dev install [package]`
- `artisan`: `./dev artisan [comando]`