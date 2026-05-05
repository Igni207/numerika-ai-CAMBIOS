# 🚀 Actualización de Desarrollo (Mayo 2026)

Este documento resume los cambios técnicos implementados para preparar el proyecto NumérikaAI para su despliegue y exposición, garantizando la estabilidad local y un entorno listo para producción.

## 1. Corrección de Base de Datos y Caché de Login

### El Problema
Los usuarios estaban experimentando cierres de sesión inesperados al recargar la página. 
Esto ocurría porque el backend estaba intentando usar la base de datos remota (Railway/PostgreSQL). Cuando esta conexión fallaba por timeouts, el backend hacía un fallback dinámico a la base de datos local SQLite (`numerika_local.db`). Como la base de datos local estaba vacía o no tenía sincronizados los usuarios de la base remota, la ruta `/api/auth/me` devolvía error 404 (Usuario no encontrado), provocando que `AuthContext` borrara el JWT del `localStorage` por seguridad.

### La Solución
1. **Consolidación de SQLite**: Se mejoró el script `src/config/db.js` para asegurar de que el entorno local esté completamente funcional como entorno de desarrollo independiente.
2. **Creación de Tabla `ika_chats`**: Se añadió la migración automática de la tabla `ika_chats` al fallback de SQLite. Anteriormente, si la aplicación caía a la base de datos local e intentaba consultar el historial de IKA, fallaba abruptamente. Ahora el esquema es 100% compatible.
3. Se generó un script (`verify-login.js`) que simula automáticamente el registro, inicio de sesión y persistencia, garantizando que el flujo funcione localmente sin dependencias externas.

## 2. Limpieza y Reestructuración

Debido al crecimiento rápido del proyecto, se acumularon archivos temporales y ramas de desarrollo abandonadas.

- **Eliminación de archivos innecesarios**: Se borraron scripts de prueba como `test-conexion.cjs`, `tmp-test-openai.js`, y `scratch-test.js`.
- **Eliminación del Backend en Python**: Se eliminó de manera definitiva la carpeta `backend/` que contenía el motor matemático antiguo en Python. Toda la lógica de parseo matemático y cálculo numérico ahora corre nativamente y de manera segura en JavaScript/Node.js gracias a `mathjs`, mejorando el rendimiento y reduciendo la complejidad de infraestructura.

## 3. Preparación para Despliegue en Vercel

Para tener un despliegue completo (Fullstack) sin necesidad de mantener múltiples servidores, se adaptó el backend de Express para funcionar como **Serverless Functions** dentro de Vercel.

- **Migración de `server.js`**: El archivo raíz del servidor se movió a `api/index.js`.
- **Actualización de Imports**: Todas las dependencias dentro del API fueron actualizadas para usar rutas relativas correctas (`../src/...`).
- **Configuración `vercel.json`**: Se agregaron reglas de _rewrites_ para que todas las peticiones a `/api/*` sean procesadas por la Serverless Function, mientras que el resto del tráfico es manejado por la build de React (`/index.html`).

## 4. Nuevos Scripts de Automatización

Para facilitar el desarrollo concurrente, se han introducido nuevos comandos en `package.json`:

- `npm run start:local` ejecuta el script `start-local.js` que levanta simultáneamente tanto el servidor API (puerto 3000) como el servidor de desarrollo de Vite, con sus logs coloreados y organizados en una sola terminal.

## Próximos Pasos Recomendados

- **Sincronización DB**: Si en un futuro volvemos a usar Railway de manera estricta, deberemos crear un script de seeding/migración que iguale las bases SQLite de los desarrolladores con el entorno de pruebas.
- **Variables de Entorno**: Asegurarse de que en el panel de Vercel estén configuradas todas las variables (especialmente `JWT_SECRET`, `OPENAI_API_KEY` y `VITE_API_URL` vacía o apuntando al dominio).
