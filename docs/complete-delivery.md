# Entrega completa — 2026-10-30

Se comparó cada archivo versionado del Site con el repositorio. El código, recursos,
catálogos y diseño actuales coincidían. Los únicos archivos exclusivos del Site eran
el antiguo Dockerfile, Compose y su archivo de exclusiones; la infraestructura
externa había sido separada previamente del repositorio.

Se agregó `deployment/` como opción independiente completa, sin reemplazar la
infraestructura externa. El Dockerfile copia todo `lib/` para incluir los módulos
actuales como `business-profile.ts`. Se conectó también el inicializador existente
del administrador de una captura sanitizada al arranque del servidor independiente.

La entrega incluye fuentes, recursos, catálogos, esquema/migraciones, capturas
sanitizadas con sus fechas, configuración de ejemplo, instrucciones y compilación
`standalone-dist/` dentro del ZIP. El ZIP se genera con `scripts/package-complete.py`;
`DELIVERY-MANIFEST.json` permite verificar cada archivo mediante SHA-256.

Se verificaron: compilación standalone, tres suites de pruebas y arranque limpio
con los directorios de ejecución del Dockerfile. La prueba de arranque comprobó el
MIME del manifest y el login OSP sobre una copia temporal de la base inicial.
Docker no está disponible en este entorno: la construcción de la imagen debe
validarse en el VPS. No se accedió al folder remoto `remoto_ssh` ni al VPS del usuario.

Las capturas de datos guardadas conservan su propia fecha; esta entrega no es una
copia nueva de la base viva del Site. No incluye contraseñas reales, sesiones,
claves API, variables privadas ni dependencias descargadas (`node_modules`).
