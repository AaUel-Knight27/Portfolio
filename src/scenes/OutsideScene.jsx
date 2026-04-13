import {
  Sparkles,
  Environment,
  useGLTF,
  useKeyboardControls,
  useScroll,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import useAudio from '../hooks/useAudio.js'
import { useExperience } from '../state/experienceStore.jsx'

const GATE_Z = 0.2

function WetGround({ transition }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0b0d14'),
        roughness: 0.08,
        metalness: 0.2,
      }),
    [],
  )

  useFrame(() => {
    mat.roughness = 0.08 + transition.current * 0.28
    mat.metalness = 0.22 - transition.current * 0.12
    mat.color.lerpColors(
      new THREE.Color('#0b0d14'),
      new THREE.Color('#f7f0dc'),
      transition.current * 0.55,
    )
  })

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[80, 80, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

function SimpleGate({ onOpen, transition }) {
  const left = useRef()
  const right = useRef()
  const opened = useRef(false)

  useEffect(() => {
    if (!left.current || !right.current) return
    left.current.rotation.y = 0
    right.current.rotation.y = 0
  }, [])

  useFrame(() => {
    // Slight magical light leak while transitioning
    const k = transition.current
    if (left.current) left.current.material.emissiveIntensity = 0.02 + 0.1 * k
    if (right.current) right.current.material.emissiveIntensity = 0.02 + 0.1 * k
  })

  const open = () => {
    if (opened.current) return
    opened.current = true
    onOpen?.()
    gsap.to(left.current.rotation, { y: Math.PI / 2.4, duration: 2.6, ease: 'power2.out' })
    gsap.to(right.current.rotation, { y: -Math.PI / 2.4, duration: 2.6, ease: 'power2.out' })
  }

  return (
    <group position={[0, 1.35, GATE_Z]}>
      <mesh position={[-1.05, 0, 0]} castShadow ref={left} onClick={open}>
        <boxGeometry args={[1.0, 2.7, 0.12]} />
        <meshStandardMaterial color="#20212a" roughness={0.85} metalness={0.1} emissive="#6b4cff" emissiveIntensity={0.02} />
      </mesh>
      <mesh position={[1.05, 0, 0]} castShadow ref={right} onClick={open}>
        <boxGeometry args={[1.0, 2.7, 0.12]} />
        <meshStandardMaterial color="#20212a" roughness={0.85} metalness={0.1} emissive="#6b4cff" emissiveIntensity={0.02} />
      </mesh>
      <mesh position={[0, 0, -0.18]} receiveShadow>
        <boxGeometry args={[2.35, 2.9, 0.16]} />
        <meshStandardMaterial color="#12131a" roughness={0.95} metalness={0.05} />
      </mesh>
    </group>
  )
}

function PlayerRig({ transition, gateOpenRef, onGateOpen }) {
  const { camera } = useThree()
  const [, get] = useKeyboardControls()
  const vel = useRef(new THREE.Vector3())
  const t = useRef(0)

  useFrame((state, dt) => {
    t.current += dt

    const { forward, backward, left, right, sprint } = get()
    const speed = (sprint ? 4.3 : 2.6) * (transition.current < 0.8 ? 1 : 0.55)

    const dir = new THREE.Vector3(
      (right ? 1 : 0) - (left ? 1 : 0),
      0,
      (backward ? 1 : 0) - (forward ? 1 : 0),
    )

    if (dir.lengthSq() > 0) dir.normalize()
    // World-space move (keep simple and stable)
    vel.current.lerp(dir.multiplyScalar(speed), 1 - Math.exp(-dt * 10))
    camera.position.x += vel.current.x * dt
    camera.position.z += vel.current.z * dt

    // Clamp to a simple play area
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -6, 6)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -14, 10)

    // Camera sway
    const sway = Math.sin(t.current * 6.0) * 0.012
    camera.position.y = 1.65 + sway

    // Approach gate trigger
    const gatePos = new THREE.Vector3(0, 1.35, GATE_Z)
    const d = camera.position.distanceTo(gatePos)
    const proximity = THREE.MathUtils.clamp(1 - d / 6.0, 0, 1)

    if (!gateOpenRef.current && d < 2.4) {
      gateOpenRef.current = true
      onGateOpen?.()
    }

    // Cross threshold: entering the castle
    if (gateOpenRef.current && transition.current < 1 && camera.position.z < -0.1) {
      // as you "cross" inward, start the transition.
      transition.current = Math.min(1, transition.current + dt * 0.35)
    }

  })

  return null
}

