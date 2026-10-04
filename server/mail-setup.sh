#!/usr/bin/env bash
# Копии заявок и оповещений на почту. Спрашивает ящик и пароль приложения, в чат и в репозиторий они не попадают.
# Запуск: curl -fsSL https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server/mail-setup.sh -o /tmp/mail-setup.sh && sudo bash /tmp/mail-setup.sh
set -euo pipefail
R=https://raw.githubusercontent.com/Southwoodd/southwood-site/claude/site-v2/server
ENVF=/etc/southwood/form.env
[ -t 0 ] || exec </dev/tty
read -r -p "Ящик, с которого отправлять [im@southwood.pw]: " U; U=${U:-im@southwood.pw}
read -r -p "Куда присылать (через запятую) [$U]: " TO; TO=${TO:-$U}
read -r -p "Сервер отправки [smtp.mail.ru]: " H; H=${H:-smtp.mail.ru}
read -r -s -p "Пароль для внешних приложений (не виден при вводе): " P; echo
[ -n "$P" ] || { echo "Пароль пустой, ничего не менял"; exit 1; }
cp -p "$ENVF" "$ENVF.bak"
grep -vE '^(SMTP_HOST|SMTP_PORT|SMTP_USER|SMTP_PASS|MAIL_TO)=' "$ENVF.bak" > "$ENVF" || true
printf 'SMTP_HOST=%s\nSMTP_PORT=465\nSMTP_USER=%s\nSMTP_PASS=%s\nMAIL_TO=%s\n' "$H" "$U" "$P" "${TO// /}" >> "$ENVF"
chmod 600 "$ENVF"; rm -f "$ENVF.bak"

curl -fsSL -o /usr/local/bin/southwood-monitor "$R/monitor.sh"; chmod 755 /usr/local/bin/southwood-monitor
echo; echo "== Проверка каналов"
/usr/local/bin/southwood-monitor test || true

echo; echo "== Программа заявок"
curl -fsSL -o /home/deploy/incoming/lead-server.mjs "$R/lead-server.mjs"; chown deploy:deploy /home/deploy/incoming/lead-server.mjs
sleep 6
systemctl restart southwood-lead; sleep 2
echo "служба: $(systemctl is-active southwood-lead || true), ответ: $(curl -s -m 5 127.0.0.1:8787/health || echo нет)"
echo "версия совпадает с репозиторием: $(cmp -s /home/deploy/incoming/lead-server.mjs /opt/southwood/lead-server.mjs && echo да || echo нет)"
echo 'В ответе mail:0 значит, что почта включена. mail:-1 значит, что выключена.'
rm -f /tmp/mail-setup.sh
