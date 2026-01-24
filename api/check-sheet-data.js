// Detailed check of Google Sheet data
import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

dotenv.config({ path: '../.env' })

async function checkSheetData() {
  try {
    console.log('Connecting to Google Sheet...\n')

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)
    await doc.loadInfo()

    console.log('📊 Sheet Info:')
    console.log('  Title:', doc.title)
    console.log('  Total sheets:', doc.sheetCount)
    console.log('')

    // Check all sheets
    for (let i = 0; i < doc.sheetCount; i++) {
      const sheet = doc.sheetsByIndex[i]
      console.log(`Sheet ${i + 1}: "${sheet.title}"`)
      console.log(`  Rows: ${sheet.rowCount}`)
      console.log(`  Columns: ${sheet.columnCount}`)

      // Load the headers and first few rows
      await sheet.loadHeaderRow()
      console.log('  Headers:', sheet.headerValues.join(', '))

      const rows = await sheet.getRows({ limit: 5 })
      console.log(`  Data rows: ${rows.length}`)

      if (rows.length > 0) {
        console.log('  First row data:')
        rows[0]._sheet.headerValues.forEach(header => {
          const value = rows[0].get(header)
          if (value) {
            console.log(`    ${header}: ${value}`)
          }
        })
      }
      console.log('')
    }

    console.log('✅ Sheet check complete!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkSheetData()
