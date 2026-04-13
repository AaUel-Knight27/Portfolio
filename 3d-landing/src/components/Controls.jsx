import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'

export default function Controls() {
  const [autoRotate, setAutoRotate] = useState(true)

  const limits = useMemo(
    () => ({
      minDistance: 1.6,
      maxDistance: 8,
      minPolarAngle: Math.PI * 0.18,
      maxPolarAngle: Math.PI * 0.82,
    }),
    [],
  )

  useEffect(() => {
    const t = setTimeout(() => setAutoRotate(true), 5000)
    return () => clearTimeout(t)
  }, [autoRotate])

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.65}
      zoomSpeed={0.85}
      autoRotate={autoRotate}
      autoRotateSpeed={0.55}
      onStart={() => setAutoRotate(false)}
      onEnd={() => setAutoRotate(true)}
      {...limits}
    />
  )
}

