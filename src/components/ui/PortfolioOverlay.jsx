import { AnimatePresence, motion } from 'framer-motion'
import { useExperience } from '../../state/experienceStore.jsx'

function Panel({ title, children, onClose }) {
  return (
    <motion.div
      className="pointer-events-auto w-[min(760px,92vw)] rounded-2xl bg-zinc-950/55 p-6 ring-1 ring-white/10 backdrop-blur"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.985, transition: { duration: 0.18 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-wide text-white/60">
            PORTFOLIO
          </div>
          <div className="mt-1 text-lg font-semibold text-white/90">{title}</div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/15"
        >
          Close
        </button>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-white/70">{children}</div>
    </motion.div>
  )
}

export default function PortfolioOverlay() {
  const { activePanel, setActivePanel, phase } = useExperience()

  const open = phase === 'inside' && !!activePanel

  return (
    <div className="pointer-events-none absolute inset-0 z-40 grid place-items-end pb-8 sm:place-items-center sm:pb-0">
      <AnimatePresence>
        {open ? (
          <Panel
            key={activePanel}
            title={activePanel.toUpperCase()}
            onClose={() => setActivePanel(null)}
          >
            {activePanel === 'projects' ? (
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Project frame interactions (replace with your real projects).</li>
                <li>Click objects in the room to open sections.</li>
              </ul>
            ) : activePanel === 'about' ? (
              <div>
                Add your bio here. This panel is triggered by the “scroll/statue”
                object in the room.
              </div>
            ) : activePanel === 'skills' ? (
              <div>
                Add your skills here. You can swap the boxes for icons/3D symbols.
              </div>
            ) : activePanel === 'contact' ? (
              <div className="space-y-2">
                <div>Email: you@example.com</div>
                <div>GitHub: @yourhandle</div>
                <div>LinkedIn: /in/yourhandle</div>
              </div>
            ) : (
              <div>Unknown panel: {activePanel}</div>
            )}
          </Panel>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

