<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Category Model
 * 
 * Gestiona la jerarquía infinita de categorías de productos.
 * Permite estructuras como: Vidrios > Vidrios Planos > Float 5mm
 * 
 * Impacto en el negocio: Organiza el catálogo en estructuras anidadas
 * facilitando la navegación y filtrado de productos.
 */
class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Categoría padre.
     * 
     * @return BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Subcategorías hijas.
     * 
     * @return HasMany
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('order');
    }

    /**
     * Productos de esta categoría.
     * 
     * @return HasMany
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Obtiene todos los ancestros (categorías superiores) hasta la raíz.
     * 
     * Impacto: Permite generar breadcrumbs y rutas completas.
     * 
     * @return \Illuminate\Support\Collection
     */
    public function ancestors()
    {
        $ancestors = collect([]);
        $parent = $this->parent;

        while ($parent) {
            $ancestors->push($parent);
            $parent = $parent->parent;
        }

        return $ancestors;
    }

    /**
     * Obtiene todos los descendientes (subcategorías recursivas).
     * 
     * Impacto: Útil para obtener todos los productos de una categoría
     * y sus subcategorías.
     * 
     * @return \Illuminate\Support\Collection
     */
    public function descendants()
    {
        $descendants = collect([]);

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->descendants());
        }

        return $descendants;
    }

    /**
     * Verifica si esta categoría es raíz (no tiene padre).
     * 
     * @return bool
     */
    public function isRoot(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Verifica si esta categoría tiene hijos.
     * 
     * @return bool
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }
}