export default function OutsideScene({ transition }) {
  const { phase, setPhase, muted } = useExperience()
  const gateOpenRef = useRef(false)
  const audio = useAudio({ muted })
  const scroll = useScroll()

  const fog = useRef()
  const ambientRef = useRef()
  const dirRef = useRef()
  const proximityRef = useRef(0)
  const openedOnce = useRef(false)

  useEffect(() => {
    audio.setMuted(muted)
    audio.startOutside()
  }, [audio, muted])

  const onGateOpen = () => {
    if (openedOnce.current) return
    openedOnce.current = true
    audio.playGate()
    setPhase('transition')
  }

  useFrame((state, dt) => {
    const s = THREE.MathUtils.clamp(scroll?.offset ?? 0, 0, 1)
    const reveal = THREE.MathUtils.smootherstep(s, 0.0, 1.0)

    // Scroll-driven cinematic push-in (outside intro)
    if (phase === 'outside') {
      const z = THREE.MathUtils.lerp(20, 5, reveal)
      const x = THREE.MathUtils.lerp(0.6, 0, reveal)
      const y = THREE.MathUtils.lerp(2.15, 1.75, reveal)

      // Smooth easing (frame-based)
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, z, 1 - Math.exp(-dt * 3.5))
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x, 1 - Math.exp(-dt * 3.5))
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y, 1 - Math.exp(-dt * 3.5))

      // Slight downward angle toward the gate/castle
      state.camera.lookAt(0, 1.45, GATE_Z - 5.2)

      // Subtle sway
      const t = state.clock.getElapsedTime()
      state.camera.position.x += Math.sin(t * 0.6) * 0.03
      state.camera.position.y += Math.sin(t * 0.9) * 0.02
    }

    // Outside only affects visuals strongly while transition < 1
    const k = transition.current

    // Use the same "scale" as the viewer screenshot.
    // We keep the lights strong, and reveal via exposure + fog.
    const amb = THREE.MathUtils.lerp(0.3, 0.5, reveal)
    const dir = THREE.MathUtils.lerp(2.5, 2.5, reveal)
    if (ambientRef.current) ambientRef.current.intensity = amb
    if (dirRef.current) dirRef.current.intensity = dir

    // Fog starts dense, clears slightly as you approach
    if (fog.current) {
      const baseNear = THREE.MathUtils.lerp(5, 6.5, reveal)
      const baseFar = THREE.MathUtils.lerp(25, 34, reveal)
      fog.current.near = baseNear - k * 2.5
      fog.current.far = baseFar - k * 6
    }

    // Audio proximity + crossfade
    audio.setGateProximity(proximityRef.current)
    audio.crossfadeOutsideToInside(k)

    if (k >= 0.98 && phase !== 'inside') {
      setPhase('inside')
      audio.playEnter()
      audio.startInside()
    }

    // Background grade (viewer bgColor)
    state.scene.background = new THREE.Color('#191919')
  })

  // Scene is "active" when not fully inside.
  const visible = phase !== 'inside'

  return (
    <group visible={visible}>
      <fog ref={fog} attach="fog" args={['#191919', 5, 25]} />

      <Environment preset="night" background={false} intensity={0.05} />

      <ambientLight ref={ambientRef} intensity={0.3} color="#ffffff" />
      <directionalLight
        ref={dirRef}
        castShadow
        position={[6, 10, 8]}
        intensity={2.5}
        color="#ffffff"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      <WetGround transition={transition} />

      <group position={[0, 0, -5]} scale={3.0}>
        <Suspense fallback={<PlaceholderCastle />}>
          <CastleModel />
        </Suspense>
      </group>

      <SimpleGate onOpen={onGateOpen} transition={transition} />

      <Sparkles
        count={80}
        scale={[5, 2.5, 3]}
        size={2}
        position={[0, 1.2, GATE_Z - 0.7]}
        speed={0.3}
        color="#9aa7ff"
        opacity={0.22}
      />

      <group>
        {/* During the scroll intro, the camera is driven by scroll; keyboard movement can take over later. */}
        {phase !== 'outside' ? (
          <PlayerRig
            transition={transition}
            gateOpenRef={gateOpenRef}
            onGateOpen={onGateOpen}
          />
        ) : null}
        <ProximityTap onUpdate={(p) => (proximityRef.current = p)} />
      </group>
    </group>
  )
}

