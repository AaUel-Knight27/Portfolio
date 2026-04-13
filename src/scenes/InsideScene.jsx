import { Environment, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { cursorPointer, stopEvent } from '../utils/interaction.js'
import { useExperience } from '../state/experienceStore.jsx'

function MagicalLightRig({ transition }) {
  const key = useRef()
  const fill = useRef()

  useFrame(() => {
    const k = transition.current
    if (key.current) key.current.intensity = 0.15 + 2.2 * k
    if (fill.current) fill.current.intensity = 0.05 + 0.85 * k
  })

  return (
    <>
      <ambientLight intensity={0.05} />
      <directionalLight
        ref={key}
        castShadow
        position={[6, 10, 2]}
        intensity={0.15}
        color="#ffe7b7"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight ref={fill} position={[-6, 4, -4]} intensity={0.05} color="#fff7e6" />
    </>
  )
}

function Pedestal({ transition }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#141420'),
        roughness: 0.6,
        metalness: 0.2,
        emissive: new THREE.Color('#ffd38b'),
        emissiveIntensity: 0,
      }),
    [],
  )

  useFrame(() => {
    const k = transition.current
    mat.color.lerpColors(new THREE.Color('#101018'), new THREE.Color('#f4ecd9'), k)
    mat.emissiveIntensity = 0.0 + 0.6 * k
    mat.roughness = 0.55 - 0.3 * k
  })

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <circleGeometry args={[22, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

function Interactable({ id, label, position, color, onActivate }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    cursorPointer(hovered)
    return () => cursorPointer(false)
  }, [hovered])

  useEffect(() => {
    if (!ref.current) return
    gsap.to(ref.current.scale, {
      x: hovered ? 1.08 : 1,
      y: hovered ? 1.08 : 1,
      z: hovered ? 1.08 : 1,
      duration: 0.22,
      ease: 'power2.out',
    })
  }, [hovered])

  return (
    <group position={position}>
      <mesh
        ref={ref}
        castShadow
        onPointerOver={(e) => (stopEvent(e), setHovered(true))}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => (stopEvent(e), onActivate?.(id))}
      >
        <boxGeometry args={[1.2, 0.85, 0.12]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : '#f2ead6'}
          roughness={0.25}
          metalness={0.15}
          emissive={new THREE.Color(color)}
          emissiveIntensity={hovered ? 0.65 : 0.35}
        />
      </mesh>
      <mesh position={[0, -0.62, 0]} receiveShadow>
        <cylinderGeometry args={[0.36, 0.5, 0.35, 24]} />
        <meshStandardMaterial color="#e8dfc9" roughness={0.45} metalness={0.05} />
      </mesh>
      <Sparkles
        count={18}
        scale={[1.6, 1.2, 1.2]}
        size={2.5}
        speed={0.3}
        position={[0, 0.25, 0]}
        color={color}
        opacity={0.55}
      />
      {/* Label kept in overlay UI for accessibility; 3D label optional */}
      <group />
      <group name={label} />
    </group>
  )
}

export default function InsideScene({ transition }) {
  const { phase, activePanel, setActivePanel } = useExperience()

  // Visible only when entering/inside
  const visible = phase !== 'outside'

  useFrame((state) => {
    const k = transition.current
    if (k <= 0.02) return

    // Push camera gently forward and stabilize
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, -3.6, 0.01 * k)
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.01 * k)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.7, 0.01 * k)
    state.camera.lookAt(0, 1.35, -6)
  })

  return (
    <group visible={visible}>
      <Environment preset="sunset" background={false} />

      <fog attach="fog" args={['#fff6e3', 2.5, 22]} />

      <MagicalLightRig transition={transition} />
      <Pedestal transition={transition} />

      <group position={[0, 0, -7]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[10, 6, 0.3]} />
          <meshStandardMaterial color="#fff6e4" roughness={0.32} metalness={0.05} />
        </mesh>
        <mesh position={[0, 3.3, 0.1]} receiveShadow>
          <boxGeometry args={[10.2, 0.4, 0.4]} />
          <meshStandardMaterial color="#e6d6b0" roughness={0.5} metalness={0.08} />
        </mesh>
      </group>

      <group position={[0, 0, -5.4]}>
        <Interactable
          id="projects"
          label="Projects"
          position={[-3, 1.55, 0]}
          color="#a78bfa"
          onActivate={setActivePanel}
        />
        <Interactable
          id="about"
          label="About"
          position={[-1, 1.45, 0]}
          color="#34d399"
          onActivate={setActivePanel}
        />
        <Interactable
          id="skills"
          label="Skills"
          position={[1, 1.55, 0]}
          color="#fbbf24"
          onActivate={setActivePanel}
        />
        <Interactable
          id="contact"
          label="Contact"
          position={[3, 1.45, 0]}
          color="#fb7185"
          onActivate={setActivePanel}
        />
      </group>

      {activePanel ? (
        <Sparkles
          count={120}
          scale={[12, 6, 10]}
          size={2}
          speed={0.4}
          position={[0, 2.0, -6]}
          color="#ffdca8"
          opacity={0.45}
        />
      ) : null}
    </group>
  )
}

