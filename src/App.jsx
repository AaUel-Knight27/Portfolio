import Experience from './components/3d/Experience.jsx'
import LoadingScreen from './components/ui/LoadingScreen.jsx'
import PortfolioOverlay from './components/ui/PortfolioOverlay.jsx'
import { ExperienceProvider } from './state/experienceStore.jsx'

function App() {
  return (
    <ExperienceProvider>
      <div className="relative h-dvh w-full overflow-hidden bg-black text-white">
        <Experience />
        <LoadingScreen />
        <PortfolioOverlay />
      </div>
    </ExperienceProvider>
  )
}

export default App
