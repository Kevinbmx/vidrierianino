1. Descripción General del Negocio

Vidriería Niño es un negocio especializado en:

    Venta de vidrios (crudos, ahumados, catedrales) para carpintería de madera/aluminio

    Colocación de vidrios (Blindex, convencionales)

    Servicios de mantenimiento de carpintería de aluminio

    Enmarcación (fotos, títulos, certificados)

    Venta de espejos (baño, recibidores, roperos, salones de belleza, gimnasios)

    Venta de vidrio de 5mm para escritorio, muebles, mesa, mesa de estar,etc

    Servicios de mantenimiento (Blindex, aluminio, cambios de vidrios rotos)

2. Objetivos del Sistema Digital

    Presencia online profesional que muestre productos y servicios

    Automatización de procesos de compra (petición de oferta, orden de compra) y ventas (cotización , orden de venta)

    Gestión integral de inventario con múltiples unidades de medida
Gestion de inventario par la venta por unidad definida u otra unidad de medida programado.

    Seguimiento de proveedores y comparación de precios entre un proveedor y
 Otro con sus comparaciones de peticiones de compra

Gestión de pedidos donde los clientes podrán agregar su articulo para la venta

Gestion de lista de deseos para que el cliente sea una forma de guardar los 
Articulo y que puedan ver a futuro un articulo que ellos desearon

Que se tenga una venta online (pedido y lista de deseos) o que se tenga una venta directa con un vendedor desde el administrador.

Que tenga código de referido asi un cliente antiguo da un código a un nuevo cliente y el beneficiado será el que de su código de referido, así tenga un acumulador de dinero que lo podrá canjear con servicios o productos de la vidriería.

    Sistema modular con roles y permisos para diferentes usuarios

3. Módulos Principales
3.1 Página de Presentación (Frontend) 

Requisitos:

    Sección "Quiénes Somos" con historia y valores

    Galería de productos (vidrios, espejos, trabajos realizados)

    Catálogo de servicios con descripciones detalladas

    Formulario de contacto destacado

    Mapa de ubicación de sucursal(es)

    Testimonios de clientes

    Blog con artículos sobre cuidados de vidrios y espejos

    Integración con redes sociales

Tecnologías:

    Next.js para renderizado estático y dinámico

    Tailwind CSS para estilos

    NextUI para componentes

3.2 Módulo de Productos
	Creación de productos y que esos productos se puedan crear variantes 
Y también que se pueda crear producto compuesto (varios productos normales 
Pueden crear uno nuevo).
3.3 Módulo de Cotizaciones y Órdenes

Flujo de Cotización:

    Cliente solicita cotización (medidas propias o solicita visita)

    Sistema calcula materiales necesarios

    Genera PDF con desglose de costos

    Aprobación → Conversión a orden de trabajo/venta

3.4 Módulo de Inventario

Características:

    Control de stock por múltiples unidades de medida

    Alertas de niveles mínimos

    Histórico de movimientos

    Cálculo de costos promedio ponderado

    Integración con productos compuestos

3.5 Módulo de Proveedores y Comparación de Precios

Comparación de Precios:

    Normalizar todos los precios a unidad base

    Mostrar tabla comparativa con:

        Precio por unidad estándar

        Proveedor

        Vigencia de cotización

        Tiempo de entrega estimado

3.6 Sistema de Autenticación y Roles

Roles:

    Admin: Acceso total

    Vendedor: Cotizaciones, ventas, clientes

    Comprador: Gestión de proveedores, compras

    Almacén: Gestión de inventario

que use middleware para todo lo que es roles y permisos.

4. Arquitectura Técnica
4.1 Stack Tecnológico

    Frontend: Next.js + TypeScript + Tailwind CSS + heroUI

    Backend: Laravel 10+ (API RESTful)

    Base de Datos: MySQL 8+

    Autenticación: Laravel Sanctum + OAuth2 (Google)

    Deployment: contenedor docker - docker compose (ya esto lo tengo en mi arcivo)

4.2 Estructura de Directorios
text

vidrieria-nino/
├── frontend/          # Aplicación Next.js
   ├── components/    # Componentes reutilizables
   ├── lib/           # Lógica compartida
   ├── pages/         # Rutas de la aplicación
   └── styles/        # Estilos globales
   └── utils/        # rutas de paginas del front y de las apis a consumir

5. Roadmap de Implementación
Fase 1: Presencia Online (solo enfocate en esto) 
	Estructura de carpetas que cumpla lo simple que seria pagina de admin, paginas de presentación de la vidriería, componentes, también para que tenga los usuarios permisos a la pagina que esta ingresando con middleware.	
    Diseño UI/UX de la página principal que tenga para inicio de sesión, registros y de paginas admins

    Implementación de secciones informativas servicios, galería de trabajos (dame con imágenes aleatorias), mostrar recomendaciones de cliente.

    Formulario de contactanos funcional

    Mostrar icono de redes sociales para redirigir al cliente diferentes plataformas.

    Dame código de solo esta fase para el diseño de mi pagina principar con paleta de color azul #12144D  (es la abreviación Vn), verde #507504 (la letra de vidriería niño) colo blanco (fondo de mi isologo), en isologo estan presente estos tres colores. Quiero que estas paletas de colores tenga mi sitio web. Diseñame una pagina profesional, con buenos diseños. Y diseñame la estructura según lo veas lo mas escalable posible.

	

Fase 2: Sistema Básico (6-8 semanas)

    Módulo de autenticación con roles

    CRUD de productos con unidades de medida

    Sistema básico de cotizaciones

    Módulo de clientes

Fase 3: Sistema Avanzado (8-12 semanas)

    Productos compuestos

    Gestión completa de inventario

    Integración con proveedores

    Comparación de precios

    Generación de PDF para cotizaciones

6. Recomendaciones Adicionales

    Integración con herramientas existentes:

        Considerar conexión con WhatsApp para consultas


    Movilidad:

        Desarrollar versión mobile-first

        Considerar app PWA para visitas a obra

    Seguridad:

        Backup automático diario de base de datos

        SSL obligatorio

        Validación estricta de todos los formularios

    Monetización adicional:

        Tienda online para productos estándar

        Sistema de reserva para servicios de instalación

archivos que no quiero que lo tomes en cuenta node_modules y .next

solo enfocate en la fase 1