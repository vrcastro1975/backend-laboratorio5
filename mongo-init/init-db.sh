#!/usr/bin/env bash
set -euo pipefail

echo "Inicializando backup de airbnb..."
mongorestore --drop --db airbnb /opt/app/airbnb
echo "Backup de airbnb restaurado."
