# Laboratorio 5 · Cloud

Este repositorio contiene la base del laboratorio 5 y el trabajo organizado por ramas.

Estado actual de este documento: se describe el trabajo hasta la rama `despliegue-azure-automatico` (incluida).

## 1) Objetivo de la rama `despliegue-manual-mock`

Según se desprende del enunciado, en esta rama se debe desplegar manualmente la aplicación en Render utilizando datos mock, sin depender de MongoDB Atlas.

## 2) Estructura principal del proyecto

- `backend/`: API REST en Node.js + TypeScript.
- `frontend/`: frontend estático servido por el backend.
- `compose.yaml`: entorno local con backend, mongo, localstack y azurite.
- `render.yaml`: definición Blueprint de Render para la rama `despliegue-automatico`.
- `.github/workflows/azure-azurite-ci.yml`: pipeline en GitHub Actions (Azurite en Docker + build y tests del backend) para la rama `despliegue-azure-automatico`.
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

- `despliegue-automatico`: despliegue automático con Blueprint (`render.yaml`). Ver sección 12.

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

## 12) Rama `despliegue-automatico` (Blueprint Render + MongoDB Atlas)

Según se desprende del enunciado, en esta rama se debe crear una aplicación Render distinta, conectar con el MongoDB Atlas ya preparado y versionar los ficheros necesarios para un despliegue automático.

### 12.1 Fichero `render.yaml`

En la raíz del repositorio existe `render.yaml`, que define un servicio web Node:

- **Nombre del servicio**: `backend-laboratorio5-automatico`
- **Rama**: `despliegue-automatico`
- **Región**: `frankfurt`
- **Plan**: `free`
- **Root Directory**: `backend`
- **Build**: `npm install && npm run build`
- **Start**: `npm start`
- **Variables**:
  - `DATA_SOURCE=mongo`
  - `MONGO_DB_NAME=airbnb`
  - `MONGO_URI` con `sync: false` (Render pedirá el valor en el panel; no debe escribirse la URI en el repositorio).

