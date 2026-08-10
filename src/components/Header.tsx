import { useEffect, useState } from 'react';
import { content } from '../data/content.js';
import './Header.css';

export default function Header() {
  const { brand, name, nav, telegramLabel, telegramHref } = content.header;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  return (
    <header className="header">
      <div className="container header__inner">
        <a className="header__brand" href="#top" aria-label={`${brand}, ${name}`}>
          <span className="header__logo">{brand}</span>
          <span className="label header__name">{name}</span>
        </a>

        <nav className="header__nav" aria-label="Основная навигация">
          {nav.map((item) => (
            <a key={item.href} className="header__link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <a
            className="btn btn--ghost header__tg"
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {telegramLabel}
          </a>

          <button
            className="header__burger"
            type="button"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className="header__mobile"
        id="mobile-menu"
        hidden={!open}
      >
        <nav className="header__mobile-nav" aria-label="Мобильная навигация">
          {nav.map((item) => (
            <a
              key={item.href}
              className="header__mobile-link"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
