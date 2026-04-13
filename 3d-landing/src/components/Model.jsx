import { Float, useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Model({ url = '/model.glb' }) {
  const group = useRef(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, group)

  useLayoutEffect(() => {
    if (!scene) return

    scene.traverse((obj) => {
      if (!obj) return
      obj.castShadow = true
      obj.receiveShadow = true
      if (obj.isMesh && obj.material) {
        obj.material.side = THREE.FrontSide
      }
    })

    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const min = box.min.clone()

    // Center in XZ, sit on "ground" in Y.
    scene.position.x -= center.x
    scene.position.z -= center.z
    scene.position.y -= min.y

    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const target = 2.35
    const s = target / maxDim
    if (group.current) group.current.scale.setScalar(s)
  }, [scene])

  useEffect(() => {
    const keys = actions ? Object.keys(actions) : []
    if (!keys.length) return

    keys.forEach((k) => actions[k]?.reset().fadeIn(0.45).play())
    return () => keys.forEach((k) => actions[k]?.fadeOut(0.25))
  }, [actions])

  return (
    <Float speed={1.0} rotationIntensity={0.25} floatIntensity={0.35}>
      <group ref={group}>
        <primitive object={scene} />
      </group>
    </Float>
  )
}

useGLTF.preload('/model.glb')

