// Check if Settings sheet is configured
import dotenv from 'dotenv'
import { getGameSettings } from './utils/sheets.js'

dotenv.config({ path: '../.env' })

async function checkSettings() {
  try {
    console.log('Checking Settings sheet...\n')
    const settings = await getGameSettings()
    console.log('✅ Settings found:')
    console.log(JSON.stringify(settings, null, 2))
    console.log('\nExpected settings:')
    console.log('  - submission_locked: "false" or "true"')
    console.log('  - deadline: (optional) ISO date string')
  } catch (error) {
    console.error('❌ Error reading Settings sheet:')
    console.error(error.message)
    console.error('\nMake sure Sheet 5 (Settings) has:')
    console.error('  - Headers: Key | Value')
    console.error('  - Row 1 data: submission_locked | false')
  }
}

checkSettings()
