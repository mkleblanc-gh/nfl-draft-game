import { getTeams } from '../../api/utils/supabase.js'

export async function handler(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const teams = await getTeams()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teams)
    }
  } catch (error) {
    console.error('Error fetching teams:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch teams' })
    }
  }
}
