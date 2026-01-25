import { getPlayers } from '../../api/utils/supabase.js'

export async function handler(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const players = await getPlayers()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(players)
    }
  } catch (error) {
    console.error('Error fetching players:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch players' })
    }
  }
}
