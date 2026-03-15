import { createClient } from '@supabase/supabase-js'

// Environment variables are set by:
// - Netlify: configured in dashboard
// - Local dev: loaded by api/server.js before importing this file

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables - check Netlify env vars or local .env')
}

// Public client (anon key) - for reads, subject to RLS
const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client (service role key) - for writes, bypasses RLS
// Falls back to anon key if service key not configured
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)

// Players
export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Teams
export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('pick_number')

  if (error) throw error
  return data || []
}

// Submissions
export async function saveSubmission(submission) {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({
      name: submission.name,
      picks: submission.picks,
      trade_up: submission.tradesUp || [],
      trade_down: submission.tradesDown || []
    })
    .select()

  if (error) throw error
  return data[0]
}

export async function getSubmissions() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Game Settings
export async function getGameSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')

  if (error) throw error

  // Convert array to object
  const settings = {}
  data.forEach(row => {
    settings[row.key] = row.value
  })

  return settings
}

export async function updateSetting(key, value) {
  // Try update first; if no row exists yet, insert
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('settings')
    .update({ value })
    .eq('key', key)
    .select()

  if (updateError) throw updateError

  if (updated && updated.length > 0) return updated[0]

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('settings')
    .insert({ key, value })
    .select()

  if (insertError) throw insertError
  return inserted[0]
}

// Draft Results
export async function saveDraftResults(results, tradesUp = [], tradesDown = []) {
  // Update existing rows, insert new ones (no unique constraint on pick_number to rely on)
  for (const result of results) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('draft_results')
      .update({ player_name: result.player_name, team_name: result.team_name })
      .eq('pick_number', result.pick_number)
      .select()

    if (updateError) throw updateError

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from('draft_results')
        .insert(result)

      if (insertError) throw insertError
    }
  }

  const { data, error } = await supabaseAdmin
    .from('draft_results')
    .select()
    .order('pick_number')

  if (error) throw error

  // Save actual trades that happened
  await updateSetting('actual_trades_up', JSON.stringify(tradesUp))
  await updateSetting('actual_trades_down', JSON.stringify(tradesDown))

  return data
}

export async function getActualTrades() {
  const settings = await getGameSettings()
  return {
    tradesUp: settings.actual_trades_up ? JSON.parse(settings.actual_trades_up) : [],
    tradesDown: settings.actual_trades_down ? JSON.parse(settings.actual_trades_down) : []
  }
}

export async function getDraftResults() {
  const { data, error } = await supabase
    .from('draft_results')
    .select('*')
    .order('pick_number')

  if (error) throw error
  return data || []
}

// Scores
export async function saveScores(scores) {
  for (const score of scores) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('scores')
      .update(score)
      .eq('name', score.name)
      .select()

    if (updateError) throw updateError

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from('scores')
        .insert(score)

      if (insertError) throw insertError
    }
  }
}

export async function getScores() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('total_score', { ascending: false })

  if (error) throw error
  return data || []
}
