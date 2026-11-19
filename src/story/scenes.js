// Code-drawn motion graphics for the Kerala → Milan story.
// Every scene is a pure function of (ctx, w, h, p, t): p = chapter progress 0..1 (scroll), t = seconds (ambient loop).

const C = {
  navy: '#0B2A3E', deep: '#061B2B', red: '#C8373A', paper: '#F4F1EA', gold: '#E8B64C',
  grass: '#1F6B3F', grass2: '#23774A', m1: '#E10A16', m2: '#00A04A', m3: '#F6B800', m5: '#A066AA',
}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = x => 1 - Math.pow(1 - clamp(x), 3)
const lerp = (a, b, k) => a + (b - a) * k
// On portrait phones the caption covers the lower part, so focal content lives in the top `safe` px.
const safeH = (w, h) => (w < h ? h * 0.58 : h * 0.86)
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647) }

// ---------- shared ----------
function halftoneDisc(ctx, cx, cy, R, color, step = 9) {
  ctx.fillStyle = color
  for (let y = -R; y <= R; y += step) for (let x = -R; x <= R; x += step) {
    const d = Math.hypot(x, y) / R
    if (d > 1) continue
    const r = (step * 0.48) * Math.sqrt(1 - d * d * 0.85)
    ctx.beginPath(); ctx.arc(cx + x, cy + y, r, 0, Math.PI * 2); ctx.fill()
  }
}
function halftoneField(ctx, w, h, color, step, fn) {
  ctx.fillStyle = color
  for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
    const k = fn(x / w, y / h)
    if (k <= 0.02) continue
    ctx.beginPath(); ctx.arc(x, y, step * 0.5 * Math.min(1, k), 0, Math.PI * 2); ctx.fill()
  }
}

