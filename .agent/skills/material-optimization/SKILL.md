---
name: material-optimization
description: Lógica de optimización de cortes y gestión de retazos (Remnants).
---

# Material Optimization & Remnants Logic

## Reglas de Cálculo
1. **Prioridad de Inventario**: Antes de proponer usar una plancha/barra nueva, el sistema DEBE consultar la tabla `product_remnants` buscando la pieza más pequeña que cumpla con las dimensiones requeridas.
2. **Umbral de Desperdicio (Scrap)**: 
   - Vidrios: Sobrantes menores a 20x20cm se marcan como basura.
   - Perfiles: Sobrantes menores a 30cm se marcan como basura.
3. **Cálculo de Área y Longitud**: 
   - Vidrio/Planchas: $Largo \times Ancho$.
   - Perfiles/Varillas: $Longitud$.

## Lógica de Cortes (1D y 2D)
- Al generar una orden de producción, el agente debe sugerir una "Hoja de Corte" que maximice el uso de retazos existentes.
- Debe contemplar el "Kerf" (el milímetro que se pierde por el grosor del disco de corte o diamante).