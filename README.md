# Laboratorio 5 · Cloud

Este repositorio contiene la base del laboratorio 5 y el trabajo organizado por ramas.

Estado actual de este documento: rama `despliegue-manual-mongo`.

## 1) Objetivo de la rama `despliegue-manual-mock`

Según se desprende del enunciado, en esta rama se debe desplegar manualmente la aplicación en Render utilizando datos mock, sin depender de MongoDB Atlas.

## 2) Estructura principal del proyecto

- `backend/`: API REST en Node.js + TypeScript.
- `frontend/`: frontend estático servido por el backend.
- `compose.yaml`: entorno local con backend, mongo, localstack y azurite.
- `.env.example`: variables de entorno de referencia.
- `localstack/` y `azurite/`: persistencia local de simuladores cloud.

## 3) Modo de datos

La API soporta dos fuentes de datos:

- `DATA_SOURCE=mock`: datos en memoria (modo utilizado en esta rama).
- `DATA_SOURCE=mongo`: acceso a MongoDB con Mongoose (para ramas posteriores).

Para `despliegue-manual-mock` debe utilizarse `DATA_SOURCE=mock`.

## 4) Preparación local previa (recomendada)

Antes de desplegar en Render, conviene comprobar que la aplicación funciona en local.

### 4.1 Copiar variables de entorno

Desde la raíz del laboratorio:

```bash
cp .env.example .env
```

### 4.2 Arrancar el entorno local

```bash
docker compose up -d
```

### 4.3 Validar endpoints mínimos

```bash
curl -s "http://localhost:3000/api/health"
curl -s "http://localhost:3000/api/listings?page=1&pageSize=2"
```

Resultado esperado:

- `health` responde con estado `ok`.
- `listings` devuelve elementos mock y bloque de paginación.

### 4.4 Comprobar simuladores cloud locales (opcional)

```bash
curl -s "http://localhost:4566/_localstack/health"
curl -s "http://localhost:10000/devstoreaccount1?comp=list"
```

Nota: la respuesta de Azurite puede ser `400/403` sin firma/autenticación, y sigue siendo válida como prueba de servicio activo.

## 5) Despliegue manual en Render (paso por paso)

Se necesita una cuenta en Render y el repositorio publicado en GitHub.

### 5.1 Publicar la rama en GitHub

Si la rama aún no está en remoto:

```bash
git push -u origin despliegue-manual-mock
```

### 5.2 Acceder a Render y crear el servicio

