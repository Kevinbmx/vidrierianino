<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\UnitOfMeasure;
use App\Models\Supplier;
use App\Models\SupplierProductOffer;
use Illuminate\Support\Facades\DB;

/**
 * CatalogSeeder
 * 
 * Crea la estructura completa del catálogo con datos reales de Vidriería Niño:
 * 
 * - Categorías jerárquicas
 * - Atributos y valores
 * - Productos con variantes reales
 * - Proveedores y ofertas de compra
 * 
 * UPDATED (2026-02-13): Adaptado para pricing flexible y supplier_product_offers
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Iniciando seeder de catálogo...');

        DB::transaction(function () {
            // ========== PROVEEDOR DEFAULT ==========
            $supplier = Supplier::create([
                'name' => 'Proveedor General',
                'contact_name' => 'Ventas Mayorista',
                'phone' => '+591 70000000',
                'email' => 'ventas@proveedor.com',
                'is_active' => true,
            ]);

            // ========== CATEGORÍAS ==========
            $this->command->info('📁 Creando categorías...');

            $vidrios = Category::create(['name' => 'Vidrios', 'slug' => 'vidrios', 'order' => 1]);
            $vidriosPlanos = Category::create(['name' => 'Vidrios Planos', 'slug' => 'vidrios-planos', 'parent_id' => $vidrios->id, 'order' => 1]);
            $vidriosTemplados = Category::create(['name' => 'Vidrios Templados', 'slug' => 'vidrios-templados', 'parent_id' => $vidrios->id, 'order' => 2]);
            $espejos = Category::create(['name' => 'Espejos', 'slug' => 'espejos', 'parent_id' => $vidrios->id, 'order' => 3]);

            $perfiles = Category::create(['name' => 'Perfiles y Varillas', 'slug' => 'perfiles-varillas', 'order' => 2]);
            $madera = Category::create(['name' => 'Madera', 'slug' => 'madera', 'parent_id' => $perfiles->id, 'order' => 1]);
            $aluminio = Category::create(['name' => 'Aluminio', 'slug' => 'aluminio', 'parent_id' => $perfiles->id, 'order' => 2]);

            // ========== ATRIBUTOS ==========
            $this->command->info('🏷️  Creando atributos...');

            $grosor = Attribute::create(['name' => 'Grosor', 'slug' => 'grosor', 'input_type' => 'select']);
            $color = Attribute::create(['name' => 'Color', 'slug' => 'color', 'input_type' => 'select']);
            $material = Attribute::create(['name' => 'Material', 'slug' => 'material', 'input_type' => 'select']);
            $acabado = Attribute::create(['name' => 'Acabado', 'slug' => 'acabado', 'input_type' => 'select']);

            // Valores
            $grosor5mm = AttributeValue::create(['attribute_id' => $grosor->id, 'value' => '5mm']);
            $grosor6mm = AttributeValue::create(['attribute_id' => $grosor->id, 'value' => '6mm']);
            $transparente = AttributeValue::create(['attribute_id' => $color->id, 'value' => 'Transparente']);
            $pino = AttributeValue::create(['attribute_id' => $material->id, 'value' => 'Pino']);
            $natural = AttributeValue::create(['attribute_id' => $acabado->id, 'value' => 'Natural']);
            $anodizado = AttributeValue::create(['attribute_id' => $acabado->id, 'value' => 'Anodizado']);

            // ========== UNIDADES DE MEDIDA ==========
            $m2 = UnitOfMeasure::where('abbreviation', 'm²')->first();
            $ml = UnitOfMeasure::where('abbreviation', 'ml')->first();
            $plancha = UnitOfMeasure::where('abbreviation', 'plancha')->first();
            $paquete = UnitOfMeasure::where('abbreviation', 'paq')->first();
            $barra = UnitOfMeasure::where('abbreviation', 'barra')->first();

            // ========== PRODUCTOS Y VARIANTES ==========
            $this->command->info('📦 Creando productos con variantes y ofertas...');

            // 🔥 PRODUCTO 1: Vidrio Float 5mm
            $vidrioFloat = Product::create([
                'name' => 'Vidrio Float',
                'slug' => 'vidrio-float',
                'category_id' => $vidriosPlanos->id,
                'description' => 'Vidrio plano transparente',
            ]);

            $variantFloat5mm = ProductVariant::create([
                'product_id' => $vidrioFloat->id,
                'sku' => 'VID-FLOAT-5MM-214X330',
                'name' => 'Vidrio Float 5mm Transparente',
                'sale_unit_id' => $m2->id,
                'stock_quantity' => 10,
                'min_stock' => 2,
                'pricing_mode' => 'markup',
                'markup_percentage' => 30.00, // 30% sobre costo base
            ]);
            $variantFloat5mm->attributeValues()->attach([$grosor5mm->id, $transparente->id]);

            // Oferta de proveedor (Donde viven los costos ahora)
            SupplierProductOffer::create([
                'supplier_id' => $supplier->id,
                'product_variant_id' => $variantFloat5mm->id,
                'cost' => 15000.00, // Costo por PLANCHA
                'purchase_unit_id' => $plancha->id,
                'purchase_width' => 2.14,
                'purchase_height' => 3.30,
                'is_preferred' => true,
                'is_active' => true,
                'notes' => 'Costo por plancha de 2.14x3.30m',
            ]);

            // 🔥 PRODUCTO 2: Varilla Madera Pino
            $varillaMadera = Product::create([
                'name' => 'Varilla Madera Pino',
                'slug' => 'varilla-madera-pino',
                'category_id' => $madera->id,
                'description' => 'Varilla de pino para marcos',
            ]);

            $variantMadera = ProductVariant::create([
                'product_id' => $varillaMadera->id,
                'sku' => 'VAR-PINO-190',
                'name' => 'Varilla Pino 1.9m',
                'sale_unit_id' => $ml->id,
                'stock_quantity' => 150, // Metros lineales
                'min_stock' => 20,
                'pricing_mode' => 'markup',
                'markup_percentage' => 40.00,
            ]);
            $variantMadera->attributeValues()->attach([$pino->id, $natural->id]);

            SupplierProductOffer::create([
                'supplier_id' => $supplier->id,
                'product_variant_id' => $variantMadera->id,
                'cost' => 45000.00, // Costo por PAQUETE
                'purchase_unit_id' => $paquete->id, // Paquete de 30 unidades
                'purchase_length' => 57.00, // 30 un * 1.9m = 57ml totales
                'is_preferred' => true,
                'is_active' => true,
                'notes' => 'Paquete de 30 varillas de 1.9m (57ml totales)',
            ]);

            // 🔥 PRODUCTO 3: Perfil Aluminio Modena
            $aluminioModena = Product::create([
                'name' => 'Perfil Aluminio Modena',
                'slug' => 'perfil-aluminio-modena',
                'category_id' => $aluminio->id,
                'description' => 'Perfil para aberturas',
            ]);

            $variantAluminio = ProductVariant::create([
                'product_id' => $aluminioModena->id,
                'sku' => 'ALU-MODENA-600',
                'name' => 'Perfil Modena Anodizado',
                'sale_unit_id' => $ml->id,
                'stock_quantity' => 48, // Metros lineales (8 barras)
                'min_stock' => 6,
                'pricing_mode' => 'fixed', // Precio fijo manual
                'price' => 5200.00, // Precio venta por ML
            ]);
            $variantAluminio->attributeValues()->attach([$anodizado->id]);

            SupplierProductOffer::create([
                'supplier_id' => $supplier->id,
                'product_variant_id' => $variantAluminio->id,
                'cost' => 28000.00, // Costo por BARRA
                'purchase_unit_id' => $barra->id,
                'purchase_length' => 6.00, // Barra de 6m
                'is_preferred' => true,
                'is_active' => true,
            ]);

            // 🔥 PRODUCTO 4: Espejo 4mm
            $espejo = Product::create([
                'name' => 'Espejo 4mm',
                'slug' => 'espejo-4mm',
                'category_id' => $espejos->id,
                'description' => 'Espejo de 4mm',
            ]);

            $variantEspejo = ProductVariant::create([
                'product_id' => $espejo->id,
                'sku' => 'ESP-4MM',
                'name' => 'Espejo 4mm Plancha',
                'sale_unit_id' => $m2->id,
                'stock_quantity' => 36, // m² aprox (6 planchas)
                'min_stock' => 6,
                'pricing_mode' => 'markup',
                'markup_percentage' => 35.00,
            ]);

            SupplierProductOffer::create([
                'supplier_id' => $supplier->id,
                'product_variant_id' => $variantEspejo->id,
                'cost' => 12000.00, // Costo por PLANCHA
                'purchase_unit_id' => $plancha->id,
                'purchase_width' => 2.00,
                'purchase_height' => 3.00, // 6m²
                'is_preferred' => true,
                'is_active' => true,
            ]);

        }); // End Transaction

        $this->command->info('✅ CATÁLOGO MIGRADO A NUEVA ESTRUCTURA (Suppliers + Offers)');
    }
}
