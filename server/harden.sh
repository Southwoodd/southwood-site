#!/usr/bin/env bash
# Заголовки безопасности, оповещение о сбоях, автообновление программы заявок. Можно запускать повторно.
# Запуск: curl -fsSL https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server/harden.sh | sudo bash
set -euo pipefail
R=https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server
say() { echo; echo "== $*"; }

say "Заголовки безопасности"
F=/etc/nginx/sites-available/southwood-site
curl -fsSL -o /etc/nginx/snippets/southwood-security.conf "$R/nginx-security.conf"
nginx -T 2>/dev/null | grep -qE "^\s*server_tokens" || echo "server_tokens off;" > /etc/nginx/conf.d/southwood-tokens.conf
if grep -q "southwood-security.conf" "$F"; then
  echo "уже подключены"
else
  BAK="$F.bak-$(date +%s)"; cp "$F" "$BAK"
  sed -i 's#add_header Cache-Control#include snippets/southwood-security.conf; add_header Cache-Control#g' "$F"
  sed -i '/server_name southwood\.pw www\.southwood\.pw;/a\    include snippets/southwood-security.conf;' "$F"
fi
if ! nginx -t; then
  [ -n "${BAK:-}" ] && cp "$BAK" "$F"; rm -f /etc/nginx/conf.d/southwood-tokens.conf
  echo "Ошибка в конфиге, вернул как было. Пришлите вывод выше."; exit 1
fi
systemctl reload nginx; sleep 1
curl -sI -m 10 --resolve southwood.pw:443:127.0.0.1 https://southwood.pw/ | grep -iE "^(strict-transport|x-content-type|referrer-policy|permissions-policy|content-security|server):" || echo "заголовки не видны"

say "Проверка сервера каждые 5 минут"
curl -fsSL -o /usr/local/bin/southwood-monitor "$R/monitor.sh"; chmod 755 /usr/local/bin/southwood-monitor
cat > /etc/systemd/system/southwood-monitor.service <<'U'
[Unit]
Description=Southwood server check
[Service]
Type=oneshot
ExecStart=/usr/local/bin/southwood-monitor check
U
cat > /etc/systemd/system/southwood-monitor.timer <<'U'
[Unit]
Description=Southwood server check every 5 minutes
[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
[Install]
WantedBy=timers.target
U

say "Автообновление программы заявок"
install -d -m 755 -o deploy -g deploy /home/deploy/incoming
cat > /etc/systemd/system/southwood-update.service <<'U'
[Unit]
Description=Southwood lead receiver update
[Service]
Type=oneshot
ExecStart=/usr/local/bin/southwood-monitor update
U
cat > /etc/systemd/system/southwood-update.path <<'U'
[Unit]
Description=Watch for a new lead receiver version
[Path]
PathChanged=/home/deploy/incoming
Unit=southwood-update.service
[Install]
WantedBy=multi-user.target
U
systemctl daemon-reload
systemctl enable --now southwood-monitor.timer southwood-update.path >/dev/null 2>&1
curl -fsSL -o /home/deploy/incoming/lead-server.mjs "$R/lead-server.mjs"; chown deploy:deploy /home/deploy/incoming/lead-server.mjs
sleep 6
echo "служба заявок: $(systemctl is-active southwood-lead || true), ответ: $(curl -s -m 5 127.0.0.1:8787/health || echo нет)"
echo "версия на сервере совпадает с репозиторием: $(cmp -s /home/deploy/incoming/lead-server.mjs /opt/southwood/lead-server.mjs && echo да || echo нет)"

say "Проверка"
echo "состояние: $(/usr/local/bin/southwood-monitor check)"
echo "сообщение в Telegram: $(/usr/local/bin/southwood-monitor notify 'Сервер southwood.pw: оповещения о сбоях включены' || true)"
systemctl list-timers southwood-monitor.timer --no-pager | sed -n 1,2p
say "Готово"
