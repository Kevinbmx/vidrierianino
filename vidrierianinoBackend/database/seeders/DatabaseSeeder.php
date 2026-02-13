<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        // Módulo 1: Core de Catálogo y UOM
        $this->call(UnitsOfMeasureSeeder::class);
        $this->call(CatalogSeeder::class);
    }
}
