import { resetResults } from '../../api/utils/supabase.js'

function verifyPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { password } = JSON.parse(event.body)

    if (!verifyPassword(password)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' })
      }
    }

    await resetResults()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Results reset successfully' })
    }
  } catch (error) {
    console.error('Error resetting results:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to reset results' })
    }
  }
}