1. Entrar en [Render](https://render.com/) e iniciar sesión.
2. En el panel principal, pulsar `New +`.
3. Seleccionar `Web Service`.

### 5.3 Conectar el repositorio de GitHub

1. Si es la primera vez, autorizar Render para acceder a GitHub.
2. Elegir la opción para seleccionar repositorio.
3. Buscar este repositorio y pulsar `Connect`.

### 5.4 Configurar el Web Service

En el formulario de creación:

- **Name**: nombre libre, por ejemplo `laboratorio5-mock`.
- **Region**: la más cercana.
- **Branch**: `despliegue-manual-mock`.
- **Runtime**: `Node`.
- **Root Directory**: `backend`.
- **Build Command**: `npm install && npm run build`.
- **Start Command**: `npm start`.

### 5.5 Configurar variables de entorno en Render

En `Environment Variables`, añadir:

- `DATA_SOURCE=mock`

Opcional:

- `PORT=10000` (Render suele inyectar el puerto automáticamente).

Para esta rama no es necesario configurar `MONGO_URI`.

### 5.6 Crear y lanzar el despliegue

1. Pulsar `Create Web Service`.
2. Esperar a que termine el build y el deploy.
3. Verificar que el estado del servicio aparece como `Live`.

### 5.7 Flujo real aplicado en esta práctica (GitHub + Render)

Durante la práctica se siguió este flujo real de configuración:

1. Se creó un `Web Service` en Render asociado al repositorio de GitHub.
2. Se seleccionó la rama `despliegue-manual-mock`.
3. Se eligió una instancia gratuita (`0$/month`).
4. Se eligió la región más cercana (`Frankfurt`).
5. En la pantalla final de configuración apareció el botón `Deploy Web Service`.

Observación importante:

- En algunos flujos de Render aparece previamente el botón `Connect` al repositorio.
- En otros flujos, esa conexión ya queda resuelta antes y en la pantalla final solo aparece `Deploy Web Service`.
- Ambos comportamientos son correctos y dependen de la interfaz mostrada por Render en ese momento.

Configuración final utilizada:

- **Branch**: `despliegue-manual-mock`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: `DATA_SOURCE=mock` (y `PORT` opcional)

## 6) Verificación del despliegue en Render

Cuando Render genere la URL pública (por ejemplo `https://nombre-servicio.onrender.com`), comprobar:

En este caso, la URL proporcionada por Render para la práctica ha sido:

- `https://backend-laboratorio5.onrender.com/`

```bash
curl -s "https://TU-SERVICIO.onrender.com/api/health"
curl -s "https://TU-SERVICIO.onrender.com/api/listings?page=1&pageSize=2"
```

Resultado esperado:

- respuesta correcta en `health`,
- listado paginado con datos mock en `listings`.

## 7) Comprobaciones en caso de error

Si el servicio no arranca, revisar:

1. **Rama correcta**: `despliegue-manual-mock`.
2. **Root Directory**: `backend`.
3. **Comandos**:
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. **Variables**:
   - `DATA_SOURCE=mock`
5. **Logs en Render**:
   - revisar `Logs` para detectar errores de build o arranque.
6. **Error frecuente detectado en esta práctica**:
   - si se configura `npm install npm run build` (sin `&&`), Render no ejecuta la compilación correctamente.
   - debe configurarse exactamente `npm install && npm run build`.
   - síntoma típico: error en arranque por ausencia de `dist/index.js`.

## 8) Evidencias recomendadas para entrega

Para documentar la práctica, conviene adjuntar:

- captura del servicio en estado `Live`,
- captura de variables de entorno (sin secretos),
- salida de `GET /api/health`,
- salida de `GET /api/listings?page=1&pageSize=2`.

## 9) Gestión del servicio en Render tras la entrega

Como práctica de seguimiento, el servicio puede mantenerse activo hasta recibir revisión/corrección del profesor.

Si se necesita eliminar el despliegue:

1. Entrar en [Render Dashboard](https://dashboard.render.com/).
2. Abrir el servicio desplegado.
3. Ir a `Settings`.
4. Bajar a `Danger Zone`.
5. Pulsar `Delete Service`.
6. Confirmar la eliminación cuando Render lo solicite.

Nota:

- El borrado elimina URL pública, historial de despliegues y configuración del servicio.
- Si se prevé una revisión próxima, conviene mantener el servicio activo y eliminarlo al finalizar la corrección.

## 10) Continuidad en ramas siguientes

- `despliegue-automatico`: preparación de despliegue automático.

## 11) Rama `despliegue-manual-mongo` (Atlas + Render)

Según se desprende del enunciado, en esta rama se debe usar MongoDB Atlas como base de datos de producción, insertar datos distintos de los mock mediante un `console-runner` y desplegar en una aplicación Render diferente.

### 11.1 Preparar MongoDB Atlas

1. Crear cluster y base de datos en Atlas.
2. Crear usuario de base de datos con permisos de lectura/escritura.
3. Configurar `Network Access` para permitir conexión desde Render (y, si procede, desde local para ejecutar el runner).
4. Copiar la URI de conexión.

Guía detallada en Atlas:

1. Entrar en [MongoDB Atlas](https://www.mongodb.com/atlas/database) y abrir el proyecto.
2. Ir a `Database` y crear un cluster (plan gratuito si aplica).
3. Ir a `Security` -> `Database and network access` -> `Add New Database User`.
4. En el formulario del usuario:
   - **Authentication Method**: `Password`.
   - **Username**: un nombre técnico, por ejemplo `render_app_user`.
   - **Password**: contraseña robusta y guardada en un gestor seguro.
   - **Description**: opcional (por ejemplo `Usuario para despliegue manual mongo`).
   - **Privileges**: para esta práctica, `Read and write to any database` (equivale a `readWriteAnyDatabase`).
5. Guardar el usuario.
6. En la misma sección de seguridad (`Database and network access`), ir al bloque de red y añadir acceso:
   - `0.0.0.0/0` temporalmente para pruebas, o
   - IPs concretas si se quiere mayor restricción.
7. Volver a `Database` -> `Connect` -> `Drivers`.
8. Copiar la URI `mongodb+srv://...` y reemplazar `<username>` y `<password>`.

### 11.2 Configurar entorno local para ejecutar el runner

En `.env`:

```env
DATA_SOURCE=mongo
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster-url>/?retryWrites=true&w=majority
MONGO_DB_NAME=airbnb
```

### 11.3 Insertar datos en Atlas con console-runner

Se ha implementado el runner:

- `backend/src/console-runners/seed-atlas.runner.ts`

Y el script npm:

```bash
cd backend
npm run seed:atlas
```

Comportamiento del runner:

- valida que exista `MONGO_URI`,
- conecta a Atlas con `MONGO_DB_NAME`,
- elimina los documentos existentes de `listingsAndReviews`,
- inserta un dataset de ejemplo distinto del modo mock.

Ejecución recomendada desde la raíz del laboratorio (cargando variables desde `.env`):

```bash
set -a
source .env
set +a
cd backend
npm run seed:atlas
```

Salida esperada:

```text
Seed de Atlas completado. Insertados 3 documentos en 'airbnb'.
```

### 11.4 Configurar una aplicación Render nueva para esta rama

En Render, crear un `Web Service` nuevo con:

- **Name** (ejemplo de esta práctica): `backend-laboratorio5-mongoatlas` (nombre distinto del servicio mock para no confundirlos).
- **Branch**: `despliegue-manual-mongo`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

Nota sobre la rama en el desplegable de Render:

- Si la rama `despliegue-manual-mongo` no aparece, hay que hacer `git push` al remoto y refrescar la página de Render hasta que GitHub la exponga.

Variables de entorno en Render (obligatorio definirlas en el panel; el `.env` local no las aplica al contenedor de Render):

- `DATA_SOURCE=mongo`
- `MONGO_URI=<uri-atlas>`
- `MONGO_DB_NAME=airbnb`

Se puede usar la opción `Add from .env` en Render para pegar el bloque de variables (sin subir el fichero `.env` al repositorio).

Opcional:

- `PORT=10000` (Render suele inyectar el puerto automáticamente).

### 11.5 Verificación funcional

En esta práctica, la URL pública del servicio Render para esta rama ha sido:

- `https://backend-laboratorio5-mongoatlas.onrender.com/`

Comprobaciones recomendadas:

```bash
curl -s "https://backend-laboratorio5-mongoatlas.onrender.com/api/health"
curl -s "https://backend-laboratorio5-mongoatlas.onrender.com/api/listings?page=1&pageSize=5"
```

Resultado esperado:

- respuesta correcta en `health`,
- respuesta de `listings` con los datos insertados en Atlas por el runner.

Evidencia para entrega: captura de pantalla del servicio en estado `Live` (por ejemplo `Captura de pantalla rama mongo atlas manual.png` en la raíz del laboratorio, versionada junto al resto del proyecto).

### 11.6 Checklist operativo recomendado

Orden recomendado de ejecución:

1. Confirmar acceso a Atlas (usuario + red + URI).
2. Ejecutar `npm run seed:atlas` en local.
3. Verificar en Atlas que existen documentos en `listingsAndReviews`.
4. Crear servicio nuevo en Render para `despliegue-manual-mongo`.
5. Configurar variables (`DATA_SOURCE`, `MONGO_URI`, `MONGO_DB_NAME`).
6. Desplegar y validar endpoints públicos.