// R3F doesn't allow returning values from useFrame; this helper tracks player proximity each frame.
function ProximityTap({ onUpdate }) {
  const { camera } = useThree()
  useFrame(() => {
    const gatePos = new THREE.Vector3(0, 1.35, GATE_Z)
    const d = camera.position.distanceTo(gatePos)
    const proximity = THREE.MathUtils.clamp(1 - d / 6.0, 0, 1)
    onUpdate?.(proximity)
  })
  return null
}

function CastleModel() {
  const { scene } = useGLTF('/model.glb')
  const castle = useMemo(() => scene?.clone(true), [scene])

  useEffect(() => {
    if (!castle) return
    const stone = new THREE.Color('#3a3a3a')
    const emissiveBlack = new THREE.Color('#000000')

    castle.traverse((o) => {
      if (!o) return
      o.castShadow = true
      o.receiveShadow = true

      if (!o.isMesh) return

      const mats = Array.isArray(o.material) ? o.material : [o.material]
      const next = mats.map((m) => {
        if (!m) {
          return new THREE.MeshStandardMaterial({
            color: stone,
            roughness: 0.72,
            metalness: 0,
          })
        }

        // If it's a PBR material, clamp the "too shiny / too emissive" values.
        if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
          m.color?.lerp(stone, 0.55)
          if ('roughness' in m) m.roughness = Math.max(0.65, m.roughness ?? 0.65)
          if ('metalness' in m) m.metalness = Math.min(0.05, m.metalness ?? 0.05)
          if ('emissive' in m) m.emissive?.copy(emissiveBlack)
          if ('emissiveIntensity' in m) m.emissiveIntensity = 0
          m.toneMapped = true
          m.needsUpdate = true
          return m
        }

        // Replace non-PBR (often causes flat/bright look) while preserving textures if present.
        const rep = new THREE.MeshStandardMaterial({
          map: m.map ?? null,
          normalMap: m.normalMap ?? null,
          roughnessMap: m.roughnessMap ?? null,
          aoMap: m.aoMap ?? null,
          metalnessMap: m.metalnessMap ?? null,
          color: m.color ? m.color.clone().lerp(stone, 0.55) : stone,
          roughness: 0.72,
          metalness: 0,
        })
        rep.toneMapped = true
        return rep
      })

      o.material = Array.isArray(o.material) ? next : next[0]

      if (o.geometry?.attributes?.uv2 == null && o.geometry?.attributes?.uv) {
        // helps AO maps if present
        o.geometry.setAttribute('uv2', o.geometry.attributes.uv)
      }
    })
  }, [castle])

  return castle ? <primitive object={castle} /> : null
}

function PlaceholderCastle() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 1.25, 0]}>
        <boxGeometry args={[2.2, 2.5, 2.2]} />
        <meshStandardMaterial color="#12131a" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.1, 2.2, -0.2]}>
        <cylinderGeometry args={[0.4, 0.55, 2.8, 20]} />
        <meshStandardMaterial color="#151621" roughness={0.9} metalness={0.06} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.1, 2.2, -0.2]}>
        <cylinderGeometry args={[0.4, 0.55, 2.8, 20]} />
        <meshStandardMaterial color="#151621" roughness={0.9} metalness={0.06} />
      </mesh>
    </group>
  )
}

useGLTF.preload('/model.glb')

