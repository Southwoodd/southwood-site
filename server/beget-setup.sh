#!/usr/bin/env bash
# Первый этап переезда на Beget: поднять сервер и проверить его по IP,
# пока домен еще смотрит на Cloudflare. Сертификаты не трогаем - для них
# нужен уже переключенный DNS, этим занимается beget-certs.sh вторым этапом.
#
# Запуск на сервере от root, из папки с остальными файлами server/:
#   bash beget-setup.sh
#
# Можно запускать повторно: ничего уже сделанного не ломает.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
say() { echo; echo "== $*"; }

[ "$(id -u)" = 0 ] || { echo "Нужен root"; exit 1; }
for f in lead-server.mjs southwood-lead.service nginx-security.conf; do
  [ -f "$HERE/$f" ] || { echo "Рядом со скриптом нет файла $f - скопируйте всю папку server/"; exit 1; }
done

say "Пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx rsync curl ufw >/dev/null
# Node из репозитория Ubuntu 24.04 - версия 18, приемщику заявок ее мало
if ! command -v node >/dev/null || [ "$(node -v | sed 's/v\([0-9]*\).*/\1/')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs >/dev/null
fi
echo "nginx:  $(nginx -v 2>&1)"
echo "node:   $(node -v)"

say "Папки и пользователи"
id southwood-lead >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin southwood-lead
id deploy         >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy >/dev/null
mkdir -p /opt/southwood /var/www/southwood /etc/southwood /etc/nginx/snippets
chown -R deploy:deploy /var/www/southwood

say "Приемщик заявок"
install -m 644 "$HERE/lead-server.mjs" /opt/southwood/lead-server.mjs
install -m 644 "$HERE/southwood-lead.service" /etc/systemd/system/southwood-lead.service
if [ ! -f /etc/southwood/form.env ]; then
  # Заготовка без значений: ключи вписывает владелец сервера, не скрипт
  cat > /etc/southwood/form.env <<'ENV'
TG_BOT_TOKEN=
TG_CHAT_ID=
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
MAIL_TO=
ALLOWED_ORIGINS=https://southwood.pw,https://www.southwood.pw
ENV
  chmod 600 /etc/southwood/form.env
  echo "создан шаблон /etc/southwood/form.env - заполните его своими ключами"
else
  echo "/etc/southwood/form.env уже есть, не трогаю"
fi
systemctl daemon-reload
systemctl enable southwood-lead >/dev/null 2>&1 || true
systemctl restart southwood-lead || true
sleep 2
echo "служба: $(systemctl is-active southwood-lead || true)"
echo "ответ:  $(curl -s --max-time 5 127.0.0.1:8787/health || echo 'нет ответа - проверьте form.env')"

say "nginx: сайт"
install -m 644 "$HERE/nginx-security.conf" /etc/nginx/snippets/southwood-security.conf
install -m 644 "$HERE/nginx-api.conf" /etc/nginx/snippets/southwood-api.conf
rm -f /etc/nginx/sites-enabled/default
# Пока только порт 80. Блок для 443 допишет certbot на втором этапе.
cat > /etc/nginx/sites-available/southwood-site <<'CONF'
# Сайт southwood.pw. Блок 443 добавляет certbot - см. beget-certs.sh
server {
    listen 80 default_server;
    server_name southwood.pw www.southwood.pw;
    root /var/www/southwood;
    index index.html;
    error_page 404 /404.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml font/ttf;

    location /_astro/ { include snippets/southwood-security.conf; add_header Cache-Control "public, max-age=31536000, immutable"; }
    location ~* \.(woff2|ttf|webp|svg|png|ico)$ { include snippets/southwood-security.conf; add_header Cache-Control "public, max-age=2592000"; }
    location / { try_files $uri $uri/ $uri.html =404; include snippets/southwood-security.conf; add_header Cache-Control "no-cache"; }
}

server {
    listen 80;
    server_name api.southwood.pw;
    include snippets/southwood-api.conf;
}
CONF
ln -sf /etc/nginx/sites-available/southwood-site /etc/nginx/sites-enabled/southwood-site
[ -f /var/www/southwood/index.html ] || echo "Сайт еще не выложен" > /var/www/southwood/index.html
nginx -t
systemctl reload nginx

say "Ключ для выкладки с GitHub"
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
if [ ! -f /home/deploy/.ssh/authorized_keys ]; then
  sudo -u deploy ssh-keygen -q -t ed25519 -f /home/deploy/.ssh/deploy -N ""
  sudo -u deploy sh -c 'cat ~/.ssh/deploy.pub > ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
  echo "ключ создан"
else
  echo "ключ уже был создан раньше"
fi

say "Сеть"
ufw allow 22/tcp  >/dev/null 2>&1 || true
ufw allow 80/tcp  >/dev/null 2>&1 || true
ufw allow 443/tcp >/dev/null 2>&1 || true
yes | ufw enable  >/dev/null 2>&1 || true

say "Готово. Что дальше"
IP=$(curl -s --max-time 5 ifconfig.me || echo "ваш_IP")
cat <<NEXT
Сервер поднят, домен пока не тронут - сайт продолжает работать как работал.

1. Заполните ключами:   nano /etc/southwood/form.env
   затем:               systemctl restart southwood-lead

2. Закрытый ключ для GitHub (покажите только себе):
       cat /home/deploy/.ssh/deploy
   В GitHub -> Settings -> Secrets -> Actions добавьте:
       DEPLOY_SSH_KEY  = содержимое файла целиком
       DEPLOY_HOST     = $IP

3. Запустите выкладку Deploy to own server вручную,
   после чего сайт можно проверить по адресу сервера:
       curl -s -o /dev/null -w "%{http_code}\n" --resolve southwood.pw:80:$IP http://southwood.pw/

4. Только когда проверка прошла - переключаем DNS и запускаем beget-certs.sh
NEXT
