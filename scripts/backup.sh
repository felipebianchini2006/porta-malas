#!/bin/sh
set -eu

backup_root=${1:-./backups}
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_dir="$backup_root/$timestamp"
mkdir -p "$backup_dir"

docker compose exec -T db pg_dump -U porta_malas -d porta_malas -Fc > "$backup_dir/database.dump"
docker compose run --rm --no-deps -T --entrypoint sh app -c 'tar -C /app/uploads -czf - .' > "$backup_dir/uploads.tar.gz"

test -s "$backup_dir/database.dump"
test -s "$backup_dir/uploads.tar.gz"
printf '%s\n' "$backup_dir"
