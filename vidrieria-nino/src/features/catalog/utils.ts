import { Category } from './types';

/**
 * Convierte una lista plana de categorías en un árbol jerárquico.
 * Asume que la lista contiene TODOS los nodos necesarios.
 */
export function buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();

    // 1. Crear mapa de referencias y Resetear children para evitar duplicados del backend
    categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootCategories: Category[] = [];

    // 2. Construir árbol
    categories.forEach(originalCat => {
        const cat = categoryMap.get(originalCat.id)!;
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
            const parent = categoryMap.get(cat.parent_id)!;
            parent.children = parent.children || [];
            parent.children.push(cat);
        } else {
            rootCategories.push(cat);
        }
    });

    return rootCategories; // Retorna solo los nodos raíz con sus hijos anidados
}

/**
 * Aplana un árbol de categorías para usarlo en selectores (dropdowns),
 * añadiendo indentación visual o prefijos.
 */
export function flattenCategoryTree(categories: Category[], level = 0, prefix = ''): { id: number; displayName: string }[] {
    let flat: { id: number; displayName: string }[] = [];

    categories.forEach(cat => {
        flat.push({
            id: cat.id,
            displayName: `${prefix}${cat.name}`
        });

        if (cat.children && cat.children.length > 0) {
            flat = flat.concat(flattenCategoryTree(cat.children, level + 1, `${prefix}${cat.name} > `));
        }
    });

    return flat;
}
