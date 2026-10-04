#!/usr/bin/env bash
# Переадресация www.southwood.pw на southwood.pw одним шагом.
# Запуск: curl -fsSL https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server/www-redirect.sh | sudo bash
set -euo pipefail
F=/etc/nginx/sites-available/southwood-site
if grep -q "www-redirect" "$F"; then echo "Уже настроено"; exit 0; fi
BAK="$F.bak-$(date +%s)"; cp "$F" "$BAK"
# с http сразу на основной адрес, без промежуточного шага через www
sed -i 's#return 301 https://\$host\$request_uri;#return 301 https://southwood.pw$request_uri;#' "$F"
# в каждом блоке сайта: если пришли на www, уводим на основной
sed -i '/server_name southwood\.pw www\.southwood\.pw;/a\    if ($host = www.southwood.pw) { return 301 https://southwood.pw$request_uri; } # www-redirect' "$F"
if ! nginx -t; then cp "$BAK" "$F"; echo "Ошибка в конфиге, вернул как было"; exit 1; fi
systemctl reload nginx
sleep 1
for u in https://www.southwood.pw/ http://www.southwood.pw/ http://southwood.pw/ https://southwood.pw/; do
  curl -s -o /dev/null -m 10 --resolve www.southwood.pw:443:127.0.0.1 --resolve www.southwood.pw:80:127.0.0.1 --resolve southwood.pw:443:127.0.0.1 --resolve southwood.pw:80:127.0.0.1 -w "$u -> %{http_code} %{redirect_url}\n" "$u" || true
done
echo "Готово"