// ---------- 1. Kerala: backwaters at sunset, a boy and a ball ----------
function palm(ctx, x, y, hgt, lean, t, s) {
  const topX = x + lean * hgt, topY = y - hgt
  ctx.strokeStyle = C.deep; ctx.lineCap = 'round'
  ctx.lineWidth = 7 * s
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * hgt * 0.15, y - hgt * 0.55, topX, topY); ctx.stroke()
  const sway = Math.sin(t * 0.9 + x) * 0.06
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.42 + sway
    const L = hgt * (0.42 + 0.06 * Math.cos(i * 1.7))
    const ex = topX + Math.cos(a) * L, ey = topY + Math.sin(a) * L * 0.55 + L * 0.35
    const mx = topX + Math.cos(a) * L * 0.5, my = topY + Math.sin(a) * L * 0.5 - 6 * s
    ctx.lineWidth = 3.2 * s
    ctx.beginPath(); ctx.moveTo(topX, topY); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke()
    // leaflets along the frond: sample the curve
    ctx.lineWidth = 1.6 * s
    for (let k = 0.2; k < 1; k += 0.1) {
      const qx = (1 - k) ** 2 * topX + 2 * (1 - k) * k * mx + k * k * ex
      const qy = (1 - k) ** 2 * topY + 2 * (1 - k) * k * my + k * k * ey
      const leaf = 14 * s * (1 - k * 0.6)
      ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx + Math.cos(a + 1.9) * leaf * 0.4, qy + leaf); ctx.stroke()
    }
  }
}
function boy(ctx, x, y, s, t, juggle) {
  // stick-silhouette built from capsules; kicking leg follows the ball's bounce
  const phase = (t * 2.2) % 1
  const kick = juggle ? Math.max(0, Math.sin(phase * Math.PI * 2)) : 0
  ctx.strokeStyle = C.deep; ctx.fillStyle = C.deep; ctx.lineCap = 'round'
  const hip = [x, y - 46 * s], neck = [x + 2 * s, y - 80 * s]
  ctx.lineWidth = 9 * s
  ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(...neck); ctx.stroke()
  ctx.beginPath(); ctx.arc(x + 3 * s, y - 92 * s, 9 * s, 0, Math.PI * 2); ctx.fill()
  ctx.lineWidth = 6 * s
  ctx.beginPath(); ctx.moveTo(...neck); ctx.lineTo(x - 18 * s, y - 62 * s); ctx.moveTo(...neck); ctx.lineTo(x + 20 * s, y - 64 * s); ctx.stroke()
  ctx.lineWidth = 7 * s
  ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(x - 8 * s, y); ctx.stroke()
  const fx = x + lerp(10, 24, kick) * s, fy = y - lerp(0, 26, kick) * s
  ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(lerp(x + 6 * s, x + 18 * s, kick), lerp(y - 22 * s, y - 34 * s, kick)); ctx.lineTo(fx, fy); ctx.stroke()
  // ball: parabola between kicks
  const by = fy - 10 * s - Math.sin(phase * Math.PI) * 70 * s
  ctx.fillStyle = C.paper
  ctx.beginPath(); ctx.arc(fx + 4 * s, by, 7 * s, 0, Math.PI * 2); ctx.fill()
}
function vallam(ctx, x, y, s) {
  ctx.fillStyle = C.deep
  ctx.beginPath(); ctx.moveTo(x - 90 * s, y - 14 * s)
  ctx.quadraticCurveTo(x, y + 16 * s, x + 90 * s, y - 18 * s)
  ctx.quadraticCurveTo(x, y + 4 * s, x - 90 * s, y - 14 * s); ctx.fill()
  ctx.lineWidth = 2.5 * s; ctx.strokeStyle = C.deep
  ctx.beginPath(); ctx.moveTo(x + 20 * s, y - 2 * s); ctx.lineTo(x + 34 * s, y - 40 * s); ctx.stroke() // boatman's pole
  ctx.beginPath(); ctx.arc(x + 22 * s, y - 30 * s, 4 * s, 0, Math.PI * 2); ctx.fill()
  ctx.fillRect(x + 19 * s, y - 26 * s, 6 * s, 20 * s)
}
export function kerala(ctx, w, h, p, t) {
  const H = safeH(w, h)
  const s = Math.min(w, H * 1.1) / 520
  const horizon = H * 0.68
  const g = ctx.createLinearGradient(0, 0, 0, horizon)
  g.addColorStop(0, C.navy); g.addColorStop(0.55, C.red); g.addColorStop(1, C.gold)
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, horizon)
  const sunY = horizon - lerp(H * 0.08, H * 0.26, ease(p))
  halftoneDisc(ctx, w * 0.66, sunY, Math.min(w, H) * 0.2, 'rgba(244,241,234,.9)', 8 * s + 2)
  // water + sine reflections
  ctx.fillStyle = C.navy; ctx.fillRect(0, horizon, w, h - horizon)
  for (let i = 0; i < 28; i++) {
    const y = horizon + Math.pow(i / 28, 1.6) * (h - horizon)
    const near = i / 28
    ctx.strokeStyle = i % 3 ? `rgba(232,182,76,${0.5 - near * 0.4})` : `rgba(200,55,58,${0.6 - near * 0.4})`
    ctx.lineWidth = 1 + near * 2.5
    const shift = Math.sin(t * 1.1 + i * 0.7) * 18 * s
    const half = lerp(w * 0.06, w * 0.28, near)
    ctx.beginPath(); ctx.moveTo(w * 0.66 - half + shift, y); ctx.lineTo(w * 0.66 + half + shift, y); ctx.stroke()
  }
  vallam(ctx, w * 0.62 + Math.sin(t * 0.25) * 24 * s, horizon + 30 * s, s * 0.9)
  // bank on the left with palms and the boy
  ctx.fillStyle = C.deep
  const bank = H * 0.9
  ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, bank - H * 0.02); ctx.quadraticCurveTo(w * 0.35, bank - H * 0.06, w * 0.62, bank + H * 0.06); ctx.lineTo(w * 0.62, h); ctx.fill()
  ctx.fillRect(0, bank + H * 0.04, w, h)
  palm(ctx, w * 0.07, bank, H * 0.5, 0.16, t, s)
  palm(ctx, w * 0.2, bank - H * 0.01, H * 0.36, -0.14, t + 1, s * 0.85)
  palm(ctx, w * 0.93, horizon + 4, H * 0.3, -0.22, t + 2, s * 0.7)
  ctx.fillStyle = C.deep; ctx.fillRect(w * 0.82, horizon - 2, w * 0.18, 8)
  boy(ctx, w * 0.42, bank - H * 0.035, s * 1.1, t, true)
}

