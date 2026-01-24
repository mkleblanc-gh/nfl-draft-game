// Quick test to verify Google Sheets connection
import dotenv from 'dotenv'
import { getPlayers as getPlayersFromSheet } from './utils/sheets.js'

dotenv.config({ path: '../.env' })

async function testConnection() {
  try {
    console.log('Testing Google Sheets connection...')
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID ? '✓ Set' : '✗ Missing')
    console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Missing')
    console.log('Private Key:', process.env.GOOGLE_PRIVATE_KEY ? '✓ Set (length: ' + (process.env.GOOGLE_PRIVATE_KEY?.length || 0) + ')' : '✗ Missing')
    console.log('')

    console.log('Attempting to connect to Google Sheet...')
    const players = await getPlayersFromSheet()

    console.log('✅ SUCCESS! Connected to Google Sheet!')
    console.log('')
    console.log(`Found ${players.length} players in the Players sheet`)

    if (players.length > 0) {
      console.log('')
      console.log('First few players:')
      players.slice(0, 5).forEach((player, index) => {
        console.log(`  ${index + 1}. ${player.name} - ${player.position} (${player.college})`)
      })
    } else {
      console.log('')
      console.log('⚠️  Warning: No players found in the Players sheet')
      console.log('   Add some players to the "Players" sheet in your Google Sheet')
    }

    console.log('')
    console.log('✅ Google Sheets connection is working!')
    console.log('')
    console.log('Next step: Start the development servers')
    console.log('  Terminal 1: cd api && npm run dev')
    console.log('  Terminal 2: npm run dev')
    console.log('')
    console.log('Then visit: http://localhost:3000')

  } catch (error) {
    console.error('❌ ERROR: Failed to connect to Google Sheets')
    console.error('')
    console.error('Error message:', error.message)
    console.error('')
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('Network error - check your internet connection')
    } else if (error.message.includes('403') || error.message.includes('permission')) {
      console.error('Permission denied - make sure:')
      console.error('  1. The Google Sheet is shared with your service account email')
      console.error('  2. The service account has "Editor" permissions')
    } else if (error.message.includes('404')) {
      console.error('Sheet not found - check your GOOGLE_SHEET_ID in .env')
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.error('Authentication failed - check:')
      console.error('  1. GOOGLE_SERVICE_ACCOUNT_EMAIL is correct')
      console.error('  2. GOOGLE_PRIVATE_KEY is formatted correctly (with \\n)')
    }
    console.error('')
    console.error('Common issues:')
    console.error('  1. Sheet ID is incorrect in .env')
    console.error('  2. Sheet is not shared with the service account email')
    console.error('  3. Private key needs \\n for line breaks (not actual newlines)')
    console.error('  4. Google Sheets API is not enabled in Google Cloud Console')
    console.error('')
    process.exit(1)
  }
}

testConnection()
