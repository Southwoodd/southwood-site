#!/usr/bin/env bash
# Убирает адрес new.southwood.pw с сервера: из nginx и из сертификата.
# Запуск: curl -fsSL https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server/drop-new.sh | sudo bash
set -euo pipefail
F=/etc/nginx/sites-available/southwood-site
cp "$F" "$F.bak-$(date +%s)"
BAK=$(ls -t "$F".bak-* | head -1)
sed -i '/if (\$host = new\.southwood\.pw)/,/}/d' "$F"
sed -i '/server_name/s/ new\.southwood\.pw//' "$F"
if ! nginx -t; then cp "$BAK" "$F"; echo "Ошибка в конфиге, вернул как было"; exit 1; fi
systemctl reload nginx
certbot --nginx --non-interactive --redirect --cert-name southwood.pw -d southwood.pw -d www.southwood.pw
nginx -t && systemctl reload nginx
if grep -rq "live/new.southwood.pw" /etc/nginx/sites-enabled /etc/nginx/snippets 2>/dev/null; then
  echo "Старый сертификат еще используется, не удаляю:"; grep -rn "live/new.southwood.pw" /etc/nginx/sites-enabled /etc/nginx/snippets
else
  certbot delete --non-interactive --cert-name new.southwood.pw || true
fi
echo "Готово. Имена в конфиге:"; grep -n "server_name" "$F"