// ---------- 2. The flight: Kochi → Milan on a dotted arc ----------
export function flight(ctx, w, h, p, t) {
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, w, h)
  const r = rng(7)
  for (let i = 0; i < 140; i++) {
    const x = r() * w, y = r() * h * 0.9, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + r()) + i))
    ctx.fillStyle = `rgba(244,241,234,${0.15 + 0.5 * tw * r()})`
    ctx.fillRect(x, y, 1.6, 1.6)
  }
  // graticule: latitude curves y = c + a·sin(x) and meridians
  ctx.strokeStyle = 'rgba(244,241,234,.07)'; ctx.lineWidth = 1
  for (let k = 1; k < 8; k++) {
    ctx.beginPath()
    for (let x = 0; x <= w; x += 8) {
      const y = h * (k / 8) + Math.sin(x / w * Math.PI) * -h * 0.05
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  for (let k = 1; k < 7; k++) { ctx.beginPath(); ctx.ellipse(w / 2, h / 2, Math.abs(w * (k / 7 - 0.5)) * 1.6, h * 0.62, 0, 0, Math.PI * 2); ctx.stroke() }
  const H = safeH(w, h)
  const A = { x: w * 0.2, y: H * 0.86 }, B = { x: w * 0.8, y: H * 0.42 }, K = { x: w * 0.4, y: H * 0.1 }
  const at = k => ({ x: (1 - k) ** 2 * A.x + 2 * (1 - k) * k * K.x + k * k * B.x, y: (1 - k) ** 2 * A.y + 2 * (1 - k) * k * K.y + k * k * B.y })
  const k = ease(clamp((p - 0.08) / 0.8))
  ctx.fillStyle = C.paper
  for (let i = 0; i <= 60; i++) {
    const u = i / 60; if (u > k) break
    const q = at(u); ctx.beginPath(); ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2); ctx.fill()
  }
  const pin = (q, label, col, right) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q.x, q.y, 7, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, 12 + 4 * Math.sin(t * 3), 0, Math.PI * 2); ctx.stroke()
    ctx.font = `600 ${Math.max(14, w * 0.018)}px "DM Sans Variable", sans-serif`; ctx.fillStyle = C.paper
    ctx.textAlign = right ? 'left' : 'right'; ctx.fillText(label, q.x + (right ? 18 : -18), q.y + 5)
  }
  pin(A, 'Kochi', C.gold, false)
  pin(B, 'Milano', k > 0.98 ? C.red : 'rgba(200,55,58,.5)', true)
  // plane along the tangent
  const q = at(k), q2 = at(Math.min(1, k + 0.01))
  const ang = Math.atan2(q2.y - q.y, q2.x - q.x)
  ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(ang); ctx.fillStyle = C.paper
  const S = Math.max(12, w * 0.016)
  ctx.beginPath(); ctx.moveTo(S * 1.4, 0); ctx.lineTo(-S, -S * 0.9); ctx.lineTo(-S * 0.5, 0); ctx.lineTo(-S, S * 0.9); ctx.closePath(); ctx.fill()
  ctx.restore()
  ctx.font = `400 ${Math.max(40, w * 0.07)}px "Bebas Neue", sans-serif`; ctx.fillStyle = 'rgba(244,241,234,.9)'; ctx.textAlign = 'right'
  ctx.fillText(`${Math.round(7441 * k).toLocaleString('en-GB')} km`, w - w * 0.06, H * 0.98)
}

