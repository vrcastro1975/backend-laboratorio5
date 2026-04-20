#!/usr/bin/env bash

set -euo pipefail

CONTAINER_NAME="my-mongo-db"
DB_NAME="airbnb"
BACKUP_SOURCE="./airbnb"
BACKUP_TARGET_DIR="/opt/app"

if ! docker container inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
  echo "No encuentro el contenedor '${CONTAINER_NAME}'."
  echo "Levanta primero Mongo con: docker compose up -d"
  exit 1
fi

if [ "$(docker inspect -f '{{.State.Running}}' "${CONTAINER_NAME}")" != "true" ]; then
  echo "El contenedor '${CONTAINER_NAME}' existe, pero no esta en ejecucion."
  echo "Arrancalo con: docker compose up -d"
  exit 1
fi

if [ ! -d "${BACKUP_SOURCE}" ]; then
  echo "No encuentro el backup en: ${BACKUP_SOURCE}"
  exit 1
fi

echo "Limpiando backups previos en ${BACKUP_TARGET_DIR} dentro del contenedor..."
docker exec "${CONTAINER_NAME}" sh -c "mkdir -p ${BACKUP_TARGET_DIR} && rm -rf ${BACKUP_TARGET_DIR}/*"

echo "Copiando backup local a ${CONTAINER_NAME}:${BACKUP_TARGET_DIR}..."
docker cp "${BACKUP_SOURCE}/." "${CONTAINER_NAME}:${BACKUP_TARGET_DIR}"

echo "Restaurando base de datos '${DB_NAME}'..."
docker exec "${CONTAINER_NAME}" sh -c "mongorestore --drop --db ${DB_NAME} ${BACKUP_TARGET_DIR}"

echo "Backup restaurado correctamente."
echo "Puedes validar con:"
echo "  docker exec -it ${CONTAINER_NAME} mongosh --eval 'db.getSiblingDB(\"${DB_NAME}\").listCollections()'"
