# Entrega completa — 2026-11-02

Se incorporó la versión 40 publicada de OSP AutoCare al repositorio GitHub,
conservando la biblioteca PNG y los archivos de despliegue existentes.
Incluye el navegador de marcas/modelos, logos, tarjetas adaptables y dibujos
transparentes: 636 referencias de catálogo y 157 modelos geométricos genéricos.

Verificación de esta entrega: compilación standalone, TypeScript, nueve suites
de catálogos/interfaz/recursos y arranque con la misma estructura de carpetas del
Dockerfile. Se comprobó login inicial, logos JPEG, dibujos WebP y el índice de marcas.
Docker no está instalado en el entorno de preparación. El flujo de GitHub Actions
construye la imagen desde `deployment/Dockerfile` y genera el ZIP completo en `main`.
Consulte el resultado de Actions para conocer la verificación del contenedor.

El ZIP se genera con `scripts/package-complete.py` e incluye frontend compilado,
fuentes, recursos, Docker/Compose, instrucciones, capturas sanitizadas existentes
y `DELIVERY-MANIFEST.json` con el commit y los SHA-256 de cada archivo.
Las capturas mantienen su propia fecha: no se exportó de nuevo la base viva.
Se excluyen credenciales reales, sesiones, archivos de ejecución y node_modules.

Esta sincronización actualiza GitHub. No ejecuta comandos en el VPS ni cambia
la base de producción. La infraestructura externa `remoto_ssh` se conserva.
