import { createClient } from '@supabase/supabase-js'

// Environment variables are set by:
// - Netlify: configured in dashboard
// - Local dev: loaded by api/server.js before importing this file

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables - check Netlify env vars or local .env')
}

const supabase = createClient(supabaseUrl, supabaseKey)

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
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      email: submission.email,
      name: submission.name || null,
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

// Get only the latest submission per email (for scoring/leaderboard)
export async function getLatestSubmissionPerEmail() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Deduplicate: keep only the latest submission per email
  const latestByEmail = new Map()
  for (const submission of data || []) {
    if (submission.email && !latestByEmail.has(submission.email)) {
      latestByEmail.set(submission.email, submission)
    }
  }

  return Array.from(latestByEmail.values())
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
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()

  if (error) throw error
  return data[0]
}

// Draft Results
export async function saveDraftResults(results, tradesUp = [], tradesDown = []) {
  // Upsert results so repeated saves (e.g. live draft mode) don't fail on duplicate pick_number
  const { data, error } = await supabase
    .from('draft_results')
    .upsert(results, { onConflict: 'pick_number' })
    .select()

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
  const { data, error } = await supabase
    .from('scores')
    .upsert(scores, { onConflict: 'name' })
    .select()

  if (error) throw error
  return data
}

export async function getScores() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('total_score', { ascending: false })

  if (error) throw error
  return data || []
}
