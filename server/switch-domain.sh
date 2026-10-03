#!/usr/bin/env bash
# Переключение основного домена на этот сервер. Запускать после смены DNS-записей.
set -euo pipefail
F=/etc/nginx/sites-available/southwood-site
for h in southwood.pw www.southwood.pw; do
  ip=$(getent hosts "$h" | awk '{print $1}' | head -1 || true)
  echo "$h -> ${ip:-нет записи}"
done
grep -q "server_name southwood.pw" "$F" || sed -i 's/server_name new.southwood.pw;/server_name southwood.pw www.southwood.pw new.southwood.pw;/' "$F"
nginx -t && systemctl reload nginx
certbot --nginx --expand --non-interactive --redirect -d new.southwood.pw -d southwood.pw -d www.southwood.pw
echo "== Готово: https://southwood.pw"
