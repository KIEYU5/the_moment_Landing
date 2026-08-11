import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Values from "./components/Values";
import Projects from "./components/Projects";
import Awards from "./components/Awards";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="flex flex-col items-stretch w-full">
      <Hero />
      <Intro />
      <Values />
      <Projects />
      <Awards />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
