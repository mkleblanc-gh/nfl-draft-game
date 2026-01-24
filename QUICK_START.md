# Quick Start Commands

Once you've completed setup, use these commands to work with the app.

## First Time Setup

```bash
# 1. Install Node.js from nodejs.org

# 2. Install dependencies
npm install
cd api && npm install && cd ..

# 3. Copy environment file
cp .env.example .env

# 4. Edit .env with your Google Sheets credentials
# (Use Notepad, VS Code, or any text editor)

# 5. Set up Google Sheets (see SETUP_GUIDE.md)
```

## Development

### Start the App Locally

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd api
npm run dev
```
Backend runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on http://localhost:3000

Visit http://localhost:3000 in your browser.

## Deployment

### Deploy to Vercel

```bash
# First time
vercel login
vercel

# After making changes
vercel --prod
```

## Common Tasks

### Update Player List

1. Open your Google Sheet
2. Go to the "Players" tab
3. Add/edit rows with player data:
   ```
   PlayerName | Position | College | Projected Round
   ```

### Lock Submissions (Before Draft)

Option 1 - Via Admin Panel:
1. Go to your app URL
2. Click "Admin" tab
3. Login with password
4. Click "Lock Submissions"

Option 2 - Via Google Sheets:
1. Open your Google Sheet
2. Go to "Settings" tab
3. Change `submission_locked` value from `false` to `true`

### Enter Draft Results (On Draft Day)

1. Go to your app URL
2. Click "Admin" tab
3. Login with password
4. Go to "Draft Results" tab
5. Enter each pick as it happens
6. Click "Submit Results & Calculate Scores"

The app will automatically calculate scores!

### View/Export Results

Option 1 - Leaderboard:
- Click "Leaderboard" tab in the app

Option 2 - Google Sheets:
- Open your Google Sheet
- Go to "Scores" tab
- All scores are there (can download as CSV/Excel)

## Project Structure Quick Reference

```
Important Files:
├── src/App.jsx              - Main app (edit to change layout)
├── src/components/          - React components
│   ├── DraftPicks.jsx       - Pick selection UI
│   ├── Leaderboard.jsx      - Scores display
│   └── AdminPanel.jsx       - Admin controls
├── api/utils/scoring.js     - Scoring logic (edit rules here)
├── api/utils/sheets.js      - Google Sheets integration
└── .env                     - Your credentials (NEVER commit this!)
```

## Environment Variables

Your `.env` file should have:
```
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
ADMIN_PASSWORD=your_secure_password
NODE_ENV=development
```

**For Vercel deployment**, add these same variables in:
Vercel Dashboard → Your Project → Settings → Environment Variables

## Troubleshooting

### Port already in use

If you see "Port 3000 is already in use":
```bash
# Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
npm run dev -- --port 3001
```

### Google Sheets not working

1. Check if sheet is shared with service account email
2. Verify GOOGLE_SHEET_ID is correct (from URL)
3. Check GOOGLE_PRIVATE_KEY has \n characters
4. Make sure Google Sheets API is enabled

### Cannot deploy to Vercel

1. Make sure you're logged in: `vercel login`
2. Check environment variables are set in Vercel dashboard
3. Redeploy: `vercel --prod`

### Submissions not saving

1. Check "Settings" sheet - is `submission_locked` set to `false`?
2. Check browser console for errors (F12)
3. Verify Google Sheets permissions

## URLs

- Local app: http://localhost:3000
- Local API: http://localhost:3001/api
- Vercel dashboard: https://vercel.com/dashboard
- Google Cloud Console: https://console.cloud.google.com/
- Your Google Sheet: (bookmark it!)

## Next Steps

1. ✅ Complete setup (see SETUP_GUIDE.md)
2. 📝 Add 50+ players to Players sheet
3. 🧪 Test locally with a friend
4. 🚀 Deploy to Vercel
5. 📱 Share URL with your group
6. 🏈 Run the game on draft day!

## Need More Help?

- Full setup instructions: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Complete documentation: [README.md](README.md)
- Google Sheets template: [GOOGLE_SHEETS_TEMPLATE.md](GOOGLE_SHEETS_TEMPLATE.md)
