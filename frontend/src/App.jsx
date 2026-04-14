import Navbar from './sections/Navbar'
import Hero from './sections/Hero'
import HowItWorks from './sections/HowItWorks'
import Analyzer from './sections/Analyzer'
import UseCases from './sections/UseCases'
import ModelInfo from './sections/ModelInfo'
import Disclaimer from './sections/Disclaimer'
import FAQ from './sections/FAQ'
import Footer from './sections/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Analyzer />
        <UseCases />
        <ModelInfo />
        <Disclaimer />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
