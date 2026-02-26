---
name: nextjs-frontend-pro
description: Define el estándar de arquitectura, diseño UI y patrones de interacción para el frontend en Next.js dentro de vidrieria-nino.
---

# Next.js Enterprise Pattern — Vidriería Nino

## 1. Organización de Archivos

```
src/
  app/
    admin/
      [modulo]/           ← Cada módulo en su propia carpeta
        page.tsx          ← Página de lista/índice
        [id]/page.tsx     ← Página de detalle
  features/
    [dominio]/
      api.ts              ← Funciones HTTP (axios). Nunca llamar API desde componentes.
      hooks.ts            ← useQuery / useMutation wrappers
      types.ts            ← Interfaces TypeScript del dominio
  components/ui/          ← Componentes atómicos reutilizables
  lib/axios.ts            ← Instancia central (token Sanctum + NEXT_PUBLIC_API_URL)
```

**Regla de oro:** Toda llamada a la API pasa por `features/[dominio]/api.ts`.
Nunca usar `fetch` directo ni crear instancias de axios locales en componentes.

---

## 2. Manejo de Datos — TanStack Query

### Reglas
- `useQuery` para lecturas. `useMutation` para escrituras. Siempre, sin excepción.
- Los hooks viven en `features/[dominio]/hooks.ts`, no en los componentes.
- Después de cualquier mutación, **invalidar también el recurso padre** si el hijo tiene datos derivados que se muestran en el padre.
- Los query keys siguen una estructura jerárquica: `['dominio', 'entidad', id, 'sub-recurso']`.

### Gotcha: invalidar solo el hijo y olvidar al padre
Si un contacto cambia (se marca como principal) pero solo se invalida la query de contactos,
el panel del proveedor seguirá mostrando el contacto principal desactualizado.
**Regla:** al mutar un sub-recurso, siempre invalidar también la query del padre.

### Manejo de errores en mutaciones
```typescript
catch (e: any) {
    // Intentar extraer el mensaje del backend (Laravel devuelve 'message' o 'errors')
    const msg = e?.response?.data?.message
        ?? e?.response?.data?.errors?.[Object.keys(e?.response?.data?.errors ?? {})[0]]?.[0]
        ?? 'Error inesperado. Intentá de nuevo.';
    setError(msg);
}
```
Nunca mostrar errores técnicos del servidor directamente al usuario.

---

## 3. Sistema de Diseño UI — "Estilo Nino"

### Paleta
- Fondo de página: `bg-gray-50`
- Cards/paneles: `bg-white border border-gray-200 shadow-sm rounded-2xl`
- Header oscuro de secciones principales: `bg-gradient-to-r from-slate-900 to-slate-700`
- Acento primario: `blue-600`
- Éxito/activo: `green-500` / `green-700`
- Advertencia/principal: `amber-500` / `amber-600`
- Peligro: `red-500`
- Sin asignar / dato incompleto: `orange-200` con `border-dashed`

### Paneles de sección
Toda sección de datos usa el mismo patrón: card blanca con header de gradiente oscuro.
El header lleva icono + título en mayúsculas pequeñas + (opcional) badge de conteo.
El contenido va con `p-5 space-y-4`. Ver código existente en páginas de suppliers para referencia exacta.

### Badges de estado
- Estados activo/inactivo: fondo con opacidad (`bg-green-500/20 text-green-300 border-green-500/30`) sobre fondos oscuros.
- Sobre fondos blancos: variante sólida (`bg-green-100 text-green-700 border border-green-200`).
- Tamaño siempre `text-[9px]` o `text-[10px] font-bold uppercase rounded-full`.

### Layouts de página
- **Detalle**: `max-w-5xl mx-auto` con `space-y-5`. Header full-width + grid de `lg:grid-cols-3`: sidebar izquierdo (1 col) para datos de la entidad y panel derecho (2 cols) para gestión y sub-recursos.
- **Lista / Split-view**: panel izquierdo fijo (lista) + panel derecho flexible (detalle o empty state). Ver catálogo de ofertas como referencia.

---

## 4. Botones y Estados de Carga

### Regla fundamental
**Todo botón que dispara una petición a la API debe bloquearse durante la petición.**
El usuario no debe poder hacer doble-clic. La UI debe dar feedback visual inmediato.

