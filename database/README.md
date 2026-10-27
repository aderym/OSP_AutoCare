# Base de datos / Database snapshot

Copia portátil tomada de la base publicada de OSP AutoCare. La fecha exacta, conteos, exclusiones y limitaciones están en `manifest.json`.

- `osp-autocare.sqlite`: base SQLite lista para una instalación local nueva.
- `schema_and_data.sql`: esquema completo y registros; importar en una base vacía.
- `schema.sql` + `data.sql`: esquema y registros por separado.
- `snapshot.json`: datos legibles sin hashes de contraseñas.
- `build_snapshot.py`: reconstruye la copia desde JSON y las migraciones con Python 3; se niega a sobrescribir una base existente.
- `initialize_owner.py`: crea la contraseña local de OSP después de copiar la base a una ubicación nueva de ejecución.

## Contenido actual

1 taller demo, 1 usuario OSP y 1 referencia técnica guardada. No había clientes, vehículos de clientes, órdenes, inventario, proveedores, compras ni servicios registrados al tomar la copia. No se inventaron registros.

Los 50,407 vehículos del catálogo están en `public/vehicle-catalog/`, las 284 partes y directorio de proveedores en `public/parts-catalog.json`, y las ayudas técnicas en `public/technical-resources.json`. Son datos de referencia del programa, separados de los vehículos reales de clientes.

## Credenciales y exclusiones

Todas las cuentas están desactivadas y sus campos de contraseña están vacíos. NO se publica ningún hash, ni del sitio real ni generado para la copia. Después de copiar SQLite a una ruta de ejecución nueva, ejecute `python3 database/initialize_owner.py /ruta/runtime/osp-autocare.sqlite` y elija la contraseña local de OSP en la entrada oculta. También puede proporcionar `BOOTSTRAP_ADMIN_PASSWORD` mediante el entorno local. El inicializador se niega a modificar el archivo SQLite de esta carpeta. Esto no cambia la cuenta del sitio publicado. Los empleados permanecen desactivados hasta restablecer sus contraseñas en la instalación local.

Las tablas `sessions`, `auth_attempts` y `payment_settings` están vacías. No se copian claves OpenAI, Stripe, webhooks ni secretos del servidor. Configure las claves de cifrado y pago por separado en la instalación de destino.

## Limitación del perfil

El lector de la base publicada recortó el perfil del taller demo dentro del logo incrustado por su tamaño. Se recuperaron los campos anteriores al logo. Ese logo personalizado y posibles campos posteriores no están en esta copia; el programa usa el logo incluido y el impuesto predeterminado cuando faltan. Los archivos de logo y favicon del programa sí están en `public/`. No es una copia de recuperación íntegra del servidor.

## Uso

Antes del primer arranque, copie `osp-autocare.sqlite` a la ubicación de `DATABASE_PATH` de su instalación, habitualmente `runtime/osp-autocare.sqlite`. Copie solo cuando el destino todavía no exista. Con Docker, coloque la copia en el volumen persistente del servicio antes de iniciar la aplicación. No reemplace una base en uso ni una base existente con datos de su negocio. Inicialice la cuenta OSP de esa copia con el script antes de arrancar. La aplicación aplica migraciones pendientes durante el arranque.

Alternativamente, importe `schema_and_data.sql` en un archivo SQLite nuevo. No importe simultáneamente ese archivo y los archivos separados. La copia conserva las marcas de migración para Node; no se debe importar directamente sobre el D1 publicado.

Esta carpeta es una copia fija para instalación y revisión. Los cambios de la base publicada no se sincronizan automáticamente con GitHub.
