import { useEffect, useRef, useState } from 'react'
import { SCENES } from './scenes.js'
import './story.css'

const CHAPTERS = [
  { title: 'Kerala, every evening', body: 'Bare feet, a plastic ball, the backwaters turning gold. He played until it was too dark to see.' },
  { title: 'One ticket to Milan', body: 'A degree to finish, a job to find. The suitcase was full, and he still packed his boots.' },
  { title: 'Milano, Monday to Saturday', body: 'Lectures, shifts, the metro before eight. A long way from home, and the ball stayed in the cupboard.' },
  { title: 'Then, on Sunday', body: 'The floodlights come on. Five a side, everyone from home, playing like we did as kids.' },
  null, // finale is rendered as its own block
]
const N = SCENES.length
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Story() {
  const wrap = useRef(null), canvas = useRef(null)
  const [state, setState] = useState({ seg: 0, local: 0 })
  const progress = useRef(0)

  useEffect(() => {
    const cv = canvas.current, ctx = cv.getContext('2d')
    let raf = 0, visible = true, w = 0, h = 0
    const t0 = performance.now()
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = cv.clientWidth; h = cv.clientHeight
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const onScroll = () => {
      const r = wrap.current.getBoundingClientRect()
      const total = r.height - window.innerHeight
      progress.current = Math.min(1, Math.max(0, -r.top / total))
      const x = progress.current * N
      const seg = Math.min(N - 1, Math.floor(x)), local = Math.min(1, x - seg)
      setState(s => (s.seg === seg && Math.abs(s.local - local) < 0.01 ? s : { seg, local }))
      if (reduce()) draw(0)
    }
    const draw = (now) => {
      const t = reduce() ? 2 : (now - t0) / 1000
      const x = progress.current * N
      const seg = Math.min(N - 1, Math.floor(x)), local = reduce() ? 0.999 : Math.min(1, x - seg)
      SCENES[seg](ctx, w, h, local, t)
      // crossfade into the next chapter over the last 15% of this one
      if (seg < N - 1 && local > 0.85) {
        ctx.globalAlpha = (local - 0.85) / 0.15
        SCENES[seg + 1](ctx, w, h, 0, t)
        ctx.globalAlpha = 1
      }
    }
    const loop = now => { if (visible) draw(now); raf = requestAnimationFrame(loop) }
    resize(); onScroll()
    if (reduce()) draw(0); else raf = requestAnimationFrame(loop)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(cv)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', () => { resize(); onScroll() })
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const { seg, local } = state
  const fade = local < 0.08 ? local / 0.08 : local > 0.8 ? Math.max(0, (0.92 - local) / 0.12) : 1
  const ch = CHAPTERS[seg]
  const skip = () => document.getElementById('scores')?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' })

  return (
    <section ref={wrap} className="story" style={{ height: `${N * 110}vh` }} aria-label="The MML story">
      <div className="story-stage">
        <canvas ref={canvas} className="story-canvas" aria-hidden="true" />
        {ch && (
          <div className="story-cap" style={{ opacity: fade, transform: `translateY(${(1 - fade) * 14}px)` }}>
            <h2>{ch.title}</h2>
            <p>{ch.body}</p>
          </div>
        )}
        {seg === N - 1 && (
          <div className="story-final" style={{ opacity: Math.min(1, local * 3) }}>
            <img src="/logos/mml.webp" alt="" />
            <h1>MML<br />4.0</h1>
            <p>Milan Malayali League, Sunday 22 November 2026</p>
            <p className="org">Organised by Milan Malayali Network</p>
            <button className="btn" onClick={skip}>See live scores</button>
          </div>
        )}
        {seg === 0 && local < 0.3 && <div className="story-hint" style={{ opacity: 1 - local / 0.3 }}>Scroll to follow his story</div>}
        {seg < N - 1 && <button className="story-skip" onClick={skip}>Skip to scores</button>}
        <div className="story-dots" aria-hidden="true">{SCENES.map((_, i) => <i key={i} className={i === seg ? 'on' : ''} />)}</div>
      </div>
      {/* screen-reader version of the story */}
      <div className="sr">{CHAPTERS.filter(Boolean).map(c => `${c.title}. ${c.body}`).join(' ')}</div>
    </section>
  )
}
