---
name: laravel-api-pro
description: Estandariza el desarrollo de la API en Laravel para el sistema de Vidriería Nino.
---

# Laravel Clean Architecture — Vidriería Nino

## 1. Arquitectura de Capas

El flujo de una petición siempre es:
`Ruta → Controller → valida → (Service si hay lógica) → Resource → JSON`

- **Controllers** (`app/Http/Controllers`): Solo validan input y orquestan. Sin lógica de negocio.
- **Resources** (`app/Http/Resources`): Transforman el modelo a JSON. Uno por modelo.
- **FormRequests** (`app/Http/Requests`): Para validaciones complejas o reutilizables (más de 4 campos o reglas personalizadas).
- **Services** (`app/Services`): Lógica de negocio CRUD y flujos multi-paso.
- **Actions** (`app/Actions`): Lógica compleja de una sola responsabilidad (ej. `GenerateCuttingList`).
- **Models** (`app/Models`): Eloquent puro — `$fillable`, `$casts` y relaciones.

---

## 2. Controllers

### Reglas
- Todos los métodos públicos **siempre tienen type hints de retorno**.
- El PHPDoc de la clase describe qué gestiona y su impacto en el negocio.
- Cada método público tiene al menos una línea de comentario con `HTTP verbo /ruta`.
- Para `update()`, usar `sometimes` en lugar de `required` para ser PATCH-friendly.
- El eager loading de relaciones se hace **solo en `show()`**, nunca en `index()`.
- La respuesta de eliminación siempre devuelve `JsonResponse` con un `message` en español.

### Ejemplo de estructura
```php
/**
 * [Nombre]Controller
 * Gestiona [qué cosa].
 * Impacto en el negocio: [por qué importa].
 */
class EntityController extends Controller
{
    // GET /api/entities
    public function index(): AnonymousResourceCollection { ... }

    // POST /api/entities
    public function store(Request $request): EntityResource { ... }

    // GET /api/entities/{entity}
    public function show(Entity $entity): EntityResource
    {
        $entity->load(['relation1', 'relation2.nested']);
        return new EntityResource($entity);
    }

    // PUT /api/entities/{entity}
    public function update(Request $request, Entity $entity): EntityResource
    {
        $validated = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'website' => 'nullable|string|max:255',  // NO usar 'url' — muy estricto
        ]);
        $entity->update($validated);
        return new EntityResource($entity->fresh());
    }

    // DELETE /api/entities/{entity}
    public function destroy(Entity $entity): JsonResponse
    {
        $entity->delete();
        return response()->json(['message' => 'Eliminado correctamente.']);
    }
}
```

### Gotcha: validación de URLs
Nunca usar la regla `url` para campos de sitio web. Los usuarios escriben `proveedor.com`
sin protocolo y la validación falla. Usar `nullable|string|max:255` y manejar el formato
en el frontend (agregar `https://` si falta antes de mostrar el link).

---

## 3. Resources

### Reglas
- **Siempre listar los campos explícitamente** — nunca `$this->resource->toArray()`.
- Usar `$this->when($this->relationLoaded('rel'), fn() => ...)` para relaciones opcionales.
- Usar `$this->whenCounted('relation')` para counts.
- Los datos anidados de `show()` se incluyen solo cuando la relación fue cargada.
- Las fechas se serializan con `->toDateTimeString()`.
- Los decimales se devuelven como `float` (el cast del modelo lo maneja).

### Gotcha: olvidar un campo en el Resource
Si un campo existe en la base de datos pero no está en el Resource, el frontend
lo recibe como `undefined` y se producen bugs silenciosos difíciles de rastrear.
**Cada vez que se agrega un campo al modelo, revisar y actualizar su Resource.**

### Ejemplo de Resource con condicionales
```php
public function toArray($request): array
{
    return [
        'id'         => $this->id,
        'name'       => $this->name,
        'is_active'  => $this->is_active,
        'created_at' => $this->created_at?->toDateTimeString(),

        // Solo cuando se hizo withCount('items')
        'items_count' => $this->whenCounted('items'),

        // Solo cuando se cargó la relación (.load('category'))
        'category' => $this->when(
            $this->relationLoaded('category'),
            fn() => ['id' => $this->category->id, 'name' => $this->category->name]
        ),

        // Derivado de una relación para acceso rápido
        'primary_contact' => $this->when(
            $this->relationLoaded('contacts'),
            fn() => $this->contacts->firstWhere('is_primary', true)?->only(['id', 'name', 'phone'])
        ),
    ];
}
```

---

## 4. Models