Referencia oficial: [Blueprint YAML (Render)](https://render.com/docs/blueprint-spec).

### 12.2 Pasos en Render (despliegue automático)

1. Hacer `git push` de la rama `despliegue-automatico` para que GitHub contenga `render.yaml`.
2. En [Render Dashboard](https://dashboard.render.com/), crear un recurso desde Blueprint (menú equivalente a *New* → *Blueprint* o *Infrastructure as Code*, según la interfaz actual).
3. Conectar el mismo repositorio de GitHub y seleccionar la rama `despliegue-automatico`.
4. Aplicar el blueprint: Render detectará `render.yaml` en la raíz.
5. Cuando se solicite, introducir el valor de **`MONGO_URI`** (cadena `mongodb+srv://...` de Atlas). No compartir esa cadena en el repositorio ni en capturas sin censurar.
6. Esperar a que el servicio quede en estado `Live`.

### 12.3 Verificación

En esta práctica, la URL pública del servicio creado por el blueprint ha sido:

- `https://backend-laboratorio5-automatico.onrender.com/`

Comprobaciones recomendadas:

```bash
curl -s "https://backend-laboratorio5-automatico.onrender.com/api/health"
curl -s "https://backend-laboratorio5-automatico.onrender.com/api/listings?page=1&pageSize=5"
```

Resultado esperado: mismos datos que en Atlas (sembrados con `npm run seed:atlas` en la rama anterior), no datos mock.

### 12.4 Evidencias recomendadas

- Captura del blueprint aplicado o del servicio `backend-laboratorio5-automatico` en estado `Live`.
- Salida de los `curl` anteriores (sin exponer `MONGO_URI`).

## 13) Rama `images-from-s3` (consumo de portadas desde almacenamiento compatible con S3)

### 13.1 Relación con el enunciado

Se solicitaba crear la rama `images-from-s3` para consumir las imágenes de los alojamientos desde almacenamiento tipo **Amazon S3**. En esta implementación se utiliza la **API de S3** con el emulador **LocalStack** en local, de modo que el backend construye URLs de objeto y, si se desplegara contra **AWS S3** real, bastaría con sustituir endpoint, credenciales y bucket por los del entorno productivo, manteniendo el mismo esquema de claves de objeto.

Con ello queda cubierto el objetivo pedagógico: el cliente de la API recibe en el campo `image` una URL cuyo origen es un **bucket de objetos** (no la URL externa almacenada literalmente en `photos[0]` del modelo cuando el modo S3 está activo).

### 13.2 Comportamiento implementado

- Si existen simultáneamente las variables de entorno `S3_BUCKET_LISTING_IMAGES` y `S3_PUBLIC_BASE_URL` (valores no vacíos), el listado y el detalle exponen la portada como  
  `{S3_PUBLIC_BASE_URL}/{S3_BUCKET_LISTING_IMAGES}/{idDelListing}/cover.jpg`.
- En caso contrario se conserva el comportamiento previo: se expone `photos[0]` (por ejemplo URLs de Unsplash en los datos mock o en el seed de Atlas).

La URL pública debe ser resoluble desde el navegador o desde la máquina que ejecute `curl` (típicamente `http://localhost:4566` hacia LocalStack). El cliente AWS del script de sembrado y el valor por defecto de `S3_ENDPOINT_URL` en Compose apuntan al host **`localstack`** dentro de la red de Docker (`http://localstack:4566`).

### 13.3 Cambios técnicos realizados en el repositorio

- Dependencia `@aws-sdk/client-s3` en el backend para subir objetos desde el runner de consola.
- Dependencia `dotenv` y carga al inicio de `backend/src/index.ts` del fichero `../.env` (raíz del laboratorio, junto a `compose.yaml`) y, si existe, `backend/.env`, de forma que un arranque con `npm run dev` desde `backend/` recoja las mismas variables que se documentan para Docker sin duplicar manualmente `export` en la terminal.
- Módulo `backend/src/pods/listing/listing-s3-image-url.ts` con la función `resolveListingCoverImageUrl` y la lista `listingIdsForS3Seed` (IDs de mock y de los tres documentos del seed de Atlas).
- Ajuste de `backend/src/pods/listing/listing.mappers.ts` para usar dicha resolución en los campos `image` del resumen y del detalle.
- Runner `backend/src/console-runners/seed-s3-localstack.runner.ts` y script npm `seed:s3:localstack`, que crean el bucket si falta y suben un JPEG mínimo por cada ID de `listingIdsForS3Seed`, con clave `{id}/cover.jpg` y ACL `public-read` para permitir lectura HTTP anónima en el escenario local.
- Variables documentadas en `.env.example` y pasadas al servicio `backend` en `compose.yaml`, con `depends_on` respecto de LocalStack.
- Prueba en `listing.mappers.spec.ts` que valida la URL generada cuando las variables S3 están definidas.

### 13.4 Procedimiento recomendado en local

1. Arrancar el stack: `docker compose up -d` (LocalStack en el puerto 4566).
2. Sembrar objetos en S3 emulado, desde el directorio `backend/` (el host debe alcanzar LocalStack en `127.0.0.1:4566`):

```bash
export S3_BUCKET_LISTING_IMAGES=lab5-listings
export S3_ENDPOINT_URL=http://127.0.0.1:4566
npm run seed:s3:localstack
```

3. Definir en el `.env` de la raíz del laboratorio (no versionado), al menos:

```bash
S3_BUCKET_LISTING_IMAGES=lab5-listings
S3_PUBLIC_BASE_URL=http://localhost:4566
```

4. Reiniciar el proceso del backend tras cualquier cambio en `.env`.

### 13.5 Resultado esperado frente al enunciado

Tras el paso anterior, la comprobación siguiente debe devolver URLs bajo `http://localhost:4566/lab5-listings/.../cover.jpg`, no URLs de Unsplash:

```bash
curl -s "http://localhost:3000/api/listings?page=1&pageSize=2" | jq '.items[].image'
```

Ejemplo de salida coherente con lo solicitado (valores concretos dependen del bucket y del `listingId`):

```text
"http://localhost:4566/lab5-listings/mock-listing-1/cover.jpg"
"http://localhost:4566/lab5-listings/mock-listing-2/cover.jpg"
```

Si la salida sigue mostrando `https://images.unsplash.com/...`, el proceso de Node no tenía cargadas `S3_BUCKET_LISTING_IMAGES` y `S3_PUBLIC_BASE_URL` en el momento del arranque (fichero `.env` no leído, variables no exportadas en la sesión, o contenedor no recreado tras editar `.env`). Con la carga mediante `dotenv` descrita en el apartado 13.3, basta con reiniciar el servidor desde `backend/` con el `.env` de la raíz ya configurado, o bien recrear el servicio con `docker compose up -d --force-recreate backend`.

### 13.6 Evidencias sugeridas para la entrega

- Captura o salida de texto del `curl` anterior mostrando URLs del bucket LocalStack.
- Captura opcional de `curl -I` sobre una de esas URLs con código `200` y `Content-Type: image/jpeg`.
- Referencia en la memoria a que LocalStack simula S3 y que el mismo patrón de claves sería aplicable a un bucket en AWS.

## 14) Rama `despliegue-azure-automatico` (Azurite: emulador local de Azure Storage)

### 14.1 Objetivo y alcance

En el laboratorio, la vertiente asociada a **Microsoft Azure** se aborda mediante **Azurite**, el emulador oficial de **Azure Storage** (API de blobs, colas y tablas) ejecutado en local con Docker. No se utiliza suscripción en la nube de Azure ni despliegue en **Azure App Service**; Azurite **no** sustituye a un servicio de alojamiento de la API, sino que ofrece el mismo tipo de endpoint y contrato que Azure Storage para pruebas sin coste de plataforma.

Esta rama documenta ese alcance y mantiene alineado el repositorio con el `compose.yaml` ya existente, donde el servicio `azurite` escucha en los puertos **10000** (blob), **10001** (cola) y **10002** (tabla).

### 14.2 Arranque del emulador

Desde la raíz del laboratorio:

```bash
docker compose up -d azurite
```

O, para levantar todo el stack (Mongo, backend, LocalStack y Azurite): `docker compose up -d`.

Los datos persistentes del emulador se guardan bajo el directorio `azurite/` (persistencia local; no versionar credenciales ni datos sensibles en Git).

### 14.3 Comprobación de que el servicio responde

```bash
curl -s "http://localhost:10000/devstoreaccount1?comp=list"
```

Una respuesta `400` o `403` sin firma ni contenedor es habitual y **sigue indicando** que Azurite está activo (véase también el apartado 4.4).

### 14.4 Relación con el resto del laboratorio

- **LocalStack** cubre la API compatible con **Amazon S3** en local (rama `images-from-s3`).
- **Azurite** cubre la API de **Azure Storage** en local en esta rama.
- El despliegue público de la API en **Render** (ramas anteriores) permanece independiente de ambos emuladores.

### 14.5 Pipeline automática (GitHub Actions + Docker, sin nube Azure)

El fichero **`.github/workflows/azure-azurite-ci.yml`** define integración continua para la rama **`despliegue-azure-automatico`**. Disparadores: **`push`**, **`pull_request`** contra esa rama y **`workflow_dispatch`** (ejecución manual desde la pestaña *Actions* de GitHub).

#### 14.5.1 Qué hace el workflow, en orden

1. **`docker compose up -d azurite`** en la raíz del repositorio: se usa la **misma definición** que en el apartado 14.2 (`compose.yaml`, servicio `azurite`), no un `docker run` paralelo con otra receta.
2. Comprobación con **`curl`** contra el endpoint de **blob** en **`127.0.0.1:10000`** (`devstoreaccount1?comp=list`). Respuestas **`400`** o **`403`** sin autenticación cuentan como servicio activo (mismo criterio que en 4.4 y 14.3).
3. En **`backend/`**: **`npm ci`**, **`npm run build`** y **`npm test`**.

No se declaran secretos de Microsoft Azure. El alcance es **CI** sobre el emulador **Azure Storage** en Docker, no publicación en App Service ni otra nube de Azure.

#### 14.5.2 Por qué en GitHub Actions se vuelve a levantar Azurite si ya existe en `compose.yaml`

En la máquina del desarrollador, **Azurite ya forma parte del stack** definido en `compose.yaml`; basta con `docker compose up -d` (o solo el servicio `azurite`) para tenerlo en local.

Un **runner de GitHub Actions** es otra cosa: una máquina virtual **nueva y vacía** en cada ejecución, **sin** los contenedores que el alumno tenga corriendo en su portátil. El workflow **no puede** “reutilizar” el Azurite del ordenador local; tiene que **arrancar de nuevo** el servicio en ese entorno para poder comprobar el endpoint y ejecutar los pasos de Node.

Por tanto no hay dos Azurites compitiendo en el mismo sitio: uno es el del **desarrollo local** (compose en el PC), otro es el del **job de CI** (compose en el runner, efímero). La pipeline usa **`docker compose up -d azurite`** precisamente para **no duplicar** imagen, puertos ni comando en un script distinto al `compose.yaml`.

#### 14.5.3 Lectura frente al enunciado (“despliegue Azure + Docker”)

Con esta rama se documenta y automatiza la parte **Azure** del laboratorio como **Azure Storage emulado (Azurite) + Docker**, más una **pipeline** que lo valida junto al build del backend. Eso encaja con una interpretación del enunciado en la que **“despliegue automático”** equivale a **integración continua** y **“Azure”** al **contrato de Azure Storage** vía Azurite, **no** a una suscripción obligatoria ni a despliegue de la API en la nube de Microsoft.