// ---------- 3. Milan: Duomo line-art, metro lines, routine ----------
function duomo(ctx, cx, base, W, H, k) {
  // drawn as one stroked path that "writes itself" with k
  const pts = []
  const n = 13
  const spire = i => { const d = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2); return H * ((i % 2 ? 0.42 : 0.6) + 0.4 * (1 - d * d)) * (i === 6 ? 1.12 : 1) }
  pts.push([cx - W / 2, base])
  for (let i = 0; i < n; i++) {
    const x = cx - W / 2 + (i + 0.5) * (W / n), sh = spire(i), bw = W / n * 0.28
    const wall = base - sh * (i === 6 ? 0.55 : 0.42)
    pts.push([x - bw, wall], [x, base - sh], [x + bw, wall])
  }
  pts.push([cx + W / 2, base])
  ctx.strokeStyle = C.paper; ctx.lineWidth = 2; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(cx - W / 2, base); ctx.lineTo(cx + W / 2, base); ctx.stroke()
  const len = pts.length - 1, upto = len * k
  ctx.beginPath(); ctx.moveTo(...pts[0])
  for (let i = 1; i <= len; i++) {
    if (i > upto) { const f = upto - (i - 1); if (f > 0) ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break }
    ctx.lineTo(...pts[i])
  }
  ctx.stroke()
  // portals: three pointed arches
  if (k > 0.6) {
    ctx.globalAlpha = clamp((k - 0.6) / 0.3)
    for (const [dx, sc] of [[-0.18, 0.7], [0, 1], [0.18, 0.7]]) {
      const x = cx + dx * W, aw = W * 0.05 * sc, ah = H * 0.26 * sc
      ctx.beginPath(); ctx.moveTo(x - aw, base); ctx.lineTo(x - aw, base - ah * 0.6)
      ctx.quadraticCurveTo(x - aw, base - ah, x, base - ah * 1.15); ctx.quadraticCurveTo(x + aw, base - ah, x + aw, base - ah * 0.6); ctx.lineTo(x + aw, base); ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(cx, base - H * 0.42, W * 0.035, 0, Math.PI * 2); ctx.stroke() // rose window
    for (let a = 0; a < 8; a++) { ctx.beginPath(); ctx.moveTo(cx, base - H * 0.42); ctx.lineTo(cx + Math.cos(a * Math.PI / 4) * W * 0.035, base - H * 0.42 + Math.sin(a * Math.PI / 4) * W * 0.035); ctx.stroke() }
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx, base - spire(6) - 7, 4, 0, Math.PI * 2); ctx.fill() // the Madonnina
    ctx.globalAlpha = 1
  }
}
export function milan(ctx, w, h, p, t) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#22384A'); g.addColorStop(1, '#0E2333')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  // rain
  const r = rng(3)
  ctx.strokeStyle = 'rgba(185,195,203,.18)'; ctx.lineWidth = 1
  for (let i = 0; i < 90; i++) {
    const x0 = r() * w, sp = 300 + r() * 200, y = ((r() * h + t * sp) % (h + 40)) - 20
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 - 6, y + 18); ctx.stroke()
  }
  const H = safeH(w, h)
  const base = H * 0.66, wide = w > h
  // landscape: keep the left third free for the caption
  const L0 = wide ? w * 0.4 : w * 0.1, LW = wide ? w * 0.52 : w * 0.8
  duomo(ctx, L0 + LW / 2, base, Math.min(LW * 1.05, H * 1.2), Math.min(H * 0.44, LW * 0.6), ease(clamp(p / 0.6)))
  // metro lines with moving trains
  const lines = [[C.m1, 'M1'], [C.m2, 'M2'], [C.m3, 'M3'], [C.m5, 'M5']]
  const top = H * 0.76, gap = Math.min(24, H * 0.055)
  lines.forEach(([col, name], i) => {
    const y = top + i * gap, reveal = ease(clamp((p - 0.1 - i * 0.06) / 0.4))
    ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(L0, y); ctx.lineTo(L0 + LW * reveal, y); ctx.stroke()
    ctx.fillStyle = C.paper
    for (let s = 0; s < 7; s++) { const x = L0 + (s / 6) * LW; if (x > L0 + LW * reveal) break; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill() }
    const tx = L0 + ((t * (0.07 + i * 0.015) + i * 0.3) % 1) * LW * reveal
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(tx - 14, y - 6, 28, 12, 4); ctx.fill()
    ctx.font = `700 12px "DM Sans Variable", sans-serif`; ctx.fillStyle = col; ctx.textAlign = 'right'
    if (reveal > 0.05) ctx.fillText(name, L0 - 10, y + 4)
  })
}

