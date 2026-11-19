import { useEffect, useRef, useState } from 'react'
import { SCENES } from './scenes.js'
import './story.css'
import { MMN_URL } from '../components/Footer.jsx'
import { VENUE } from '../components/Venue.jsx'

const CHAPTERS = [
  { title: 'Kerala, every evening', body: 'Bare feet, a plastic ball, the backwaters turning gold. He played until it was too dark to see.' },
  { title: 'One ticket to Milan', body: 'A degree to finish, a job to find. The suitcase was full, and he still packed his boots.' },
  { title: 'Milano, Monday to Saturday', body: 'Lectures, shifts, the metro before eight. A long way from home, and the ball stayed in the cupboard.' },
  { title: 'Then, on Sunday', body: 'The floodlights come on. Five a side, everyone from home, playing like we did as kids.' },
  null, // finale is rendered as its own block
]
const N = SCENES.length
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const CHAPTER_S = 5.5 // seconds per chapter; the finale then holds

export default function Story() {
  const canvas = useRef(null)
  const [state, setState] = useState({ seg: 0, local: 0 })
  const clock = useRef({ t0: performance.now(), offset: 0 }) // offset lets dots jump to a chapter

  const jump = i => { clock.current = { t0: performance.now(), offset: i * CHAPTER_S } }
  const replay = () => jump(0)

  useEffect(() => {
    const cv = canvas.current, ctx = cv.getContext('2d')
    let raf = 0, visible = true, w = 0, h = 0
    const tStart = performance.now()
    if (reduce()) clock.current.offset = (N - 1) * CHAPTER_S // reduced motion: go straight to the finale
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = cv.clientWidth; h = cv.clientHeight
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = now => {
      const t = reduce() ? 2 : (now - tStart) / 1000
      const played = clock.current.offset + (now - clock.current.t0) / 1000
      const x = Math.min(N - 1 + 0.999, played / CHAPTER_S)
      const seg = Math.min(N - 1, Math.floor(x)), local = seg === N - 1 ? Math.min(1, x - seg) : x - seg
      SCENES[seg](ctx, w, h, local, t)
      if (seg < N - 1 && local > 0.85) { // crossfade into the next chapter
        ctx.globalAlpha = (local - 0.85) / 0.15
        SCENES[seg + 1](ctx, w, h, 0, t)
        ctx.globalAlpha = 1
      }
      setState(st => (st.seg === seg && Math.abs(st.local - local) < 0.01 ? st : { seg, local }))
    }
    const loop = now => {
      if (visible) draw(now)
      else clock.current.t0 += 16 // paused while off-screen, so nobody misses the story
      raf = requestAnimationFrame(loop)
    }
    resize()
    raf = requestAnimationFrame(loop)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(cv)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', resize) }
  }, [])

  const { seg, local } = state
  const fade = local < 0.08 ? local / 0.08 : local > 0.8 ? Math.max(0, (0.92 - local) / 0.12) : 1
  const ch = CHAPTERS[seg]
  const skip = () => document.getElementById('scores')?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' })

  return (
    <section className="story" aria-label="The MML story">
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
            <p className="org"><a href={VENUE.link} target="_blank" rel="noopener">📍 {VENUE.name}</a></p>
            <p className="org">Organised by <a href={MMN_URL} target="_blank" rel="noopener">Milan Malayali Network</a></p>
            <div className="story-final-btns">
              <button className="btn" onClick={skip}>See live scores</button>
              <button className="btn ghost" onClick={replay}>Watch again</button>
            </div>
          </div>
        )}
        {seg < N - 1 && <button className="story-skip" onClick={() => jump(N - 1)}>Skip</button>}
        <div className="story-dots">
          {SCENES.map((_, i) => (
            <button key={i} className={i === seg ? 'on' : ''} onClick={() => jump(i)} aria-label={i < N - 1 ? `Chapter ${i + 1}: ${CHAPTERS[i].title}` : 'Finale'}>
              <i style={i === seg ? { '--p': i === N - 1 ? 1 : local } : undefined} />
            </button>
          ))}
        </div>
      </div>
      <div className="sr">{CHAPTERS.filter(Boolean).map(c => `${c.title}. ${c.body}`).join(' ')}</div>
    </section>
  )
}
