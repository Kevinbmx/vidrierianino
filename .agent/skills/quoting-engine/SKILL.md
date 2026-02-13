---
name: quoting-engine
description: Motor de cotizaciones dinámicas y cálculo de precios para Vidriería Nino.
---

# Quoting & Pricing Engine

## Estructura de Precios
1. **Precio Base**: Se calcula sobre la unidad de venta (`sale_unit`).
2. **Costo Dinámico**: El costo real se obtiene dividiendo el costo de compra entre el rendimiento físico (ej: $CostoBarra / LongitudActual$).
3. **Cálculo de Margen**: `Precio Final = (Costo Material + Mano de Obra) * (1 + Margen de Utilidad)`.

## Manejo de Extras y Servicios
- Los "Extras" (Freno Hidráulico, Silicona, Herrajes) se suman como ítems fijos por unidad.
- El sistema debe permitir "Recargos por Urgencia" o "Descuentos por Volumen".