### Reglas
- `$fillable` debe incluir **todos** los campos que la API puede recibir por petición.
- `$casts` es obligatorio para: `boolean`, `decimal`, `array`, `datetime`.
- Cada relación tiene un comentario de una línea explicando su propósito de negocio.
- Los campos nullable siempre aclarados en comentario: `// null = sin asignar`.

### Tipos de campos en migraciones
- **Precios y medidas**: `decimal(12, 4)` — nunca `float` (imprecisión de punto flotante).
- **Booleanos**: siempre con `->default(false)` o `->default(true)` explícito.
- **Textos cortos** (nombre, código): `string(255)`.
- **Textos largos** (notas, descripción): `text()->nullable()`.
- **Foreign keys**: `foreignId('entity_id')->constrained()->cascadeOnDelete()`.

### Nomenclatura de migraciones
```
YYYY_MM_DD_HHMMSS_[verbo]_[descripcion]_table.php

create_supplier_contacts_table.php        ← tabla nueva
add_branch_id_to_supplier_contacts_table  ← campo nuevo
cleanup_suppliers_table.php               ← refactor de esquema
```

### Gotcha: migración de datos antes de eliminar columnas
Si una migración elimina columnas que contienen datos, primero migrar esos datos
a la nueva tabla/columna, luego eliminar. El orden es siempre:
1. Crear tablas/columnas destino
2. Migrar datos con `DB::table(...)->chunkById(100, ...)`
3. Eliminar columnas origen

---

## 5. Rutas Anidadas y Autorización

Cuando un recurso está anidado (`entities/{entity}/items/{item}`), el controller
**siempre verifica que el item pertenezca a la entity** antes de operar.

### Reglas
- Usar rutas explícitas para recursos anidados (no `Route::apiResource` anidado).
- La verificación de pertenencia se extrae a un método privado `verifyOwnership()` o `authorize_ownership()`.
- Si hay posibilidad de datos migratorios inconsistentes, hacer verificación en dos pasos
  (id directo → luego por relación indirecta) y auto-corregir si es posible.
- Siempre `abort(403, 'Mensaje legible en español.')` al fallar la verificación.

### Ejemplo de verificación robusta
```php
private function verifyOwnership(ParentModel $parent, ChildModel $child): void
{
    // Verificación directa
    if ($child->parent_id === $parent->id) return;

    // Verificación indirecta (cubre datos de migración inconsistentes)
    if ($child->intermediate_id) {
        $belongs = $parent->intermediates()->where('id', $child->intermediate_id)->exists();
        if ($belongs) {
            $child->update(['parent_id' => $parent->id]); // auto-corrección
            return;
        }
    }

    abort(403, 'Este recurso no pertenece al padre indicado.');
}
```

---

## 6. Rutas (`routes/api.php`)

### Convención de verbos
- `GET` → leer (sin efectos secundarios)
- `POST` → crear O acciones especiales (`/set-primary`, `/activate`, `/deactivate`)
- `PUT` → actualizar (completo o parcial — la validación con `sometimes` lo maneja)
- `DELETE` → eliminar

### Orden de definición en el archivo
1. Rutas de recurso principal (`apiResource`)
2. Acciones no-CRUD del mismo recurso (`/activate`, `/deactivate`)
3. Sub-recursos anidados agrupados visualmente

---

## 7. Reglas de Negocio Específicas de Vidriería

- **Precisión decimal**: Siempre `bcmath` para cálculos (nunca aritmética PHP nativa con floats).
- **Validación física de materiales**: Un Service que mueva material DEBE verificar
  existencia de piezas/retazos con las dimensiones físicas mínimas requeridas,
  no solo `stock > 0`.
- **Conversiones UOM**: La lógica de conversión (Paquete → Metro → Milímetro)
  vive en el Service, nunca en el Controller ni en el frontend.

---

## 8. Checklist al crear o modificar un endpoint

- [ ] Controller: type hints de retorno en todos los métodos públicos
- [ ] Controller: PHPDoc de clase con impacto en negocio
- [ ] Resource: todos los campos que el frontend necesita están presentes
- [ ] Validación: `store()` usa `required`, `update()` usa `sometimes`
- [ ] Eager loading solo en `show()`, no en `index()`
- [ ] Recursos anidados verifican pertenencia al padre
- [ ] Sin N+1: relaciones cargadas con `with()` o `load()`
- [ ] Migraciones: `up()` y `down()` completos y reversibles
- [ ] Migración con datos: migrar primero, eliminar columnas después
- [ ] `$fillable` del modelo actualizado con nuevos campos
- [ ] `$casts` correcto (bool, decimal) para nuevos campos
- [ ] Campos booleanos con `default()` explícito en migración
- [ ] Decimales con `decimal(12,4)`, nunca `float`
- [ ] Mensajes de error en español legibles para el usuario
