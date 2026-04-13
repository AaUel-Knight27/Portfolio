import { Canvas } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  Environment,
  Preload,
} from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import Controls from './Controls.jsx'
import Lights from './Lights.jsx'
import Model from './Model.jsx'

export default function CanvasScene() {
  const glConfig = useMemo(
    () => ({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.05,
      outputColorSpace: THREE.SRGBColorSpace,
    }),
    [],
  )

  return (
    <Canvas
      className="absolute inset-0"
      shadows
      dpr={[1, 2]}
      camera={{ position: [2.4, 1.35, 3.2], fov: 42, near: 0.1, far: 100 }}
      gl={glConfig}
    >
      <color attach="background" args={['#050507']} />

      <Suspense fallback={null}>
        <Environment preset="city" background={false} />
        <Lights />
        <Controls />

        <group position={[0, -0.05, 0]}>
          <Model url="/model.glb" />
          <ContactShadows
            position={[0, -0.06, 0]}
            opacity={0.55}
            scale={10}
            blur={2.2}
            far={4.5}
          />
        </group>

        <Preload all />
      </Suspense>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  )
}

