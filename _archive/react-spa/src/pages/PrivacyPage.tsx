import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { content } from '../data/content.js';
import './LegalPage.css';

export default function PrivacyPage() {
  const { privacyTitle, updated, sections } = content.legal;

  useEffect(() => {
    const prev = document.title;
    document.title = `${privacyTitle} — Southwood`;
    return () => {
      document.title = prev;
    };
  }, [privacyTitle]);

  return (
    <>
      <Header />
      <main className="legal-page">
        <article className="container legal-page__inner">
          <p className="legal-page__back">
            <Link to="/">На главную</Link>
          </p>
          <h1 className="legal-page__title">{privacyTitle}</h1>
          <p className="legal-page__updated">Редакция от {updated}</p>

          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="legal-block"
              aria-labelledby={`legal-${section.id}`}
            >
              <h2 id={`legal-${section.id}`} className="legal-block__title">
                {section.title}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={`${section.id}-${i}`} className="legal-block__text">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
