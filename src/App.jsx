import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Values from "./components/Values";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="flex flex-col items-stretch w-full">
      <Hero />
      <Intro />
      <Values />
      <Projects />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
