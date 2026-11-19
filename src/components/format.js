const tf = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })
export const kickoff = iso => (iso ? tf.format(new Date(iso)) : 'TBC')
export const stageName = m => (m.stage === 'group' ? `Group · Match ${m.number}` : m.stage === 'sf' ? `Semi-final ${m.number}` : 'Final')
export const stageShort = m => (m.stage === 'group' ? `M${m.number}` : m.stage === 'sf' ? `SF${m.number}` : 'Final')
const ORD = ['1st', '2nd', '3rd', '4th', '5th']
export function sourceLabel(src) {
  if (!src) return 'TBD'
  const g = /^G(\d)$/.exec(src); if (g) return `${ORD[+g[1] - 1]} in group`
  const w = /^W:SF(\d)$/.exec(src); if (w) return `Winner SF${w[1]}`
  return src
}
