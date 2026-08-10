import Header from './components/Header';
import Hero from './components/Hero';
import Recognition from './components/Recognition';
import Zones from './components/Zones';
import Cases from './components/Cases';
import Pricing from './components/Pricing';
import Compare from './components/Compare';
import About from './components/About';
import Boundaries from './components/Boundaries';
import FinalCta from './components/FinalCta';
import StubSection from './components/StubSection';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Recognition />
        <Zones />
        <Cases />
        <Pricing />
        <Compare />
        <About />
        <Boundaries />
        <StubSection id="faq" label="FAQ — следующий экран" />
        <FinalCta />
      </main>
      <footer className="section" aria-label="Подвал">
        <div className="container stub">Footer — следующий экран</div>
      </footer>
    </>
  );
}
