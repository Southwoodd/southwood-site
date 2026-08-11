import { Link } from 'react-router-dom';
import { content } from '../data/content.js';
import './Footer.css';

export default function Footer() {
  const {
    name,
    site,
    tenchat,
    telegram,
    telegramHandle,
    email,
    reqs,
    year,
    privacyLabel,
    privacyHref,
  } = content.footer;

  return (
    <footer className="site-footer" aria-label="Подвал">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__name">{name}</p>
          <p className="site-footer__site">{site}</p>
        </div>

        <nav className="site-footer__links" aria-label="Контакты">
          <a href={telegram} target="_blank" rel="noopener noreferrer">
            {telegramHandle}
          </a>
          <a href={tenchat} target="_blank" rel="noopener noreferrer">
            TenChat
          </a>
          <a href={`mailto:${email}`}>{email}</a>
          <Link to={privacyHref}>{privacyLabel}</Link>
        </nav>

        <div className="site-footer__meta">
          <p className="site-footer__reqs">{reqs}</p>
          <p className="site-footer__copy">© {year}</p>
        </div>
      </div>
    </footer>
  );
}
