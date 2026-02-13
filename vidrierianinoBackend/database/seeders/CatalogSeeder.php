<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\UnitOfMeasure;

/**
 * CatalogSeeder
 * 
 * Crea la estructura completa del catálogo con datos reales de Vidriería Niño:
 * - Categorías jerárquicas
 * - Atributos y valores
 * - Productos con variantes reales
 * 
 * Ejemplos incluidos:
 * 1. Vidrio Float 5mm (plancha 2.14×3.30 → venta por m²)
 * 2. Varilla Madera Pino (paquete 30un × 1.9m → venta por ml)
 * 3. Perfil Aluminio (barra 6m → venta por ml)
 */
class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Iniciando seeder de catálogo...');

        // ========== CATEGORÍAS ==========
        $this->command->info('📁 Creando categorías...');

        $vidrios = Category::create(['name' => 'Vidrios', 'slug' => 'vidrios', 'order' => 1]);
        $vidriosPlanos = Category::create(['name' => 'Vidrios Planos', 'slug' => 'vidrios-planos', 'parent_id' => $vidrios->id, 'order' => 1]);
        $vidriosTemplados = Category::create(['name' => 'Vidrios Templados', 'slug' => 'vidrios-templados', 'parent_id' => $vidrios->id, 'order' => 2]);
        $espejos = Category::create(['name' => 'Espejos', 'slug' => 'espejos', 'parent_id' => $vidrios->id, 'order' => 3]);

        $perfiles = Category::create(['name' => 'Perfiles y Varillas', 'slug' => 'perfiles-varillas', 'order' => 2]);
        $madera = Category::create(['name' => 'Madera', 'slug' => 'madera', 'parent_id' => $perfiles->id, 'order' => 1]);
        $aluminio = Category::create(['name' => 'Aluminio', 'slug' => 'aluminio', 'parent_id' => $perfiles->id, 'order' => 2]);

        $this->command->info('✅ 7 categorías creadas');

        // ========== ATRIBUTOS ==========
        $this->command->info('🏷️  Creando atributos...');

        $grosor = Attribute::create(['name' => 'Grosor', 'slug' => 'grosor', 'input_type' => 'select']);
        $color = Attribute::create(['name' => 'Color', 'slug' => 'color', 'input_type' => 'select']);
        $material = Attribute::create(['name' => 'Material', 'slug' => 'material', 'input_type' => 'select']);
        $acabado = Attribute::create(['name' => 'Acabado', 'slug' => 'acabado', 'input_type' => 'select']);

        // Valores de Grosor
        $grosor5mm = AttributeValue::create(['attribute_id' => $grosor->id, 'value' => '5mm']);
        $grosor6mm = AttributeValue::create(['attribute_id' => $grosor->id, 'value' => '6mm']);
        $grosor8mm = AttributeValue::create(['attribute_id' => $grosor->id, 'value' => '8mm']);

        // Valores de Color
        $transparente = AttributeValue::create(['attribute_id' => $color->id, 'value' => 'Transparente']);
        $ahumado = AttributeValue::create(['attribute_id' => $color->id, 'value' => 'Ahumado']);
        $bronce = AttributeValue::create(['attribute_id' => $color->id, 'value' => 'Bronce']);

        // Valores de Material
        $pino = AttributeValue::create(['attribute_id' => $material->id, 'value' => 'Pino']);
        $roble = AttributeValue::create(['attribute_id' => $material->id, 'value' => 'Roble']);

        // Valores de Acabado
        $natural = AttributeValue::create(['attribute_id' => $acabado->id, 'value' => 'Natural']);
        $anodizado = AttributeValue::create(['attribute_id' => $acabado->id, 'value' => 'Anodizado']);

        $this->command->info('✅ 4 atributos con 13 valores creados');

        // ========== UNIDADES DE MEDIDA ==========
        $this->command->info('📏 Obteniendo unidades de medida...');

        $m2 = UnitOfMeasure::where('abbreviation', 'm²')->first();
        $ml = UnitOfMeasure::where('abbreviation', 'ml')->first();
        $plancha = UnitOfMeasure::where('abbreviation', 'plancha')->first();
        $paquete = UnitOfMeasure::where('abbreviation', 'paq')->first();
        $barra = UnitOfMeasure::where('abbreviation', 'barra')->first();
        $unidad = UnitOfMeasure::where('abbreviation', 'un')->first();

        // ========== PRODUCTOS Y VARIANTES ==========
        $this->command->info('📦 Creando productos con variantes...');

        // 🔥 PRODUCTO 1: Vidrio Float
        $vidrioFloat = Product::create([
            'name' => 'Vidrio Float',
            'slug' => 'vidrio-float',
            'category_id' => $vidriosPlanos->id,
            'description' => 'Vidrio plano transparente de alta calidad para carpintería y construcción',
        ]);

        // Variante 1: Float 5mm Transparente (Plancha 2.14×3.30)
        $variantFloat5mm = ProductVariant::create([
            'product_id' => $vidrioFloat->id,
            'sku' => 'VID-FLOAT-5MM-214X330',
            'name' => 'Vidrio Float 5mm Transparente - Plancha 2.14×3.30',
            'cost' => 15000.00, // Costo de compra por PLANCHA
            'price' => 2500.00, // Precio de venta por M²
            'purchase_unit_id' => $plancha->id,
            'sale_unit_id' => $m2->id,
            'purchase_width' => 2.14, // metros
            'purchase_height' => 3.30, // metros
            'conversion_factor' => bcmul('2.14', '3.30', 4), // 7.0620 m²
            'stock_quantity' => 10,
            'min_stock' => 2,
        ]);
        $variantFloat5mm->attributeValues()->attach([$grosor5mm->id, $transparente->id]);

        // Cálculo real: base_unit_cost = $15,000 / 7.0620m² = $2,124.2911 por m²

        // Variante 2: Float 6mm Transparente
        $variantFloat6mm = ProductVariant::create([
            'product_id' => $vidrioFloat->id,
            'sku' => 'VID-FLOAT-6MM-214X330',
            'name' => 'Vidrio Float 6mm Transparente - Plancha 2.14×3.30',
            'cost' => 18500.00,
            'price' => 3000.00,
            'purchase_unit_id' => $plancha->id,
            'sale_unit_id' => $m2->id,
            'purchase_width' => 2.14,
            'purchase_height' => 3.30,
            'conversion_factor' => bcmul('2.14', '3.30', 4),
            'stock_quantity' => 8,
            'min_stock' => 2,
        ]);
        $variantFloat6mm->attributeValues()->attach([$grosor6mm->id, $transparente->id]);

        $this->command->info('  ✓ Vidrio Float con 2 variantes');

        // 🔥 PRODUCTO 2: Varilla de Madera Pino
        $varillaMadera = Product::create([
            'name' => 'Varilla Madera Pino',
            'slug' => 'varilla-madera-pino',
            'category_id' => $madera->id,
            'description' => 'Varilla de pino natural para marcos y molduras',
        ]);

        $variantMadera = ProductVariant::create([
            'product_id' => $varillaMadera->id,
            'sku' => 'VAR-PINO-190-PAQ30',
            'name' => 'Varilla Pino 1.9m - Paquete ×30 unidades',
            'cost' => 45000.00, // Costo de compra por PAQUETE (30 varillas de 1.9m)
            'price' => 850.00,  // Precio de venta por METRO LINEAL
            'purchase_unit_id' => $paquete->id,
            'sale_unit_id' => $ml->id,
            'purchase_length' => 1.90, // Cada varilla mide 1.9m
            'conversion_factor' => bcmul('30', '1.90', 4), // 57.0000 metros lineales totales
            'stock_quantity' => 5, // 5 paquetes en stock
            'min_stock' => 1,
        ]);
        $variantMadera->attributeValues()->attach([$pino->id, $natural->id]);

        // Cálculo real: base_unit_cost = $45,000 / 57ml = $789.4737 por metro lineal

        $this->command->info('  ✓ Varilla Madera Pino');

        // 🔥 PRODUCTO 3: Perfil Aluminio Línea Modena
        $aluminioModena = Product::create([
            'name' => 'Perfil Aluminio Línea Modena',
            'slug' => 'perfil-aluminio-modena',
            'category_id' => $aluminio->id,
            'description' => 'Perfil de aluminio línea Modena para aberturas',
        ]);

        $variantAluminio = ProductVariant::create([
            'product_id' => $aluminioModena->id,
            'sku' => 'ALU-MODENA-600',
            'name' => 'Perfil Modena 6m Anodizado',
            'cost' => 28000.00, // Costo de compra por BARRA de 6m
            'price' => 5200.00, // Precio de venta por METRO LINEAL
            'purchase_unit_id' => $barra->id,
            'sale_unit_id' => $ml->id,
            'purchase_length' => 6.00, // Barra de 6 metros
            'conversion_factor' => '6.0000',
            'stock_quantity' => 8,
            'min_stock' => 2,
        ]);
        $variantAluminio->attributeValues()->attach([$anodizado->id]);

        // Cálculo real: base_unit_cost = $28,000 / 6ml = $4,666.6667 por metro lineal

        $this->command->info('  ✓ Perfil Aluminio Modena');

        // 🔥 PRODUCTO 4: Espejo 4mm
        $espejo = Product::create([
            'name' => 'Espejo 4mm',
            'slug' => 'espejo-4mm',
            'category_id' => $espejos->id,
            'description' => 'Espejo de 4mm para baños, recibidores y roperos',
        ]);

        $variantEspejo = ProductVariant::create([
            'product_id' => $espejo->id,
            'sku' => 'ESP-4MM-200X300',
            'name' => 'Espejo 4mm - Plancha 2.00×3.00',
            'cost' => 12000.00,
            'price' => 2200.00,
            'purchase_unit_id' => $plancha->id,
            'sale_unit_id' => $m2->id,
            'purchase_width' => 2.00,
            'purchase_height' => 3.00,
            'conversion_factor' => bcmul('2.00', '3.00', 4), // 6.0000 m²
            'stock_quantity' => 6,
            'min_stock' => 1,
        ]);

        $this->command->info('  ✓ Espejo 4mm');

        // ========== RESUMEN ==========
        $this->command->info('');
        $this->command->info('════════════════════════════════════════');
        $this->command->info('✅ CATÁLOGO CREADO EXITOSAMENTE');
        $this->command->info('════════════════════════════════════════');
        $this->command->info('📁 Categorías: 7 (con jerarquía)');
        $this->command->info('🏷️  Atributos: 4 con 13 valores');
        $this->command->info('📦 Productos: 4');
        $this->command->info('🎯 Variantes: 5 (con dimensiones y conversiones)');
        $this->command->info('');
        $this->command->info('🔥 EJEMPLOS REALES CARGADOS:');
        $this->command->info('   1. Vidrio Float 5mm: $15,000/plancha → $2,124.29/m²');
        $this->command->info('   2. Varilla Pino: $45,000/paq → $789.47/ml');
        $this->command->info('   3. Aluminio Modena: $28,000/barra → $4,666.67/ml');
        $this->command->info('════════════════════════════════════════');
    }
}
