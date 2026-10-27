# Записи DNS для переезда с Cloudflare

Собрано с живых серверов имён 27 октября 2026 года. Значения полные — на скриншотах
панели длинные записи обрезаются, и при переносе вручную это ломает почту.

Сервер: **159.194.198.134**

## Зачем переезжаем

Серверы имён домена (`vicente.ns.cloudflare.com`, `laura.ns.cloudflare.com`) стоят на
диапазоне Cloudflare `108.162.192.0/18`. Трафик сайта мы с Cloudflare увели, но на вопрос
«какой адрес у southwood.pw» по-прежнему отвечает он. У провайдеров, которые режут эти
диапазоны, ломается не загрузка страницы, а разрешение имени: по адресу сайт открывается,
по имени нет.

## Порядок, чтобы не прервать почту

1. Завести зону у нового провайдера DNS и создать там **все** записи из списка ниже.
2. Убедиться, что новые серверы имён уже отвечают на запросы по домену.
3. И только потом сменить NS у регистратора.

Почта живёт на MX и TXT. Если перенести их заранее, смена NS пройдет незаметно.

## southwood.pw

| Тип | Имя | Значение | Примечание |
|---|---|---|---|
| A | `@` | `159.194.198.134` | сайт |
| A | `www` | `159.194.198.134` | переадресацию на основной адрес делает nginx |
| A | `api` | `159.194.198.134` | прием заявок |
| MX | `@` | `emx.mail.ru` приоритет `10` | почта VK WorkSpace |
| TXT | `@` | `v=spf1 redirect=_spf.mail.ru` | разрешение на отправку |
| TXT | `@` | `google-site-verification=dZxMtBNCb0YoEEu2Z195ZdCo-N73gTFAdtG2HtmUF4g` | |
| TXT | `@` | `pinterest-site-verification=bfc89d2a673c5d0e9b21db66e88ee777` | |
| TXT | `@` | `lava-verify=22333945389295a1` | |
| TXT | `_discord` | `dh=a9bc68995452ef2fb2b001798ef0768ef6e37819` | |
| TXT | `mailru._domainkey` | см. ниже, DKIM | подпись писем |

DKIM для `mailru._domainkey.southwood.pw` одной строкой:

```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlrhQG1zf8Rbr3Ma3NKE8QnLVvdohLGH1q9X3NAtIkovUAyN2ltLvt9TbE8hzsrk5oYFK9TG9AR3dTedHNNbk8rheLCqMMvKD4EiAglIItXHmhZ+7DvRS13zwf8e6uwCVN9tkm01WqUDuYPnDktZiIuu1kFDxInq35YC/Kl3wCtwIDAQAB
```

## l4mber.fun

| Тип | Имя | Значение | Примечание |
|---|---|---|---|
| A | `donate` | `159.194.198.134` | прием донатов Tribute |
| MX | `@` | `emx.mail.ru` приоритет `10` | почта |
| TXT | `@` | `v=spf1 redirect=_spf.mail.ru` | |
| TXT | `@` | `mailru-domain: BgUOwFNqdfSU03UP` | подтверждение домена |
| TXT | `mailru._domainkey` | см. ниже, DKIM | |

DKIM для `mailru._domainkey.l4mber.fun` одной строкой:

```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIH+D3PWWXOmLJlTaxVB1mttakQeHeAaEseqWvFkXoEZzbYQb/XSL90AVEn0BSU05ZZn8+FZSGUvagfiHNtmWV72mp6sj8Bzc3JMnTfag6Vtdergx88GHXn+ZiIHTyiGguH2C4PyXOMrht7PdNRKbVwyGz0UOeIR+FSx0XInfh2QIDAQAB
```

### Что переносить не нужно

- `www.l4mber.fun` — указывает на прокси Cloudflare (`188.114.96.1`, `188.114.97.1`),
  а сервер за прокси не отвечает: сайт отдает ошибку 521. Создавать заново имеет смысл,
  только когда появится новый сайт.
- `support.l4mber.fun` — тоже за прокси, а в самой зоне Cloudflare за ним `192.0.2.1`:
  зарезервированный адрес из стандарта, предназначенный для примеров в документации.
  Реального сервера там нет и быть не может.
- У корня `l4mber.fun` A-записи нет совсем, только MX и TXT. Отдельно заводить корень
  не нужно: почте хватает MX, имя для нее заводить не требуется.

### Чего нет ни у одного домена

Записи DMARC. Она говорит почтовым службам, что делать с письмами, не прошедшими проверку.
Для переезда не нужна, но добавить ее стоит отдельно - это заметно улучшает доставляемость.
