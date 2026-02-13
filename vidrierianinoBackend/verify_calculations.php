<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

try {
    // Test 1: Vidrio Float
    $vidrio = \App\Models\ProductVariant::where('sku', 'VID-FLOAT-5MM-214X330')->first();
    echo "\n=== TEST 1: VIDRIO FLOAT ===\n";
    if ($vidrio) {
        echo "Costo Compra (Plancha): $ " . $vidrio->cost . "\n";
        echo "Dimensiones: " . $vidrio->purchase_width . "m x " . $vidrio->purchase_height . "m\n";
        echo "Área Total: " . $vidrio->total_area . " m²\n";
        echo "Costo Real por m²: $ " . $vidrio->base_unit_cost . "\n";
        echo "Validación: " . ($vidrio->base_unit_cost > 0 ? "✅ OK" : "❌ ERROR") . "\n";
    } else {
        echo "❌ Error: Variante VID-FLOAT no encontrada. (Falta correr seeders)\n";
    }

    // Test 2: Varilla Madera
    $varilla = \App\Models\ProductVariant::where('sku', 'VAR-PINO-190-PAQ30')->first();
    echo "\n=== TEST 2: VARILLA MADERA ===\n";
    if ($varilla) {
        echo "Costo Compra (Paquete): $ " . $varilla->cost . "\n";
        echo "Unidades por paquete: 30\n";
        echo "Largo por unidad: " . $varilla->purchase_length . "m\n";
        echo "Total Metros Lineales: " . $varilla->conversion_factor . " ml\n";
        echo "Costo Real por ml: $ " . $varilla->base_unit_cost . "\n";
        echo "Validación: " . ($varilla->base_unit_cost > 0 ? "✅ OK" : "❌ ERROR") . "\n";
    } else {
        echo "❌ Error: Variante VAR-PINO no encontrada.\n";
    }

} catch (\Throwable $e) {
    echo "ERROR EXCEPCIÓN: " . $e->getMessage() . "\n";
}