// ---------- 4. Sunday: floodlights on, five dots find their places ----------
export function pitch(ctx, w, h, p, t) {
  ctx.fillStyle = '#04121D'; ctx.fillRect(0, 0, w, h)
  const lit = ease(clamp(p / 0.35))
  const H = safeH(w, h)
  const PH = Math.min(H * 0.84, w * 1.05), PW = PH / 1.35
  const x0 = w > h ? w * 0.62 - PW / 2 : (w - PW) / 2, y0 = H * 0.13
  // floodlight glow
  for (const [fx, fy] of [[x0 - 20, y0 - 20], [x0 + PW + 20, y0 - 20], [x0 - 20, y0 + PH + 20], [x0 + PW + 20, y0 + PH + 20]]) {
    const rg = ctx.createRadialGradient(fx, fy, 0, fx, fy, PW * 0.9)
    rg.addColorStop(0, `rgba(255,248,220,${0.38 * lit})`); rg.addColorStop(1, 'rgba(255,248,220,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = `rgba(255,250,235,${0.3 + 0.7 * lit})`; ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 0.25 + 0.75 * lit
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? C.grass : C.grass2; ctx.fillRect(x0, y0 + (PH / 8) * i, PW, PH / 8 + 1) }
  ctx.globalAlpha = 1
  // lines draw in (dash offset), stroke length ~ perimeter
  const L = ease(clamp((p - 0.1) / 0.35))
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2
  const per = 2 * (PW + PH)
  ctx.setLineDash([per * L, per]); ctx.strokeRect(x0, y0, PW, PH)
  ctx.setLineDash([PW * L, PW]); ctx.beginPath(); ctx.moveTo(x0, y0 + PH / 2); ctx.lineTo(x0 + PW, y0 + PH / 2); ctx.stroke()
  const cr = PW * 0.14
  ctx.setLineDash([]); ctx.beginPath(); ctx.arc(x0 + PW / 2, y0 + PH / 2, cr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * L); ctx.stroke()
  for (const [yy, dir] of [[y0, 1], [y0 + PH, -1]]) {
    ctx.beginPath(); ctx.arc(x0 + PW / 2, yy, PW * 0.24, dir > 0 ? 0 : Math.PI, (dir > 0 ? 0 : Math.PI) + Math.PI * L); ctx.stroke()
  }
  // five players: scattered arrivals → 1-2-1 diamond
  const form = [[0.5, 0.9], [0.5, 0.7], [0.2, 0.52], [0.8, 0.52], [0.5, 0.3]]
  const r = rng(11)
  const k = ease(clamp((p - 0.35) / 0.4))
  const pos = form.map(([fx, fy]) => {
    const sx = r() * 1.6 - 0.3, sy = -0.25 - r() * 0.2
    return [x0 + PW * lerp(sx, fx, k) + Math.sin(t * 1.3 + fx * 9) * 3 * k, y0 + PH * lerp(sy, fy, k) + Math.cos(t * 1.1 + fy * 7) * 3 * k]
  })
  pos.forEach(([x, y], i) => {
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 10, 11, 4, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = i === 0 ? '#F5C518' : C.red; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  })
  // once formed, the ball moves along a passing loop GK→DEF→MID→FWD→MID→DEF
  if (k > 0.95) {
    const seq = [0, 1, 2, 4, 3, 1], seg = (t * 0.9) % seq.length, a = pos[seq[Math.floor(seg)]], b = pos[seq[(Math.floor(seg) + 1) % seq.length]]
    const f = ease(seg % 1), bx = lerp(a[0], b[0], f), by = lerp(a[1], b[1], f) - Math.sin(f * Math.PI) * 14
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill()
  }
}

// ---------- 5. Finale: halftone like the auction deck ----------
export function finale(ctx, w, h, p, t) {
  ctx.fillStyle = C.red; ctx.fillRect(0, 0, w, h)
  const step = Math.max(10, Math.min(w, h) / 46)
  halftoneField(ctx, w, h, C.navy, step, (x, y) => {
    const d = (x * 0.9 + (1 - y) * 0.6) - 0.65 + Math.sin(t * 0.5 + y * 4) * 0.02
    return clamp(d * 2.4)
  })
  halftoneField(ctx, w, h, 'rgba(0,0,0,.35)', step * 0.7, (x, y) => clamp(1.4 - Math.hypot(x - 0.12, y - 0.95) * 2.6))
}

export const SCENES = [kerala, flight, milan, pitch, finale]
