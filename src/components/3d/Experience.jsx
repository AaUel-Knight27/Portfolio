import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, KeyboardControls, Preload, ScrollControls, useScroll } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import OutsideScene from '../../scenes/OutsideScene.jsx'
import InsideScene from '../../scenes/InsideScene.jsx'
import { useExperience } from '../../state/experienceStore.jsx'

function ExperienceCanvas() {
  const transition = useRef(0) // 0 = outside, 1 = inside

  const glConfig = useMemo(
    () => ({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    }),
    [],
  )

  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
        { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
        { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
        { name: 'right', keys: ['KeyD', 'ArrowRight'] },
        { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
      ]}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={glConfig}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          // Match glTF viewer style controls (Linear + strong negative exposure curve).
          gl.toneMapping = THREE.LinearToneMapping
          gl.toneMappingExposure = 2 ** -9
          gl.physicallyCorrectLights = true
        }}
        camera={{ position: [0, 1.65, 8], fov: 62, near: 0.05, far: 160 }}
        className="absolute inset-0"
      >
        <ScrollControls pages={2} damping={0.25} distance={1}>
          <CinematicGrade />
          <Suspense fallback={null}>
            <OutsideScene transition={transition} />
            <InsideScene transition={transition} />
            <Preload all />
          </Suspense>
        </ScrollControls>

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.08}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.9}
          />
          <Vignette offset={0.22} darkness={0.82} eskil={false} />
        </EffectComposer>

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </KeyboardControls>
  )
}

export default function Experience() {
  return (
    <>
      <ExperienceCanvas />
      <HUD />
    </>
  )
}

function HUD() {
  const { phase, setMuted, muted } = useExperience()

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="pointer-events-auto absolute left-4 top-4 flex items-center gap-2">
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/15">
          {phase === 'outside' ? 'Outside' : phase === 'transition' ? 'Entering' : 'Inside'}
        </div>
        <button
          onClick={() => setMuted(!muted)}
          className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/15"
        >
          {muted ? 'Sound: Off' : 'Sound: On'}
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 w-[min(680px,92vw)] -translate-x-1/2">
        <div className="rounded-2xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
            <div className="font-semibold text-white/80">WASD to move • Shift to sprint</div>
            <div className="text-white/60">Approach the gate to enter the portfolio</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CinematicGrade() {
  const scroll = useScroll()
  const { gl, scene } = useThree()
  const { phase } = useExperience()

  useFrame(() => {
    if (phase !== 'outside') return
    const s = THREE.MathUtils.clamp(scroll?.offset ?? 0, 0, 1)
    const reveal = THREE.MathUtils.smootherstep(s, 0.0, 1.0)

    // Use the same scale as the viewer screenshot: "exposure -9" at load.
    // Viewer exposure behaves like a stop-based control, so approximate with \(2^{stops}\).
    // -9 stops => 2^-9 (very dark). Ease toward -2 stops by the end of the scroll intro.
    const stops = THREE.MathUtils.lerp(-9, -2, reveal)
    gl.toneMapping = THREE.LinearToneMapping
    gl.toneMappingExposure = 2 ** stops

    // Match viewer bgColor.
    scene.background = new THREE.Color('#191919')
  })

  return null
}

