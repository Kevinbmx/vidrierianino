<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UnitOfMeasure;

/**
 * UnitsOfMeasureSeeder
 * 
 * Crea las unidades de medida base del sistema.
 * Estas son las unidades atómicas para todas las conversiones.
 */
class UnitsOfMeasureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            // Unidades de Área
            ['name' => 'Metro Cuadrado', 'abbreviation' => 'm²', 'type' => 'area'],
            ['name' => 'Plancha', 'abbreviation' => 'plancha', 'type' => 'area'],

            // Unidades de Longitud
            ['name' => 'Metro Lineal', 'abbreviation' => 'ml', 'type' => 'length'],
            ['name' => 'Barra', 'abbreviation' => 'barra', 'type' => 'length'],
            ['name' => 'Varilla', 'abbreviation' => 'varilla', 'type' => 'length'],

            // Unidades de Cantidad
            ['name' => 'Unidad', 'abbreviation' => 'un', 'type' => 'unit'],
            ['name' => 'Paquete', 'abbreviation' => 'paq', 'type' => 'unit'],
            ['name' => 'Caja', 'abbreviation' => 'caja', 'type' => 'unit'],

            // Unidades de Peso
            ['name' => 'Kilogramo', 'abbreviation' => 'kg', 'type' => 'weight'],
            ['name' => 'Gramo', 'abbreviation' => 'g', 'type' => 'weight'],
        ];

        foreach ($units as $unit) {
            UnitOfMeasure::create($unit);
        }

        $this->command->info('✅ Unidades de medida creadas: ' . count($units));
    }
}
