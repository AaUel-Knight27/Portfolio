export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />

      <directionalLight
        castShadow
        position={[6, 8, 4]}
        intensity={1.45}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <directionalLight position={[-6, 3, -4]} intensity={0.35} />
    </>
  )
}

