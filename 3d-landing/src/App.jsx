import { motion } from 'framer-motion'
import CanvasScene from './components/CanvasScene.jsx'
import LoaderOverlay from './components/LoaderOverlay.jsx'

function App() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/40 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
            <div className="text-sm font-semibold tracking-wide text-white/90">
              CASTLE
            </div>
          </div>
          <a
            href="#demo"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 transition hover:bg-white/15"
          >
            View demo
          </a>
        </div>
      </header>

      <main>
        <section className="relative h-[100svh] overflow-hidden">
          <CanvasScene />
          <LoaderOverlay />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/35 to-zinc-950/85" />
            <div className="absolute inset-0 bg-[radial-gradient(65%_60%_at_50%_35%,rgba(255,255,255,0.12),rgba(0,0,0,0)_60%)]" />
          </div>

          <div className="absolute inset-0 z-10 flex items-end">
            <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-28 sm:pb-20 sm:pt-32">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl"
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
                  Real-time 3D • GLB/GLTF • Mobile ready
                </div>

                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                  A premium 3D hero that feels like a product demo.
                </h1>
                <p className="mt-4 text-pretty text-base text-white/70 sm:text-lg">
                  Orbit, zoom, and explore your Blender-exported model with
                  realistic lighting, smooth controls, and a polished landing
                  page layout.
                </p>

                <div className="pointer-events-auto mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#demo"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white/90"
                  >
                    Explore in 3D
                  </a>
                  <a
                    href="#details"
                    className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    How it works
                  </a>
                </div>

                <div className="mt-6 text-xs text-white/50">
                  Tip: drag to rotate, scroll/pinch to zoom.
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="details" className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-14 sm:grid-cols-3 sm:py-20">
            {[
              {
                k: 'Lighting',
                v: 'Ambient + directional + HDRI environment for believable materials.',
              },
              {
                k: 'Controls',
                v: 'Touch-friendly OrbitControls with damping and a great default angle.',
              },
              {
                k: 'Performance',
                v: 'Lazy loading, Suspense fallback, and minimal re-renders.',
              },
            ].map((card) => (
              <div
                key={card.k}
                className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10"
              >
                <div className="text-sm font-semibold text-white/90">
                  {card.k}
                </div>
                <div className="mt-2 text-sm text-white/60">{card.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
            <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/10 sm:p-10">
              <div className="text-sm font-semibold text-white/90">
                Model source
              </div>
              <div className="mt-2 text-sm text-white/60">
                Place your file at <code className="text-white/80">3d-landing/public/model.glb</code>{' '}
                (or update the path in <code className="text-white/80">src/components/Model.jsx</code>).
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
