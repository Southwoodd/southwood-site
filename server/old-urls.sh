#!/usr/bin/env bash
# Старые адреса /cases/* и /en/ уводим на новые страницы одним шагом (301), чтобы Google убрал 404 из индекса.
# Запуск: curl -fsSL https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server/old-urls.sh | sudo bash
set -euo pipefail
F=/etc/nginx/sites-available/southwood-site
if grep -q "old-urls" "$F"; then echo "Уже настроено"; exit 0; fi
BAK="$F.bak-$(date +%s)"; cp "$F" "$BAK"
sed -i '/error_page 404 \/404.html;/a\    rewrite ^/cases/?$ /kejsy/ permanent; rewrite ^/cases/([^/]+)/?$ /kejsy/$1/ permanent; rewrite ^/en(/.*)?$ / permanent; # old-urls' "$F"
if ! nginx -t; then cp "$BAK" "$F"; echo "Ошибка в конфиге, вернул как было"; exit 1; fi
systemctl reload nginx
sleep 1
for u in /cases/meetflow/ /cases/alfa-elite /cases/mono-coffee/ /en/ /kejsy/; do
  curl -sk -o /dev/null -m 10 --resolve southwood.pw:443:127.0.0.1 -w "$u -> %{http_code} %{redirect_url}\n" "https://southwood.pw$u" || true
done
echo "Готово"
