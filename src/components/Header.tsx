import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { content } from '../data/content.js';
import ScrambleLink from './ScrambleLink';
import './Header.css';

function resolveNavHref(href: string, pathname: string) {
  if (!href.startsWith('#')) return href;
  return pathname === '/' ? href : `/${href}`;
}

export default function Header() {
  const { brand, name, nav, telegramLabel, telegramHref } = content.header;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link
          className="header__brand"
          to="/"
          aria-label={`${brand}, ${name}`}
        >
          <span className="header__logo">{brand}</span>
          <span className="label header__name">{name}</span>
        </Link>

        <nav className="header__nav" aria-label="Основная навигация">
          {nav.map((item) => (
            <ScrambleLink
              key={item.href}
              className="header__link"
              to={resolveNavHref(item.href, pathname)}
            >
              {item.label}
            </ScrambleLink>
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

      <div className="header__mobile" id="mobile-menu" hidden={!open}>
        <nav className="header__mobile-nav" aria-label="Мобильная навигация">
          {nav.map((item) => (
            <ScrambleLink
              key={item.href}
              className="header__mobile-link"
              to={resolveNavHref(item.href, pathname)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </ScrambleLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
