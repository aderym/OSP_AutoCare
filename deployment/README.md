# Despliegue completo / Complete deployment

Esta carpeta agrega un despliegue independiente al código completo del repositorio.
La infraestructura externa `remoto_ssh` existente conserva su funcionamiento.
Use una sola opción para ejecutar la aplicación, evitando dos servidores sobre la misma base.

## Docker Compose (desde la raíz del repositorio)

1. Copie `deployment/.env.example` a `deployment/.env`.
2. Complete el origen HTTPS, contraseña inicial de OSP y una clave de cifrado aleatoria estable.
3. Ejecute:

```bash
docker compose --env-file deployment/.env -f deployment/compose.yaml up -d --build
```

El servidor escucha en `127.0.0.1:3000`. Dirija su proxy HTTPS del VPS a ese puerto.
Los datos se conservan en el volumen `osp_autocare_data`. No borre ese volumen para actualizar.

Para actualizar, desde un checkout limpio de main:

```bash
git pull --ff-only origin main
docker compose --env-file deployment/.env -f deployment/compose.yaml up -d --build
```

No ejecute `down -v`: elimina los datos persistentes.

## Base inicial

Un arranque nuevo crea el esquema y el administrador con `BOOTSTRAP_ADMIN_PASSWORD`.
Si necesita los datos de prueba guardados del Site, la copia sanitizada está en
`data/snapshots/osp-autocare.sqlite`; su fecha y checksum están en el JSON contiguo.
Es una captura fija, no una sincronización de los datos actuales del servidor.

Para restaurar esa captura, detenga primero la aplicación y siga
`scripts/restore-test-db.mjs --app-stopped` con el mismo volumen/ruta de ejecución.
El script respalda una base existente antes de reemplazarla. Restaurar sustituye
los registros; no los fusiona. La contraseña del administrador de la copia
se inicializa desde el entorno al arrancar. Las claves de pago/IA se configuran por separado.

## Sin Docker

Requiere Node 24 y pnpm 11.25.0. Desde la raíz:

```bash
pnpm install --frozen-lockfile
pnpm exec vite build --config standalone/vite.config.ts
```

Defina `APP_ORIGIN`, `BOOTSTRAP_ADMIN_PASSWORD`, `PAYMENT_ENCRYPTION_KEY` y
`DATABASE_PATH` en el entorno del proceso. Inicie con:

```bash
node --experimental-strip-types standalone/server.ts
```

El ZIP completo incluye también `standalone-dist/` compilado para revisión;
puede regenerarlo con el comando anterior. Sirva el programa mediante su servidor Node,
no copiando toda la carpeta a un directorio web público. La base SQLite y archivos
privados se mantienen fuera del acceso HTTP.

## Verificación

`DELIVERY-MANIFEST.json` identifica cada archivo de la entrega y su SHA-256.
Incluye código, recursos, catálogos, migraciones, base inicial sanitizada, instrucciones
y compilación. Excluye contraseñas reales, sesiones, claves API, datos de ejecución,
`.git` y `node_modules` (las dependencias se instalan con el lockfile).

## IA con foto y voz

La imagen Docker incluye todo `lib/` y compila los controles de foto/voz. Configure
la clave OpenAI en Configuración de OSP; no se incorpora a la imagen ni a Git.
El modelo de transcripción se configura por separado (predeterminado `gpt-transcribe`).
Sirva el dominio con HTTPS para que el navegador permita usar el micrófono.
Las preguntas transcritas reciben lectura automática de la respuesta; también hay
un botón Escuchar si el navegador bloquea reproducción automática. El audio de
salida utiliza las voces del dispositivo. Después de actualizar, reconstruya la
imagen y vuelva a crear el servicio conservando el volumen de datos.
