import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
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
      name: submission.name,
      picks: submission.picks,
      trade_up: submission.tradeUp || [],
      trade_down: submission.tradeDown || []
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
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()

  if (error) throw error
  return data[0]
}

// Draft Results
export async function saveDraftResults(results) {
  // Clear existing results
  await supabase.from('draft_results').delete().neq('id', 0)

  // Insert new results
  const { data, error } = await supabase
    .from('draft_results')
    .insert(results)
    .select()

  if (error) throw error
  return data
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
  // Clear existing scores
  await supabase.from('scores').delete().neq('id', 0)

  // Insert new scores
  const { data, error } = await supabase
    .from('scores')
    .insert(scores)
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
