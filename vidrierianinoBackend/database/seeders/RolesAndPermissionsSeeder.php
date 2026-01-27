<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()['cache']->forget('spatie.permission.cache');

        // create permissions
        $permissions = [
            'ver-productos', 'crear-productos', 'editar-productos', 'eliminar-productos',
            'ver-usuarios', 'crear-usuarios', 'editar-usuarios', 'eliminar-usuarios',
            'ver-reportes-ventas', 'ver-reportes-financieros'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // create roles and assign existing permissions
        $superAdminRole = Role::create(['name' => 'super-admin']);
        // gets all permissions via Gate::before rule;

        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $vendedorRole = Role::create(['name' => 'vendedor']);
        $vendedorRole->givePermissionTo(['ver-productos', 'crear-productos', 'editar-productos']);

        $contadorRole = Role::create(['name' => 'contador']);
        $contadorRole->givePermissionTo(['ver-reportes-ventas', 'ver-reportes-financieros']);

        $clienteRole = Role::create(['name' => 'cliente']);
        $clienteRole->givePermissionTo('ver-productos');

        $empleadoRole = Role::create(['name' => 'empleado']);
        $empleadoRole->givePermissionTo('ver-productos');

        // create super-admin user
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'phone' => '1234567890',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole($superAdminRole);

        // create admin user for testing
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $adminUser->assignRole($adminRole);

        // create vendedor user for testing
        $vendedorUser = User::create([
            'name' => 'Vendedor User',
            'email' => 'vendedor@example.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $vendedorUser->assignRole($vendedorRole);
    }
}
