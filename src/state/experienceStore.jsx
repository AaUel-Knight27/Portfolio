import { createContext, useContext, useMemo, useState } from 'react'

const ExperienceContext = createContext(null)

export function ExperienceProvider({ children }) {
  const [phase, setPhase] = useState('outside') // outside | transition | inside
  const [muted, setMuted] = useState(false)
  const [activePanel, setActivePanel] = useState(null) // projects | about | skills | contact | project:<id>

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      muted,
      setMuted,
      activePanel,
      setActivePanel,
    }),
    [phase, muted, activePanel],
  )

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  )
}

export function useExperience() {
  const ctx = useContext(ExperienceContext)
  if (!ctx) throw new Error('useExperience must be used within ExperienceProvider')
  return ctx
}

