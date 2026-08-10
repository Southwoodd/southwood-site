import Header from './components/Header';
import Hero from './components/Hero';
import Recognition from './components/Recognition';
import Zones from './components/Zones';
import Cases from './components/Cases';
import Pricing from './components/Pricing';
import Compare from './components/Compare';
import About from './components/About';
import Boundaries from './components/Boundaries';
import Faq from './components/Faq';
import FinalCta from './components/FinalCta';
import Footer from './components/Footer';

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
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
