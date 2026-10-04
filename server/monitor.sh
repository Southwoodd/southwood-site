#!/usr/bin/env bash
# Проверка сервера и обновление программы заявок. Ставится как /usr/local/bin/southwood-monitor.
#   check          проверить и написать в Telegram, если состояние изменилось
#   notify "текст" отправить сообщение
#   update         поставить новую версию программы заявок из папки выкладки
set -uo pipefail
ENVF=/etc/southwood/form.env
STATE=/var/lib/southwood/monitor
SRC=/home/deploy/incoming/lead-server.mjs
DST=/opt/southwood/lead-server.mjs
mkdir -p "$STATE"; chmod 700 "$STATE"
get() { grep -E "^$1=" "$ENVF" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '"\r' | sed "s/^'//;s/'\$//"; }
TOKEN=$(get TG_BOT_TOKEN); CHAT=$(get TG_CHAT_ID); BASES=$(get TG_API_BASES); BASES=${BASES:-https://api.telegram.org}

notify() {
  local b
  for b in ${BASES//,/ }; do
    curl -fsS -m 15 -o /dev/null "$b/bot$TOKEN/sendMessage" --data-urlencode "chat_id=$CHAT" --data-urlencode "text=$1" 2>/dev/null && return 0
  done
  return 1
}

health() { curl -fsS -m 5 127.0.0.1:8787/health 2>/dev/null; }

check() {
  local p=() h q prev code f end days use cur last
  systemctl is-active -q southwood-lead || p+=("служба заявок не запущена")
  if h=$(health); then
    q=$(echo "$h" | grep -o '"queue":[0-9]*' | cut -d: -f2); q=${q:-0}
    prev=$(cat "$STATE/queue" 2>/dev/null || echo 0)
    [ "$q" -gt 0 ] && [ "$prev" -gt 0 ] && p+=("заявки не уходят в Telegram, в очереди на сервере: $q")
    echo "$q" > "$STATE/queue"
  else
    p+=("программа заявок не отвечает")
  fi
  code=$(curl -s -o /dev/null -m 10 --resolve southwood.pw:443:127.0.0.1 -w '%{http_code}' https://southwood.pw/ 2>/dev/null)
  [ "$code" = 200 ] || p+=("сайт отвечает кодом ${code:-нет ответа}")
  for f in /etc/letsencrypt/live/*/fullchain.pem; do
    [ -f "$f" ] || continue
    end=$(openssl x509 -enddate -noout -in "$f" | cut -d= -f2)
    days=$(( ($(date -d "$end" +%s) - $(date +%s)) / 86400 ))
    [ "$days" -lt 14 ] && p+=("сертификат $(basename "$(dirname "$f")") истекает через $days дн.")
  done
  use=$(df --output=pcent / | tail -1 | tr -dc 0-9)
  [ "${use:-0}" -gt 90 ] && p+=("диск заполнен на $use%")

  cur=""; [ ${#p[@]} -gt 0 ] && cur=$(printf -- '- %s\n' "${p[@]}")
  last=$(cat "$STATE/last" 2>/dev/null || true)
  if [ "$cur" != "$last" ]; then
    if [ -z "$cur" ]; then notify "Сервер southwood.pw: все снова в порядке" && : > "$STATE/last"
    else notify "Сервер southwood.pw, проблема:
$cur" && printf '%s' "$cur" > "$STATE/last"; fi
  fi
  [ -z "$cur" ] && echo "все в порядке" || echo "$cur"
}

update() {
  [ -f "$SRC" ] || exit 0
  cmp -s "$SRC" "$DST" && exit 0
  if ! /usr/bin/node --check "$SRC" 2>/dev/null; then notify "Сервер southwood.pw: новая версия программы заявок с ошибкой, не поставил"; exit 1; fi
  cp -p "$DST" "$DST.prev"
  install -m 644 -o root -g root "$SRC" "$DST"
  systemctl restart southwood-lead; sleep 3
  if health >/dev/null; then
    echo "программа заявок обновлена"
  else
    cp -p "$DST.prev" "$DST"; systemctl restart southwood-lead
    notify "Сервер southwood.pw: новая версия программы заявок не запустилась, вернул прежнюю"
    exit 1
  fi
}

case "${1:-check}" in
  check) check ;;
  notify) notify "${2:-проверка}" && echo "отправлено" || { echo "не отправлено"; exit 1; } ;;
  update) update ;;
  *) echo "check | notify текст | update"; exit 2 ;;
esac
