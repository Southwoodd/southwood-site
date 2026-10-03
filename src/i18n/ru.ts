// Тексты русской версии. Неразрывные пробелы расставляет функция nb().
const SHORT = 'а|в|и|к|о|с|у|я|бы|во|да|до|же|за|из|ко|ли|на|не|ни|но|об|от|по|со|то|без|для|или|над|под|при|про|что|как';
const RE = new RegExp(`(^|[\\s\\u00A0(«])(${SHORT}) (?=\\S)`, 'gi');
export const nb = (s: string) => s.replace(RE, '$1$2 ').replace(RE, '$1$2 ');

export const site = {
  name: 'Сергей Воробьев',
  telegram: 'https://t.me/imsouthwood',
  email: 'im@southwood.pw',
  max: 'https://max.ru/u/f9LHodD0cOJ7naf5c_KfEsDC9D2un3u6ydG6fng2Y6wTeJ8qhIK4fSQP7IU',
  tenchat: 'https://tenchat.ru/imsouthwood',
  behance: 'https://www.behance.net/imsouthwood',
  vk: 'https://vk.com/imsouthwood',
};

export const nav = [
  { label: 'Кейсы', href: '#cases', hint: '6 работ с цифрами' },
  { label: 'Услуги', href: '#services', hint: 'Сайты, CRM, боты' },
  { label: 'Пакеты', href: '#packages', hint: 'от 160 тыс. ₽' },
  { label: 'Цены', href: '#pricing', hint: 'Расчет за 2 минуты' },
  { label: 'Как работаю', href: '#process', hint: 'Этапы и сроки' },
  { label: 'Вопросы-Ответы', href: '#faq', hint: '12 ответов до старта' },
];

export const header = {
  qatar: 'Инвестиции и регистрация компаний в Катаре',
  qatarShort: 'Бизнес в Катаре',
  qatarHint: 'Инвестиции и регистрация компаний',
  cta: 'Написать мне',
  ctaShort: 'Написать',
  menuTitle: 'Есть задача?',
  menuSub: 'Отвечаю сам, в течение часа',
};

export const hero = {
  badge: '9+ лет опыта · Full-Stack Product Designer',
  badgeShort: '9+ лет опыта · Product Designer',
  title: 'Сайт, CRM и боты под ключ без цены агентства',
  sub: [
    'Сайты, CRM, боты, автоматизация, дашборды и приложения для бизнеса и учреждений.',
    'Собираю в одну систему и веду после запуска.',
    'Цену видите сразу, сумму фиксирую в договоре, можно в рассрочку без банка.',
  ],
  primary: 'Рассчитать и сравнить цены',
  secondary: 'Бесплатная консультация',
  proof: 'Похожие задачи уже делал: консалтинг, кофейня, интернет-магазин, юрист, агроэкспорт. Живые ссылки в кейсах',
};

export const ticker = ['CRM', 'ERP', 'Mobile App iOS/Android', 'Bitrix', 'Mini App', 'Website', 'Web App', 'Bots', 'Product Design', 'API', 'SaaS'];

export const clients = {
  title: 'Работал над проектами для этих компаний',
  sub: 'За 9 лет в продуктовом дизайне и разработке. Тот же уровень делаю для компаний любого размера: от предпринимателя до завода.',
  logos: [
    { file: 'gazprom', name: 'Газпром', w: 107, h: 52 },
    { file: 'severstal', name: 'Северсталь', w: 134, h: 42 },
    { file: 'tinkoff', name: 'Тинькофф', w: 100, h: 56 },
    { file: 'invitro', name: 'Invitro', w: 176, h: 32 },
    { file: 'rivgauche', name: 'Рив Гош', w: 270, h: 110 },
    { file: 'booking', name: 'Booking.com', w: 180, h: 31 },
    { file: 'jnj', name: 'Johnson & Johnson', w: 169, h: 33 },
    { file: 'esteelauder', name: 'Estee Lauder', w: 180, h: 23 },
    { file: 'michelin', name: 'Michelin', w: 70, h: 70 },
    { file: 'natgeo', name: 'National Geographic', w: 137, h: 41 },
  ],
};

export const proofs = {
  badge: 'Proofs',
  lead: 'Один человек отвечает за всю цифровую часть.',
  text: ['Без цепочки подрядчиков', 'и согласований между отделами.', 'Я держу архитектуру, разработку, дизайн, запуск и поддержку.', 'Вы получаете рабочий инструмент,', 'а не набор разрозненных решений.'],
  stats: [
    { value: 13, prefix: '', suffix: ' млн ₽', text: 'Стоимость команд и агентств, которые заменил я для своих клиентов' },
    { value: 650, prefix: '', suffix: '+ часов', text: 'Работы команды клиента освободил за полгода одной CRM-сборкой' },
    { value: 100000, prefix: '', suffix: '+', text: 'Автоматических атак на сервера выявлено и заблокировано' },
    { value: 490, prefix: '', suffix: ' дней', text: 'Сэкономили клиенты, работая со мной, на сроках для запуска' },
  ],
};

