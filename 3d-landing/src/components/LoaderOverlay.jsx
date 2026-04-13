import { useProgress } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'

export default function LoaderOverlay() {
  const { active, progress, item, loaded, total } = useProgress()
  const pct = Math.min(100, Math.max(0, progress || 0))
  const visible = active || pct < 100

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <div className="absolute inset-0 bg-zinc-950/55 backdrop-blur-md" />

          <div className="relative w-[min(420px,92vw)] rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/90">
                  Loading 3D experience
                </div>
                <div className="mt-1 text-xs text-white/55">
                  {item ? item.split('/').at(-1) : 'Preparing assets'} • {loaded}/
                  {total}
                </div>
              </div>
              <div className="text-xs font-semibold tabular-nums text-white/75">
                {pct.toFixed(0)}%
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400"
                initial={{ width: '0%' }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
              />
            </div>

            <div className="mt-4 text-[11px] text-white/45">
              Tip: on mobile, pinch to zoom and drag to orbit.
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

