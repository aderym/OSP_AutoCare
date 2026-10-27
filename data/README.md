# Datos / Data

La copia inicial contiene el administrador `osp` con contraseña inicial `101010` almacenada como hash, el taller demo y las tablas vacías. No contiene información real de clientes ni claves de Stripe. Cambie la contraseña en Settings / Configuración.

`create-initial-db.ts` crea una base inicial reutilizable desde las migraciones, sin sesiones activas. No lo ejecute sobre una base que ya tenga datos. Ejemplo, desde la raíz del proyecto, con Node 24:

    node --experimental-strip-types data/create-initial-db.ts /ruta/nueva/osp-autocare.sqlite

`catalog/makes.json` contiene 12,416 registros oficiales de marcas NHTSA/vPIC descargados durante la creación de esta versión. Incluye marcas históricas y fabricantes especializados; el conteo no equivale a 12,416 marcas actuales de automóviles. Los modelos por año y las consultas VIN usan la API en línea. No se incluye una base mundial completa de modelos ni diagramas técnicos OEM.

The initial database has the hashed OSP administrator, demo workshop and empty tables. There are no real customer records or Stripe credentials. The catalog is an official make snapshot; model/year and VIN details use the live API. See the root README for deployment and payment configuration.

## Catálogo seleccionable / Selectable catalog

`public/vehicle-catalog/` contiene 50,407 configuraciones oficiales EPA/DOE para 1984–2027: año, marca, modelo, motor, transmisión, tracción y combustible. No son vehículos de clientes ficticios. Se consultan desde la orden de trabajo; al guardar se crea el vehículo real del taller y queda seleccionado en la orden. La cobertura corresponde al conjunto oficial Find a Car, no a todos los vehículos del mundo. `epa-catalog-metadata.json` documenta fuente, fecha, conteos y hash del archivo descargado.

## Registro y prueba gratuita

La migración 0002 agrega `shops.trial_until` y `registration_email` con un índice único. El signup crea un moderador y taller con 7 días de prueba desde el servidor; al vencer necesita pago confirmado. Editar el perfil no reinicia la prueba. Las migraciones mantienen intactos los talleres existentes y sus fechas de pago. El logo y datos de contacto del perfil se utilizan al imprimir órdenes/facturas. Esta copia inicial no incluye cuentas de prueba de QA ni claves API.
