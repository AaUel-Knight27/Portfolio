import { useEffect, useMemo, useRef } from 'react'
import { Howl } from 'howler'

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

export default function useAudio({ muted } = {}) {
  const mutedRef = useRef(!!muted)
  mutedRef.current = !!muted

  const sounds = useMemo(() => {
    const mk = (src, { loop = true, volume = 0.6 } = {}) =>
      new Howl({
        src: [src],
        loop,
        volume,
        html5: true,
      })

    return {
      outside: mk('/audio/outside-wind.mp3', { volume: 0.35 }),
      whispers: mk('/audio/outside-whispers.mp3', { volume: 0.22 }),
      inside: mk('/audio/inside-ambience.mp3', { volume: 0.35 }),
      gate: mk('/audio/gate-creak.mp3', { loop: false, volume: 0.65 }),
      enter: mk('/audio/enter-chime.mp3', { loop: false, volume: 0.6 }),
    }
  }, [])

  useEffect(() => {
    Object.values(sounds).forEach((s) => {
      if (mutedRef.current) s.mute(true)
    })
    return () => Object.values(sounds).forEach((s) => s.unload())
  }, [sounds])

  const api = useMemo(() => {
    const ensurePlay = (howl) => {
      if (!howl.playing()) howl.play()
    }

    return {
      setMuted(next) {
        Object.values(sounds).forEach((s) => s.mute(!!next))
      },
      startOutside() {
        ensurePlay(sounds.outside)
        ensurePlay(sounds.whispers)
        sounds.inside.stop()
      },
      startInside() {
        ensurePlay(sounds.inside)
      },
      playGate() {
        sounds.gate.play()
      },
      playEnter() {
        sounds.enter.play()
      },
      setGateProximity(t) {
        // t = 0 far, 1 near
        const k = clamp01(t)
        sounds.whispers.volume(0.08 + 0.26 * k)
        sounds.outside.volume(0.22 + 0.22 * k)
      },
      crossfadeOutsideToInside(t) {
        // t = 0 outside, 1 inside
        const k = clamp01(t)
        ensurePlay(sounds.outside)
        ensurePlay(sounds.whispers)
        ensurePlay(sounds.inside)
        sounds.outside.volume((1 - k) * 0.35)
        sounds.whispers.volume((1 - k) * 0.22)
        sounds.inside.volume(k * 0.4)
      },
    }
  }, [sounds])

  return api
}

