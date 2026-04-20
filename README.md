# Laboratorio 5 · Cloud

Este repositorio contiene la base del laboratorio 5 y su trabajo por ramas.

Estado actual: rama `despliegue-manual-mock`.

## Objetivo de esta rama

Desplegar manualmente en Render usando datos mock, sin depender de MongoDB Atlas.

## Estructura principal

- `backend/`: API REST.
- `frontend/`: frontend estatico servido por el backend.
- `compose.yaml`: entorno local con backend, mongo, localstack y azurite.
- `.env.example`: variables de entorno de referencia.
- `localstack/` y `azurite/`: persistencia de simuladores cloud locales.

## Modo de datos

La API soporta dos fuentes de datos:

- `DATA_SOURCE=mock` (por defecto en esta rama): datos en memoria, no requiere Mongo.
- `DATA_SOURCE=mongo`: usa MongoDB via Mongoose.

En esta rama, el despliegue en Render debe usar `mock`.

## Ejecucion local (rama mock)

```bash
cp .env.example .env
docker compose up -d
```

Comprobaciones:

```bash
curl -s "http://localhost:3000/api/health"
curl -s "http://localhost:3000/api/listings?page=1&pageSize=2"
```

## Despliegue manual en Render (despliegue-manual-mock)

Si, necesitas cuenta en Render para desplegar alli.

Pasos recomendados:

1. Crear un servicio **Web Service** en Render conectado a este repositorio y rama `despliegue-manual-mock`.
2. Configurar:
   - Runtime: `Node`
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
3. Variables de entorno en Render:
   - `PORT=10000` (o dejar el valor que Render inyecta automaticamente)
   - `DATA_SOURCE=mock`
4. Desplegar y comprobar:
   - `GET /api/health`
   - `GET /api/listings?page=1&pageSize=2`

Para esta rama no hace falta configurar `MONGO_URI`.

## Nota para ramas siguientes

- `despliegue-manual-mongo`: aqui si se configurara MongoDB Atlas.
- `despliegue-automatico`: despliegue automatico con los ficheros de configuracion correspondientes.
# Laboratorio 5 · Cloud

Este laboratorio parte de la base técnica del laboratorio 4 (`feature/mongoose`) y añade una capa de práctica cloud.

La idea es poder trabajar en local sin necesidad de registrarse en AWS o Azure.

## Estructura principal

- `compose.yaml`: levanta MongoDB, backend, LocalStack y Azurite.
- `backend/`: API REST base (heredada del laboratorio 4).
- `frontend/`: frontend opcional de verificación rápida.
- `airbnb/` y `mongo-init/`: restauración de base de datos de ejemplo.
- `localstack/`: datos persistentes para simulación AWS.
- `azurite/`: datos persistentes para simulación Azure Storage.
- `Enunciado L5/`: enunciado oficial del laboratorio 5.

## Simulación cloud local (sin cuentas reales)

### LocalStack (simula AWS)

Servicio en Docker:

- Imagen: `localstack/localstack`
- Puerto principal: `4566`
- Ruta de datos: `./localstack`

Servicios habilitados para práctica:

- `s3`, `sqs`, `ssm`, `dynamodb`, `lambda`, `cloudwatch`, `iam`, `sts`

### Azurite (simula Azure Storage)

Servicio en Docker:

- Imagen: `mcr.microsoft.com/azure-storage/azurite`
- Puertos:
  - `10000` (Blob)
  - `10001` (Queue)
  - `10002` (Table)
- Ruta de datos: `./azurite`

## Arranque del entorno completo

Desde la raíz del laboratorio:

```bash
docker compose up -d
```

Parar todo:

```bash
docker compose down
```

Parar y limpiar volúmenes:

```bash
docker compose down -v
```

## Configuracion de credenciales y Atlas

No subas nunca credenciales reales al repositorio.

Flujo recomendado:

1. Copiar el ejemplo a un archivo local:

```bash
cp .env.example .env
```

2. Editar `.env` con tus valores.

- Para local:
  - `MONGO_URI=mongodb://mongo-db:27017`
- Para Atlas:
  - `MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/?retryWrites=true&w=majority`

3. Levantar servicios:

```bash
docker compose up -d
```

Tambien puedes usar variables de entorno con `export` en lugar de `.env`.

## Comprobaciones rápidas recomendadas

### 1) MongoDB + backend

```bash
curl -s "http://localhost:3000/api/health"
```

### 2) LocalStack levantado

```bash
curl -s "http://localhost:4566/_localstack/health"
```

### 3) Azurite levantado

```bash
curl -s "http://127.0.0.1:10000/devstoreaccount1?comp=list"
```

> Nota: la respuesta de Azurite puede ser `400/403` sin firma/autenticación, y sigue siendo válida como prueba de que el servicio está activo.

## Verificación de réplica Lab 4 -> Lab 5

Se replicó el contenido de `Laboratorio 4. API REST` (rama `feature/mongoose`) sobre este laboratorio sin mezclar historiales Git.

Resultado de verificación:

- La estructura de archivos quedó replicada.
- La única diferencia esperada frente a Lab 4 es `Enunciado L5/` (propio de este laboratorio).
- Se conservaron servicios base (`mongo-db`, `backend`) y se añadieron los servicios cloud simulados (`localstack`, `azurite`).

## Referencias heredadas que conviene ajustar

Al venir de Lab 4, todavía hay textos identificativos con nombre de laboratorio anterior (por ejemplo en `frontend/index.html`, `backend/package.json` y algunos tests/token de auth).

No rompe el funcionamiento técnico, pero sí es recomendable renombrarlo a Lab 5 para dejar el proyecto coherente antes de entregar.
