<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Collection;

/**
 * CategoryService
 * 
 * Maneja la lógica de negocio para categorías jerárquicas.
 * Permite crear, actualizar y navegar estructuras infinitas.
 * 
 * Impacto en el negocio: Centraliza operaciones de categorías
 * asegurando consistencia en slugs y orden jerárquico.
 */
class CategoryService
{
    /**
     * Obtiene todas las categorías raíz (sin padre).
     * 
     * @return Collection
     */
    public function getRootCategories(): Collection
    {
        return Category::whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * Obtiene una categoría con todos sus hijos cargados.
     * 
     * @param int $categoryId
     * @return Category
     */
    public function getCategoryWithChildren(int $categoryId): Category
    {
        return Category::with('children')->findOrFail($categoryId);
    }

    /**
     * Crea una nueva categoría.
     * 
     * @param array $data ['name', 'parent_id' (opcional), 'description', 'order']
     * @return Category
     */
    public function create(array $data): Category
    {
        // Generar slug automáticamente si no existe
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return Category::create($data);
    }

    /**
     * Actualiza una categoría existente.
     * 
     * @param Category $category
     * @param array $data
     * @return Category
     */
    public function update(Category $category, array $data): Category
    {
        // Actualizar slug si cambia el nombre y no se proporciona slug
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);
        return $category->fresh();
    }

    /**
     * Elimina una categoría.
     * 
     * Impacto: Las subcategorías y productos asociados se eliminan en cascada.
     * 
     * @param Category $category
     * @return bool
     */
    public function delete(Category $category): bool
    {
        // Requerimiento de negocio: "Si borro un padre, su hijo debe heredar el padre que heredaba el eliminado"
        // Evitara que se pierdan los hijos al borrar una categoría intermedia.

        // 1. Identificar al nuevo padre (el abuelo de los hijos actuales)
        $newParentId = $category->parent_id;

        // 2. Mover todos los hijos directos al nuevo padre
        // Eloquent update() es eficiente y maneja esto en una consulta SQL
        $category->children()->update(['parent_id' => $newParentId]);

        // 3. Ahora es seguro eliminar la categoría
        return $category->delete();
    }

    /**
     * Obtiene el árbol completo de una categoría con sus hijos recursivos.
     * 
     * @param Category $category
     * @return Category
     */
    public function getTreeWithChildren(Category $category): Category
    {
        return $category->load('children.children.children');
    }

    /**
     * Obtiene todas las categorías en estructura plana con nivel de profundidad.
     * 
     * Impacto: Útil para selectores en formularios mostrando jerarquía con indentación.
     * 
     * @return Collection
     */
    public function getAllCategoriesFlat(): Collection
    {
        $categories = Category::where('is_active', true)
            ->orderBy('order')
            ->get();

        $result = collect([]);

        foreach ($categories->where('parent_id', null) as $root) {
            $this->flattenCategory($root, $result, 0);
        }

        return $result;
    }

    /**
     * Método recursivo para aplanar categorías con nivel de profundidad.
     * 
     * @param Category $category
     * @param Collection $result
     * @param int $depth
     * @return void
     */
    private function flattenCategory(Category $category, Collection $result, int $depth): void
    {
        $category->depth = $depth;
        $result->push($category);

        foreach ($category->children as $child) {
            $this->flattenCategory($child, $result, $depth + 1);
        }
    }
}
