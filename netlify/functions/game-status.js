import { getGameSettings } from '../../api/utils/sheets.js'

export async function handler(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const settings = await getGameSettings()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locked: settings.submission_locked === 'true',
        deadline: settings.deadline || null
      })
    }
  } catch (error) {
    console.error('Error fetching game status:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch game status' })
    }
  }
}
