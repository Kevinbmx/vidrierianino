<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Warehouse;
use App\Models\WarehouseZone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company = Company::firstOrCreate(
            ['nit_number' => '123456789'],
            [
                'legal_name' => 'Vidriería Niño SRL',
                'trade_name' => 'Vidriería Niño',
                'owner_name' => 'Administrador General',
                'address' => 'Av. Principal #123',
                'phone' => '+591 12345678',
                'whatsapp' => '+591 12345678',
                'email' => 'contacto@vidrierianino.com',
                'default_currency' => 'BOB',
                'po_terms_conditions' => '1. La entrega debe realizarse en las instalaciones de nuestra sucursal principal.\n2. Pagos a 30 días posteriores a la entrega.\n3. Materiales defectuosos serán devueltos a costo del proveedor.',
                'quote_terms_conditions' => '1. Los precios están sujetos a cambios sin previo aviso.\n2. La cotización tiene una validez de 15 días.\n3. Se requiere un adelanto del 50% para iniciar el trabajo.',
            ]
        );

        $warehouse = Warehouse::firstOrCreate(
            ['name' => 'Almacén Principal', 'company_id' => $company->id],
            [
                'address' => 'Av. Principal #123 (Misma que la tienda)',
                'is_active' => true,
            ]
        );

        WarehouseZone::firstOrCreate(
            ['warehouse_id' => $warehouse->id, 'name' => 'Zona de Planchas Crudo'],
            ['type' => 'rack', 'description' => 'Estantes principales para planchas de vidrio crudo (Atrás de la tienda)']
        );
        WarehouseZone::firstOrCreate(
            ['warehouse_id' => $warehouse->id, 'name' => 'Zona Retazos / Cortes'],
            ['type' => 'floor', 'description' => 'Área de almacenamiento de retazos útiles para reutilizar']
        );
        WarehouseZone::firstOrCreate(
            ['warehouse_id' => $warehouse->id, 'name' => 'Estante de Siliconas/Insumos'],
            ['type' => 'bin', 'description' => 'Mostrador y estantes pequeños para insumos (tubos, rodachinas, etc)']
        );
    }
}
