// 5-a-side: GK + 4 outfield. Coordinates in a 0–100 box, y=100 is own goal line.
const GK = { role: 'GK', x: 50, y: 90 }
export const FORMATIONS = {
  '2-2':   [GK, { role: 'DEF', x: 28, y: 66 }, { role: 'DEF', x: 72, y: 66 }, { role: 'FWD', x: 30, y: 30 }, { role: 'FWD', x: 70, y: 30 }],
  '1-2-1': [GK, { role: 'DEF', x: 50, y: 70 }, { role: 'MID', x: 22, y: 50 }, { role: 'MID', x: 78, y: 50 }, { role: 'FWD', x: 50, y: 24 }],
  '2-1-1': [GK, { role: 'DEF', x: 28, y: 68 }, { role: 'DEF', x: 72, y: 68 }, { role: 'MID', x: 50, y: 46 }, { role: 'FWD', x: 50, y: 22 }],
  '3-1':   [GK, { role: 'DEF', x: 20, y: 64 }, { role: 'DEF', x: 50, y: 68 }, { role: 'DEF', x: 80, y: 64 }, { role: 'FWD', x: 50, y: 26 }],
  '1-1-2': [GK, { role: 'DEF', x: 50, y: 70 }, { role: 'MID', x: 50, y: 48 }, { role: 'FWD', x: 30, y: 24 }, { role: 'FWD', x: 70, y: 24 }],
}
export const FORMATION_NAMES = Object.keys(FORMATIONS)
