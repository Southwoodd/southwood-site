#!/usr/bin/env bash
# Настройка сервера под сайт и прием заявок. Можно запускать повторно.
set -euo pipefail
R=https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server
say() { echo; echo "== $*"; }

say "Программа приема заявок"
id southwood-lead >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin southwood-lead
mkdir -p /opt/southwood /var/www/southwood
curl -fsSL -o /opt/southwood/lead-server.mjs "$R/lead-server.mjs"
curl -fsSL -o /etc/systemd/system/southwood-lead.service "$R/southwood-lead.service"
systemctl daemon-reload
systemctl enable southwood-lead >/dev/null 2>&1
systemctl restart southwood-lead
sleep 2
echo "служба: $(systemctl is-active southwood-lead || true)"
echo "ответ:  $(curl -s 127.0.0.1:8787/health || echo 'нет ответа')"

say "Сайт new.southwood.pw"
if ! grep -qs "listen 443" /etc/nginx/sites-available/southwood-site; then
  curl -fsSL -o /etc/nginx/sites-available/southwood-site "$R/nginx-site.conf"
fi
ln -sf /etc/nginx/sites-available/southwood-site /etc/nginx/sites-enabled/southwood-site
[ -f /var/www/southwood/index.html ] || echo "Сайт еще не выложен" > /var/www/southwood/index.html

say "Адрес для заявок api.southwood.pw"
curl -fsSL -o /etc/nginx/snippets/southwood-api.conf "$R/nginx-api.conf"
F=$(grep -ls "server_name api.southwood.pw" /etc/nginx/sites-enabled/* | head -1 || true)
if [ -z "$F" ]; then
  echo "Не нашел конфиг api.southwood.pw. Пришлите вывод: ls /etc/nginx/sites-enabled/"
elif grep -q "southwood-api.conf" "$F"; then
  echo "уже подключено в $F"
else
  cp "$F" /root/nginx-api-backup.conf
  sed -i '/server_name api.southwood.pw;/a\    include snippets/southwood-api.conf;' "$F"
  echo "подключено в $F, копия прежнего конфига в /root/nginx-api-backup.conf"
fi
nginx -t && systemctl reload nginx
echo "снаружи: $(curl -s https://api.southwood.pw/health || echo 'нет ответа')"

say "Пользователь для выкладки"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy >/dev/null
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
chown -R deploy:deploy /var/www/southwood
if [ ! -f /home/deploy/.ssh/authorized_keys ]; then
  sudo -u deploy ssh-keygen -q -t ed25519 -f /home/deploy/.ssh/deploy -N ""
  sudo -u deploy sh -c 'cat ~/.ssh/deploy.pub > ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
  echo "ключ создан: /home/deploy/.ssh/deploy"
else
  echo "ключ уже был создан раньше"
fi

say "Готово"
