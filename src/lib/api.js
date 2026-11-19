// All admin writes go through here. In demo mode they mutate local state instead of Supabase.
import { supabase, hasSupabase } from './supabase.js'

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))

export function makeApi(dispatch) {
  const local = (table, op, row, old) => dispatch({ type: 'change', table, op, row, old })
  async function run(promise) {
    const { data, error } = await promise
    if (error) throw new Error(error.message)
    return data
  }
  return {
    async upsert(table, row, onConflict) {
      if (!hasSupabase) { const r = { id: row.id ?? uid(), ...row }; local(table, 'UPSERT', r); return r }
      const data = await run(supabase.from(table).upsert(row, onConflict ? { onConflict } : undefined).select().single())
      local(table, 'UPSERT', data); return data
    },
    async update(table, id, patch) {
      if (!hasSupabase) { local(table, 'UPDATE', { id, ...patch }); return }
      const data = await run(supabase.from(table).update(patch).eq('id', id).select().single())
      local(table, 'UPDATE', data)
    },
    async remove(table, id) {
      if (!hasSupabase) { local(table, 'DELETE', null, { id }); return }
      await run(supabase.from(table).delete().eq('id', id))
      local(table, 'DELETE', null, { id })
    },
    async saveLineup(row) {
      if (!hasSupabase) { local('lineups', 'UPSERT', row); return }
      const data = await run(supabase.from('lineups').upsert({ ...row, updated_at: new Date().toISOString() }).select().single())
      local('lineups', 'UPSERT', data)
    },
    async setSetting(key, value) {
      if (!hasSupabase) { local('settings', 'UPSERT', { key, value }); return }
      await run(supabase.from('settings').upsert({ key, value }))
      local('settings', 'UPSERT', { key, value })
    },
    async uploadLogo(file, folder) {
      if (!hasSupabase) return URL.createObjectURL(file)
      const path = `${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
      await run(supabase.storage.from('logos').upload(path, file, { upsert: true }))
      return supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
    },
  }
}
