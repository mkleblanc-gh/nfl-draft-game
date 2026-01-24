// Quick test to verify Google Sheets connection
import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

dotenv.config()

async function testConnection() {
  try {
    console.log('Testing Google Sheets connection...')
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID ? '✓ Set' : '✗ Missing')
    console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Missing')
    console.log('Private Key:', process.env.GOOGLE_PRIVATE_KEY ? '✓ Set' : '✗ Missing')
    console.log('')

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)

    console.log('Loading sheet info...')
    await doc.loadInfo()

    console.log('✅ SUCCESS! Connected to Google Sheet!')
    console.log('')
    console.log('Sheet title:', doc.title)
    console.log('Sheets found:', doc.sheetCount)
    console.log('')
    console.log('Sheet tabs:')
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.title} (${sheet.rowCount} rows)`)
    })
    console.log('')
    console.log('✅ Google Sheets connection is working!')
    console.log('')
    console.log('Next step: Start the development servers')
    console.log('  Terminal 1: cd api && npm run dev')
    console.log('  Terminal 2: npm run dev')

  } catch (error) {
    console.error('❌ ERROR: Failed to connect to Google Sheets')
    console.error('')
    console.error('Error message:', error.message)
    console.error('')
    console.error('Common issues:')
    console.error('  1. Sheet ID is incorrect')
    console.error('  2. Sheet is not shared with the service account email')
    console.error('  3. Private key is not formatted correctly (needs \\n for line breaks)')
    console.error('  4. Google Sheets API is not enabled in Google Cloud Console')
    console.error('')
    console.error('Double-check your .env file and Google Sheet sharing settings.')
    process.exit(1)
  }
}

testConnection()
