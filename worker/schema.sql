-- Таблицы для приема заявок. Заявки не хранятся: тут только очереди, счетчики блога и защита от повторов.
create table if not exists queue (
  id integer primary key autoincrement,
  kind text not null,   -- tg | mail
  body text not null,   -- сам элемент в JSON
  at integer not null
);
create index if not exists queue_kind on queue (kind, id);

create table if not exists stats (
  slug text primary key,
  read integer not null default 0,
  share integer not null default 0
);

-- Один посетитель не считается дважды. Живет сутки, адреса вычищает уборка.
create table if not exists seen (
  k text primary key,
  at integer not null
);
create index if not exists seen_at on seen (at);

-- Ограничение частоты отправки заявок с одного адреса.
create table if not exists hits (
  ip text not null,
  at integer not null
);
create index if not exists hits_at on hits (at);
