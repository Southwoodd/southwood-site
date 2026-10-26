#!/usr/bin/env bash
# Второй этап переезда на Beget: сертификаты и переадресация www.
# Запускать ТОЛЬКО после того, как southwood.pw уже указывает на этот сервер,
# иначе Let's Encrypt не сможет подтвердить домен и выпуск сорвется.
#
# Запуск на сервере от root:  bash beget-certs.sh ваша@почта
set -euo pipefail
MAIL=${1:-}
[ "$(id -u)" = 0 ] || { echo "Нужен root"; exit 1; }
[ -n "$MAIL" ] || { echo "Укажите почту для Let's Encrypt: bash beget-certs.sh вы@почта"; exit 1; }
say() { echo; echo "== $*"; }

say "Проверяю, что домены уже смотрят сюда"
IP=$(curl -s --max-time 5 ifconfig.me)
echo "адрес этого сервера: $IP"
BAD=0
for d in southwood.pw www.southwood.pw; do
  GOT=$(getent hosts "$d" | awk '{print $1}' | head -1)
  if [ "$GOT" = "$IP" ]; then echo "  $d -> $GOT  ок"
  else echo "  $d -> ${GOT:-нет записи}  ЕЩЕ НЕ СЮДА"; BAD=1; fi
done
if [ "$BAD" = 1 ]; then
  echo
  echo "Домен пока не переключен. Сначала в Cloudflare: серое облако и A-запись на $IP."
  echo "Выпуск сертификата прерван, ничего не изменено."
  exit 1
fi

say "Сертификат"
certbot --nginx -d southwood.pw -d www.southwood.pw \
        --non-interactive --agree-tos -m "$MAIL" --redirect

say "Переадресация www на основной адрес"
F=/etc/nginx/sites-available/southwood-site
if grep -q "www-redirect" "$F"; then
  echo "уже настроено"
else
  BAK="$F.bak-$(date +%s)"; cp "$F" "$BAK"
  # с http сразу на основной адрес, без промежуточного шага через www
  sed -i 's#return 301 https://\$host\$request_uri;#return 301 https://southwood.pw$request_uri;#' "$F"
  # в каждом блоке сайта: если пришли на www, уводим на основной
  sed -i '/server_name southwood\.pw www\.southwood\.pw;/a\    if ($host = www.southwood.pw) { return 301 https://southwood.pw$request_uri; } # www-redirect' "$F"
  if ! nginx -t; then cp "$BAK" "$F"; echo "Ошибка в конфиге, вернул как было"; exit 1; fi
  systemctl reload nginx
  echo "готово, копия прежнего конфига: $BAK"
fi

say "Автопродление"
systemctl enable certbot.timer >/dev/null 2>&1 || true
systemctl start  certbot.timer >/dev/null 2>&1 || true
certbot renew --dry-run >/dev/null 2>&1 && echo "продление работает" || echo "проверьте продление вручную: certbot renew --dry-run"

say "Проверка"
sleep 1
for u in https://southwood.pw/ https://www.southwood.pw/ http://southwood.pw/ http://www.southwood.pw/; do
  curl -s -o /dev/null -m 10 -w "$u -> %{http_code} %{redirect_url}\n" "$u" || true
done
echo
echo "Готово. Сертификат выпущен, www уводит на основной адрес."
