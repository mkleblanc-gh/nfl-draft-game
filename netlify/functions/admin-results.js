import { saveDraftResults } from '../../api/utils/supabase.js'

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { password, results, tradesUp = [], tradesDown = [] } = JSON.parse(event.body)

    if (!verifyPassword(password)) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Invalid password',
          debug: {
            passwordReceived: !!password,
            passwordLength: password?.length ?? 0,
            envVarSet: !!process.env.ADMIN_PASSWORD,
            envVarLength: process.env.ADMIN_PASSWORD?.length ?? 0
          }
        })
      }
    }

    if (!results || !Array.isArray(results)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid results data' })
      }
    }

    await saveDraftResults(results, tradesUp, tradesDown)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Draft results saved successfully' })
    }
  } catch (error) {
    console.error('Error saving draft results:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save draft results' })
    }
  }
}
