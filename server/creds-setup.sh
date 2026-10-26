#!/usr/bin/env bash
# Ключи для приема заявок: Telegram и почта. Спрашивает значения с клавиатуры -
# в переписку, в репозиторий и в вывод команд они не попадают.
#
# Запуск на сервере от root:  bash creds-setup.sh
#
# Отличие от прежнего mail-setup.sh: ничего не качает с raw.githubusercontent.com
# (этот диапазон GitHub фильтруется) и настраивает сразу оба канала.
set -euo pipefail
ENVF=/etc/southwood/form.env
[ "$(id -u)" = 0 ] || { echo "Нужен root"; exit 1; }
[ -t 0 ] || exec </dev/tty
mkdir -p /etc/southwood
touch "$ENVF"; chmod 600 "$ENVF"

# Достает текущее значение, чтобы показать его как вариант по умолчанию
cur() { grep -E "^$1=" "$ENVF" 2>/dev/null | head -1 | cut -d= -f2- || true; }
# Переписывает одну строку, не трогая остальные
put() {
  local k=$1 v=$2 tmp
  tmp=$(mktemp); grep -vE "^$k=" "$ENVF" > "$tmp" || true
  printf '%s=%s\n' "$k" "$v" >> "$tmp"
  cat "$tmp" > "$ENVF"; rm -f "$tmp"
}

echo "== Telegram"
echo "Пустой ввод оставит прежнее значение."
read -r -s -p "Токен бота (не виден при вводе): " T; echo
[ -n "$T" ] && put TG_BOT_TOKEN "$T" || echo "  токен оставлен прежним"
C=$(cur TG_CHAT_ID)
read -r -p "ID чата${C:+ [$C]}: " N; N=${N:-$C}
[ -n "$N" ] && put TG_CHAT_ID "$N"

echo
echo "== Почта"
U=$(cur SMTP_USER); U=${U:-im@southwood.pw}
read -r -p "Ящик, с которого отправлять [$U]: " X; U=${X:-$U}
TO=$(cur MAIL_TO); TO=${TO:-$U}
read -r -p "Куда присылать (через запятую) [$TO]: " X; TO=${X:-$TO}
H=$(cur SMTP_HOST); H=${H:-smtp.mail.ru}
read -r -p "Сервер отправки [$H]: " X; H=${X:-$H}
read -r -s -p "Пароль для внешних приложений (не виден при вводе): " P; echo
put SMTP_HOST "$H"; put SMTP_PORT 465; put SMTP_USER "$U"; put MAIL_TO "${TO// /}"
[ -n "$P" ] && put SMTP_PASS "$P" || echo "  пароль оставлен прежним"

# Сайт обращается к приемщику с этих адресов, иначе браузер не пропустит запрос
[ -n "$(cur ALLOWED_ORIGINS)" ] || put ALLOWED_ORIGINS "https://southwood.pw,https://www.southwood.pw"
chmod 600 "$ENVF"

echo
echo "== Записано (значения скрыты)"
sed 's/=.*/= задано/' "$ENVF" | sed 's/= задано$/ = задано/'

echo
echo "== Перезапуск"
systemctl restart southwood-lead
sleep 2
echo "служба: $(systemctl is-active southwood-lead || true)"
echo "ответ:  $(curl -s -m 5 127.0.0.1:8787/health || echo 'нет ответа')"
echo
echo 'В ответе mail:0 значит, что почта включена. mail:-1 - что выключена.'
