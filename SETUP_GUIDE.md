# Quick Setup Guide

Follow these steps to get your NFL Draft Game up and running.

## Step 1: Install Node.js (5 minutes)

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (Long Term Support)
3. Run the installer with default settings
4. Open a new terminal/command prompt
5. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers for both commands.

## Step 2: Install Project Dependencies (2 minutes)

Open a terminal in the project directory and run:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

## Step 3: Set Up Google Sheets (15 minutes)

### 3.1 Create Google Cloud Project

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" > "New Project"
4. Name it "NFL Draft Game" and click "Create"
5. Wait for the project to be created

### 3.2 Enable Google Sheets API

1. In the search bar at the top, type "Google Sheets API"
2. Click on "Google Sheets API"
3. Click the blue "Enable" button
4. Wait for it to enable

### 3.3 Create Service Account

1. Click the hamburger menu (☰) > "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "Service account"
3. Enter a name: "nfl-draft-service"
4. Click "Create and Continue"
5. Skip the optional steps (click "Continue" then "Done")

### 3.4 Create and Download Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON"
5. Click "Create"
6. A JSON file will download - save it somewhere safe!

### 3.5 Create Your Google Sheet

1. Go to [https://docs.google.com/spreadsheets/](https://docs.google.com/spreadsheets/)
2. Create a new blank spreadsheet
3. Name it "NFL Draft Game 2026"

### 3.6 Share Sheet with Service Account

1. Open the JSON file you downloaded
2. Find the "client_email" field - it looks like: `name@project-id.iam.gserviceaccount.com`
3. Copy this email address
4. In your Google Sheet, click the "Share" button
5. Paste the service account email
6. Make sure it has "Editor" access
7. Uncheck "Notify people"
8. Click "Share"

### 3.7 Set Up Sheet Structure

**Create 5 sheets (tabs) at the bottom:**

1. Rename "Sheet1" to "Submissions"
2. Add 4 more sheets:
   - Click the "+" button at bottom left
   - Rename to "Players", "Draft Results", "Scores", "Settings"

**Sheet 1: Submissions**
Add this header row:
```
Name | Pick1_Player | Pick1_Position | Pick1_College | ... | Timestamp
```
(The app will auto-populate this - just add "Name" and "Timestamp" for now)

**Sheet 2: Players**
Add header row and sample data:
```
PlayerName | Position | College | Projected Round
Travis Hunter | CB/WR | Colorado | 1
Shedeur Sanders | QB | Colorado | 1
Abdul Carter | EDGE | Penn State | 1
Tetairoa McMillan | WR | Arizona | 1
Will Johnson | CB | Michigan | 1
Cam Ward | QB | Miami | 1
Mason Graham | DT | Michigan | 1
Kelvin Banks Jr. | OT | Texas | 1
Will Campbell | OT | LSU | 1
Mykel Williams | EDGE | Georgia | 1
```

**Sheet 3: Draft Results**
Add header row (leave data empty for now):
```
Pick | Team | ActualPlayer
```

**Sheet 4: Scores**
Add header row (app will populate this):
```
Name | FirstRoundPoints | PickNumberPoints | TeamPoints | TradePoints | TotalScore | Timestamp
```

**Sheet 5: Settings**
Add header row and initial setting:
```
Key | Value
submission_locked | false
```

### 3.8 Get Your Sheet ID

1. Look at the URL of your Google Sheet
2. It looks like: `https://docs.google.com/spreadsheets/d/LONG_ID_HERE/edit`
3. Copy the `LONG_ID_HERE` part - this is your Sheet ID

## Step 4: Configure Environment Variables (5 minutes)

1. In the project root, copy `.env.example` to `.env`
2. Open `.env` in a text editor
3. Fill in the values:

```env
GOOGLE_SHEET_ID=paste_your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=paste_client_email_from_json_here
GOOGLE_PRIVATE_KEY="paste_private_key_from_json_here"
ADMIN_PASSWORD=choose_a_secure_password
NODE_ENV=development
```

**For the GOOGLE_PRIVATE_KEY**:
1. Open the JSON file you downloaded
2. Find the "private_key" field
3. Copy the ENTIRE value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
4. Paste it in quotes, keeping the `\n` characters as-is

## Step 5: Test Locally (2 minutes)

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd api
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

You should see the app! Try:
- Viewing the player list
- Making a prediction
- Checking the leaderboard

## Step 6: Deploy to Vercel (10 minutes)

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Login

```bash
vercel login
```

Follow the prompts to login with your email/GitHub/GitLab.

### 6.3 Deploy

```bash
vercel
```

Answer the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? **nfl-draft-game**
- In which directory? **./**
- Want to override settings? **N**

### 6.4 Add Environment Variables

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your "nfl-draft-game" project
3. Go to "Settings" tab
4. Click "Environment Variables"
5. Add each variable from your `.env` file:
   - Name: `GOOGLE_SHEET_ID`, Value: (your sheet ID)
   - Name: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, Value: (your service account email)
   - Name: `GOOGLE_PRIVATE_KEY`, Value: (your full private key)
   - Name: `ADMIN_PASSWORD`, Value: (your password)
   - Name: `NODE_ENV`, Value: `production`

6. Click "Save" for each

### 6.5 Redeploy

```bash
vercel --prod
```

Your app is now live! Vercel will give you a URL like `https://nfl-draft-game.vercel.app`

## Step 7: Test Your Live App

1. Visit your Vercel URL
2. Test making a prediction
3. Go to Admin tab and login with your password
4. Try locking/unlocking submissions

## Next Steps

1. **Add more players**: Update the "Players" sheet with all top 2026 prospects
2. **Share with friends**: Send them the Vercel URL
3. **Set a deadline**: Update the Settings sheet with a submission deadline
4. **On draft day**:
   - Lock submissions via Admin panel
   - Enter results as picks are made
   - Scores calculate automatically!

## Troubleshooting

**Players not loading?**
- Check Sheet 2 has player data
- Verify sheet is shared with service account
- Check browser console for errors

**Can't submit predictions?**
- Make sure submissions aren't locked (Settings sheet)
- Check all 32 picks are selected
- Verify Google Sheets API is enabled

**Admin panel won't accept password?**
- Double-check ADMIN_PASSWORD in Vercel environment variables
- Redeploy after changing env variables

## Need Help?

Check the full [README.md](README.md) for detailed documentation and troubleshooting.