export const start = {
  badge: 'Start',
  title: 'С чего можно начать работу',
  intro: 'Не обязательно собирать все сразу и платить всю сумму вперед. Выберите вход, соберу смету под него, оплата по этапам или в рассрочку.',
  cards: [
    { key: 'zero', title: 'С нуля', text: 'Нет бренда, сайта или воронки? Запускаю под ключ: от смысла и дизайна до первой заявки в CRM. Одна сборка вместо проекта с отделами и пересогласованиями.', href: '#packages', go: '', label: 'Смотреть пакеты' },
    { key: 'task', title: 'Одна задача', text: 'Лендинг, сайт на Битриксе, магазин, бот, CRM, редизайн или приложение. Беру отдельную задачу с фиксированной сметой и сроком, похожие уже делал.', href: '#pricing', go: 'calc', label: 'Посчитать задачу' },
    { key: 'team', title: 'В команду', text: 'Аутсорс на месяц вместо найма. Закрываю дизайн, сайт, приложение, CRM и автоматизацию как часть вашей команды, без поиска, онбординга и фонда оплаты труда.', href: '#pricing', go: 'team', label: 'Посчитать аутсорс' },
    { key: 'support', title: 'Сопровождение', text: 'Правки, рост и новые задачи после запуска. Сайт, CRM, воронки и боты работают как одна система, а за результат отвечает тот же человек, что их собрал.', href: '#pricing', go: 'support', label: 'Посчитать сопровождение' },
  ],
};

export const services = {
  badge: 'Services',
  intro: 'Полный цикл под ключ: от смысла и бренда до автоматизации и сопровождения. Четыре направления, каждое закрывает свою боль.',
  title: ['Какие услуги входят', 'в цифровую часть бизнеса'],
  cards: [
    { key: 'crm', wide: true, w: 998, title: 'Сайты, CRM и боты', text: 'Сайт, боты с AI-чатом в Telegram, VK и MAX, CRM Битрикс24 с воронкой. Заявки больше не теряются между каналами.', alt: 'Схема: сайт, мессенджеры, боты и AI-агенты передают заявки в CRM' },
    { key: 'docs', wide: false, w: 762, title: 'Документы и КП', text: 'Презентации, КП и бланки в одной системе. Данные подтягиваются из CRM.', alt: 'Коммерческое предложение собирается из CRM за час вместо недели' },
    { key: 'team', wide: false, w: 762, title: 'Команда и регламенты', text: 'Регламенты, инструкции, база знаний и AI-помощник для сотрудников.', alt: 'AI-помощник отвечает сотруднику по базе знаний компании' },
    { key: 'data', wide: true, w: 998, title: 'Цифры и отчеты', text: 'Дашборд и отчеты из CRM и учета, юнит-экономика, финмодель как инструмент управления.', alt: 'Дашборд собственника: выручка по месяцам и юнит-экономика' },
  ],
};

export const support = {
  badge: 'Accompaniment',
  text: 'Собираю все в одну систему и веду дальше. Один человек вместо продакта, дизайнера, аналитика и специалиста по автоматизации.',
  cta: 'Обсудить задачу',
};

export const footer = {
  desc: 'Сайты, CRM, боты, автоматизация, дашборды и приложения для бизнеса и учреждений. Собираю в одну систему и веду после запуска.',
  write: 'Написать мне',
  quote: 'Рассчитать стоимость',
  sections: 'Разделы',
  sectionLinks: [
    { label: 'Кейсы', href: '#cases' }, { label: 'Услуги', href: '#services' }, { label: 'Пакеты', href: '#packages' },
    { label: 'Цены и калькулятор', href: '#pricing' }, { label: 'Как работаю', href: '#process' }, { label: 'Вопросы-Ответы', href: '#faq' },
  ],
  contacts: 'Контакты',
  contactLinks: [
    { label: 'Telegram', hint: '@imsouthwood', href: 'https://t.me/imsouthwood' },
    { label: 'MAX', hint: 'Написать в MAX', href: site.max },
    { label: 'Почта', hint: 'im@southwood.pw', href: 'mailto:im@southwood.pw' },
    { label: 'TenChat', hint: 'Блог о работе', href: site.tenchat },
    { label: 'Behance', hint: 'Портфолио', href: site.behance },
    { label: 'VK', hint: 'imsouthwood', href: site.vk },
  ],
  also: 'Отдельно',
  alsoLinks: [
    { label: 'Бизнес в Катаре', hint: 'Инвестиции и регистрация компаний', href: '#qatar' },
    { label: 'MeetFlow', hint: 'Сервис для деловых созвонов', href: 'https://meetflow.host' },
  ],
  legal1: '© 2026 Воробьев Сергей Валентинович. Самозанятый. ИНН 301809508260',
  legal2: 'Работаю по договору, на каждую оплату выдаю чек. Цены на сайте не являются публичной офертой.',
  policy: 'Политика обработки данных',
  consent: 'Согласие на обработку данных',
  top: 'Наверх',
};
