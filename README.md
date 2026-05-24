# VaultUnlocked

Marketplace de recursos digitales gratuitos inspirado en BuiltByBit y MC-Market.

## Instalación

1. Abre una terminal en el directorio del proyecto.
2. Ejecuta `npm install`.
3. Ejecuta `npm start`.
4. Abre `http://localhost:3000` en tu navegador.

## Estructura del proyecto

- `server.js` - servidor Express principal.
- `/public` - frontend estático.
- `/routes` - rutas Express para autenticación, recursos y administración.
- `/helpers` - lógica de lectura/escritura de JSON.
- `/data` - archivos JSON que almacenan usuarios, recursos y comentarios.
- `/uploads` - archivos digitales subidos.

## Usuarios por defecto

- Admin: `admin@vaultunlocked.test` / `Admin123!`

## Funcionalidades

- Registro y login de usuarios.
- Subida y descarga gratuita de recursos.
- Comentarios por recurso.
- Panel de administración para editar y eliminar usuarios y recursos.

## Categorías

- El sistema guarda una categoría por recurso. Puedes filtrar recursos por categoría en la página principal.
- Las categorías se obtienen dinámicamente desde el endpoint `GET /api/resources/categories`.

## Notas

- No se usa base de datos; todos los datos se almacenan en `/data` en formato JSON.
- Archivos subidos se guardan en `/uploads`.
- Para cambiar el puerto, exporta la variable `PORT` antes de ejecutar `npm start`.
