# NFL Draft Game 2026

A web application for hosting an NFL draft prediction game where users predict all 32 first-round picks and trade movements.

## Features

- Mobile-friendly interface for making predictions
- No login required - users just enter their name
- Predict all 32 first-round draft picks
- Predict teams that will trade up/down
- Automatic scoring based on actual draft results
- Real-time leaderboard
- Admin panel for managing the game
- Data stored in Google Sheets for easy access

## Scoring Rules

- **1 point**: Player picked is drafted in the first round
- **3 points**: Correct player and pick number (any team)
- **5 points**: Correct player + pick number + team
- **2 points**: Each team correctly predicted in trades (up or down)

*Note: Points don't stack. Perfect match = 5 points total, not 1+3+5*

## Tech Stack

- **Frontend**: React with Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js/Express (serverless on Vercel)
- **Database**: Google Sheets API
- **Hosting**: Vercel (free tier)

## Prerequisites

1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org/) (v18 or higher)
2. **Google Cloud Account**: For Google Sheets API access
3. **Vercel Account**: For deployment (free tier available)

## Setup Instructions

### 1. Install Node.js

If you don't have Node.js installed:
- Download from [nodejs.org](https://nodejs.org/)
- Install the LTS version
- Verify installation: `node --version` and `npm --version`

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### 3. Set Up Google Sheets

#### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Click "Create and Continue"
5. Skip granting roles (click "Continue" then "Done")
6. Click on the created service account
7. Go to "Keys" tab
8. Click "Add Key" > "Create New Key"
9. Choose JSON format
10. Download the key file (keep it secure!)

#### Create Google Sheet

1. Create a new Google Sheet
2. Share it with the service account email (found in the JSON key file)
   - Give "Editor" permissions
3. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - Copy the `SHEET_ID` part

#### Set Up Sheet Structure

Create 5 sheets (tabs) in your Google Sheet:

**Sheet 1: Submissions** (this will be auto-populated by the app)
Headers: Name | Pick1_Player | Pick1_Position | Pick1_College | ... (repeat for all 32 picks) | TradeUp1 | TradeUp2 | TradeUp3 | TradeDown1 | TradeDown2 | TradeDown3 | Timestamp

**Sheet 2: Players**
Headers: PlayerName | Position | College | Projected Round

Sample data (add more prospects):
```
Travis Hunter | CB/WR | Colorado | 1
Shedeur Sanders | QB | Colorado | 1
Abdul Carter | EDGE | Penn State | 1
Tetairoa McMillan | WR | Arizona | 1
Will Johnson | CB | Michigan | 1
```

**Sheet 3: Draft Results** (admin will fill this)
Headers: Pick | Team | ActualPlayer

**Sheet 4: Scores** (auto-populated by scoring calculation)
Headers: Name | FirstRoundPoints | PickNumberPoints | TeamPoints | TradePoints | TotalScore | Timestamp

**Sheet 5: Settings**
Headers: Key | Value

Add one row:
```
submission_locked | false
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```
   GOOGLE_SHEET_ID=your_google_sheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key from JSON file\n-----END PRIVATE KEY-----\n"
   ADMIN_PASSWORD=choose_a_secure_password
   NODE_ENV=development
   ```

   **Important**:
   - The private key must include the full key with BEGIN and END lines
   - Keep the quotes around the private key
   - Use `\n` for line breaks in the key

### 5. Run Locally

Start the development servers:

```bash
# Terminal 1: Start backend API
cd api
npm run dev

# Terminal 2: Start frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Choose your account
- Link to existing project? **No**
- What's your project's name? **nfl-draft-game** (or your choice)
- In which directory is your code located? **./
- Want to modify settings? **No**

### 4. Set Environment Variables in Vercel

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to Settings > Environment Variables
3. Add each variable from your `.env` file:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `ADMIN_PASSWORD`
   - `NODE_ENV` = `production`

4. Redeploy:
   ```bash
   vercel --prod
   ```

Your app is now live at the URL provided by Vercel!

## Usage

### For Players

1. Visit the app URL
2. Click "Make Picks"
3. Select a player for each of the 32 picks
4. Predict which 3 teams will trade up and 3 teams will trade down
5. Enter your name and submit
6. Check the leaderboard after the draft!

### For Admins

1. Go to the Admin tab
2. Enter the admin password
3. **Before the draft**: Lock submissions to prevent new entries
4. **During/after the draft**: Enter actual draft results
5. Scores will calculate automatically
6. View the leaderboard to see winners

## Project Structure

```
nfl-draft-game/
├── src/                      # Frontend React app
│   ├── components/           # React components
│   │   ├── AdminPanel.jsx
│   │   ├── DraftPicks.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── SubmissionForm.jsx
│   │   └── TradePredictions.jsx
│   ├── utils/
│   │   └── api.js           # API client
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── api/                      # Backend Express API
│   ├── admin/               # Admin endpoints
│   │   ├── calculate.js
│   │   ├── lock.js
│   │   └── results.js
│   ├── utils/               # Utilities
│   │   ├── scoring.js       # Scoring logic
│   │   └── sheets.js        # Google Sheets helpers
│   ├── game-status.js
│   ├── leaderboard.js
│   ├── players.js
│   ├── submissions.js
│   ├── teams.js
│   └── server.js            # Express server
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── vercel.json              # Vercel configuration
└── package.json             # Dependencies

```

## Customization

### Update Draft Order

Edit the team list in [api/utils/sheets.js](api/utils/sheets.js) in the `getDefaultTeams()` function to match the actual 2026 draft order.

### Add More Players

Add rows to the "Players" sheet in your Google Spreadsheet with prospect information.

### Change Scoring Rules

Modify the scoring logic in [api/utils/scoring.js](api/utils/scoring.js).

## Troubleshooting

### "npm: command not found"
- Install Node.js from nodejs.org
- Restart your terminal after installation

### Google Sheets API errors
- Verify the sheet is shared with the service account email
- Check that the Sheet ID is correct
- Ensure the private key is properly formatted with `\n` for newlines

### Submissions not saving
- Check Google Sheets permissions
- Verify environment variables are set correctly
- Check the browser console for errors

### Scores not calculating
- Ensure draft results are entered in Sheet 3
- Verify at least one submission exists
- Check admin password is correct

## Future Enhancements

- ESPN API integration for automatic draft results
- Email notifications when results are posted
- Historical data from previous years
- More detailed statistics and analytics
- Social sharing features
- Support for rounds 2-7

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Google Sheets setup carefully
3. Check browser console for error messages
4. Verify all environment variables are set

## License

MIT License - feel free to modify and use for your own draft games!
