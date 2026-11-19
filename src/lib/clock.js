/** Display label for a stored minute, e.g. 7 → "7'", 12 (in a 10-min match) → "10+2'". */
export function minuteLabel(min, matchMinutes) {
  return min > matchMinutes ? `${matchMinutes}+${min - matchMinutes}'` : `${min}'`
}

export function elapsedSeconds(match, nowMs) {
  let s = match.clock_offset_s || 0
  if (match.status === 'live' && match.clock_started_at) s += Math.max(0, (nowMs - Date.parse(match.clock_started_at)) / 1000)
  return s
}

/** Current minute of a match (1-based, football style) and its label. */
export function matchMinute(match, nowMs, matchMinutes) {
  if (match.status === 'ft') return { min: 0, label: 'FT' }
  if (match.status !== 'live' && match.status !== 'paused') return { min: 0, label: '' }
  const min = Math.max(1, Math.ceil(elapsedSeconds(match, nowMs) / 60))
  return { min, label: minuteLabel(min, matchMinutes) }
}
