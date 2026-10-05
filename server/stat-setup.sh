#!/usr/bin/env bash
# Открывает на сервере адрес счетчиков блога. Можно запускать повторно.
# Запуск: curl -fsSL https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server/stat-setup.sh | sudo bash
set -euo pipefail
R=https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server
cp /etc/nginx/snippets/southwood-api.conf /root/southwood-api.conf.bak
curl -fsSL -o /etc/nginx/snippets/southwood-api.conf "$R/nginx-api.conf"
if nginx -t; then systemctl reload nginx; else cp /root/southwood-api.conf.bak /etc/nginx/snippets/southwood-api.conf; echo "nginx не принял настройку, вернул прежнюю"; exit 1; fi
curl -fsSL -o /home/deploy/incoming/lead-server.mjs "$R/lead-server.mjs"; chown deploy:deploy /home/deploy/incoming/lead-server.mjs
sleep 8
echo "программа заявок обновлена: $(cmp -s /home/deploy/incoming/lead-server.mjs /opt/southwood/lead-server.mjs && echo да || echo нет)"
echo "заявки:   $(curl -s --max-time 5 --resolve api.southwood.pw:443:127.0.0.1 https://api.southwood.pw/health || echo нет ответа)"
echo "счетчики: $(curl -s --max-time 5 --resolve api.southwood.pw:443:127.0.0.1 'https://api.southwood.pw/stat?p=test' || echo нет ответа)"