### Patrón estándar (SIEMPRE así)
```tsx
const [saving, setSaving] = useState(false);

const handleAction = async () => {
    setSaving(true);
    try {
        await mutation.mutateAsync(data);
        // éxito: cerrar modal, limpiar form, etc.
    } catch (e: any) {
        setError(msg); // extraer mensaje del backend
    } finally {
        setSaving(false); // SIEMPRE en finally — no en try ni en catch
    }
};

<button onClick={handleAction} disabled={saving}
    className="... disabled:opacity-50 disabled:cursor-not-allowed">
    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
    {saving ? 'Guardando...' : 'Guardar cambios'}
</button>
```

### Reglas específicas
- Botón "Cancelar" también se deshabilita mientras `saving === true`.
- Inputs del formulario también con `disabled={saving}` para evitar edición durante el envío.
- Fondo del formulario/modal con `disabled:bg-gray-50` para dar feedback visual al usuario.
- Usar `finally` para liberar el estado — nunca dejar el botón bloqueado si falla.

---

## 5. Modales de Edición

### Estructura estándar
1. `fixed inset-0 bg-black/40 backdrop-blur-sm z-50` como overlay.
2. Card blanca `rounded-2xl shadow-2xl w-full max-w-[ancho]`.
3. Header con gradiente oscuro (igual que los paneles de sección).
4. Body con grid para formulario.
5. Footer `bg-gray-50 border-t` con botones Cancelar + Guardar alineados a la derecha.
6. El botón de cierre `×` también se deshabilita durante el guardado.

Ver `EditModal` en la página de proveedores como referencia de implementación completa.

---

## 6. Componentes con Edición Inline

### Gotcha crítico: pérdida de foco en inputs
Si un sub-componente (`ContactCard`, `OfferCard`, etc.) se define como función anónima
**dentro del cuerpo** de otro componente, React lo destruye y recrea en cada render.
Esto causa que los inputs pierdan el cursor después de cada keystroke.

**Regla:** cualquier componente que contenga inputs **debe definirse fuera** del componente padre,
a nivel de módulo, y recibir su estado por props.

```tsx
// ❌ Causa pérdida de focus — se define en el cuerpo de otro componente
function Parent() {
    const [val, setVal] = useState('');
    const InlineForm = () => <input value={val} onChange={...} />; // ← recreado en cada render
    return <InlineForm />;
}

// ✅ Correcto — componente a nivel de módulo
function InlineForm({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return <input value={value} onChange={e => onChange(e.target.value)} />;
}
function Parent() {
    const [val, setVal] = useState('');
    return <InlineForm value={val} onChange={setVal} />;
}
```

---

## 7. Otros Patrones Reutilizables

### Empty state (cuando no hay datos)
Ícono grande con opacidad baja + mensaje descriptivo + sugerencia de acción.
Siempre centrado verticalmente con `py-12 text-center`.

### Skeleton de carga
Usar `animate-pulse` con divs `bg-gray-100 rounded-xl` de altura aproximada a los ítems reales.
Mostrar 2-3 skeletons mientras `isLoading === true`.

### Error en formulario
Div con `bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3` con
icono `AlertCircle` alineado con el texto.

### Tabs internos
Estado `activeTab` en el componente padre. Botones con border-bottom activo `border-blue-400`
e inactivo `border-transparent`. Contenido renderizado condicionalmente, no con CSS.

---

## 8. Mobile First

El proyecto se usa en tablets y celulares del taller.
- Por defecto diseñar para pantalla angosta.
- `flex-col sm:flex-row` antes de asumir layout horizontal.
- Acciones táctiles: mínimo `p-2` en botones de icono, `py-2` en inputs.
- Evitar hover-only para funciones críticas (en móvil no hay hover).

---

## 9. Checklist al crear una nueva página admin

- [ ] Header card con breadcrumb + nombre entidad + estado badge + botones de acción
- [ ] Layout `max-w-5xl mx-auto space-y-5`
- [ ] Skeleton de carga mientras llegan datos (`isLoading`)
- [ ] Empty state con ícono + mensaje + sugerencia
- [ ] Todos los botones de acción: `disabled + Loader2 animate-spin + texto dinámico`
- [ ] Errores de API en español en el formulario con `AlertCircle`
- [ ] Botón Cancelar también bloqueado durante `saving`
- [ ] Estado liberado en `finally` (nunca solo en `try`)
- [ ] Sub-componentes con inputs definidos a nivel de módulo (no inline en render)
- [ ] Hooks invalidan recurso padre después de cada mutación del hijo
- [ ] Responsive: funciona en móvil (min 380px)
- [ ] Confirmación antes de acciones destructivas (`confirm(...)` o modal propio)