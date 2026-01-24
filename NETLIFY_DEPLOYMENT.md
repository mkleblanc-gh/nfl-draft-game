# Deploy to Netlify - Step by Step

This guide shows how to deploy your NFL Draft Game to Netlify for free hosting.

## Prerequisites

- ✅ Node.js installed
- ✅ Project dependencies installed (`npm install` in both root and `api` folders)
- ✅ Google Sheets set up and configured
- ✅ `.env` file configured with your credentials
- ✅ Tested locally and working

## Method 1: Netlify CLI (Recommended)

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate with your Netlify account.

### Step 3: Initialize the Site

From your project root directory:

```bash
netlify init
```

Follow the prompts:
- **Create & configure a new site**: Yes
- **Team**: Choose your team (usually your username)
- **Site name**: `nfl-draft-game-2026` (or your preferred name)
- **Build command**: `npm run build`
- **Directory to deploy**: `dist`
- **Netlify functions folder**: `netlify/functions`

### Step 4: Set Environment Variables

```bash
netlify env:set GOOGLE_SHEET_ID "your_sheet_id_here"
netlify env:set GOOGLE_SERVICE_ACCOUNT_EMAIL "your-service-account@project.iam.gserviceaccount.com"
netlify env:set GOOGLE_PRIVATE_KEY "-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
netlify env:set ADMIN_PASSWORD "your_secure_password"
netlify env:set NODE_ENV "production"
```

**Important for GOOGLE_PRIVATE_KEY**:
- Include the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters as-is
- Wrap the entire value in quotes

### Step 5: Deploy

```bash
netlify deploy --prod
```

Your site will be deployed! Netlify will give you a URL like:
`https://nfl-draft-game-2026.netlify.app`

## Method 2: Netlify Dashboard (Git-based)

### Step 1: Push to Git (GitHub, GitLab, or Bitbucket)

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit - NFL Draft Game"
```

Create a repository on GitHub/GitLab/Bitbucket and push:

```bash
git remote add origin https://github.com/yourusername/nfl-draft-game.git
git branch -M main
git push -u origin main
```

**Important**: Make sure `.env` is in `.gitignore` (it already is) so your credentials don't get committed!

### Step 2: Connect to Netlify

1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your `nfl-draft-game` repository

### Step 3: Configure Build Settings

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

Click "Deploy site"

### Step 4: Add Environment Variables

1. In your Netlify site dashboard, go to **Site settings**
2. Click **Environment variables** in the left sidebar
3. Click **Add a variable** and add each one:

```
Key: GOOGLE_SHEET_ID
Value: your_google_sheet_id

Key: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: your-service-account@project-id.iam.gserviceaccount.com

Key: GOOGLE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----
Paste your full private key here (with \n preserved)
-----END PRIVATE KEY-----

Key: ADMIN_PASSWORD
Value: your_secure_password

Key: NODE_ENV
Value: production
```

### Step 5: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** > **Deploy site**

## Verify Deployment

### Test Your Live Site

1. Visit your Netlify URL (e.g., `https://nfl-draft-game-2026.netlify.app`)
2. Check that players load (Tests Google Sheets connection)
3. Try making a test submission with your name
4. Go to Admin panel and verify you can login
5. Check the leaderboard shows your submission

### Common Issues

**Players not loading?**
- Check environment variables are set correctly
- Verify GOOGLE_SHEET_ID matches your sheet
- Check that Google Sheet is shared with service account

**Functions failing?**
- Make sure `netlify/functions` folder exists
- Verify build completed successfully
- Check Function logs in Netlify dashboard

**Admin password not working?**
- Double-check ADMIN_PASSWORD environment variable
- Make sure there are no extra spaces
- Redeploy after setting env variables

## Update Your Site

After making code changes:

### Using CLI:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Netlify will automatically rebuild and deploy!

Or manually:
```bash
netlify deploy --prod
```

### Using Dashboard:
Just push to Git, and Netlify auto-deploys!

## Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Site settings** > **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `nfldraft.yoursite.com`)
4. Follow DNS configuration instructions
5. Netlify provides free SSL certificate automatically!

## Netlify CLI Commands Reference

```bash
# Deploy to draft URL (for testing)
netlify deploy

# Deploy to production
netlify deploy --prod

# Open site in browser
netlify open:site

# Open admin dashboard
netlify open:admin

# View environment variables
netlify env:list

# View function logs
netlify functions:log

# Check build status
netlify status
```

## Monitoring

### View Logs

1. Go to your site in Netlify dashboard
2. Click **Functions** tab
3. Click on any function to see logs
4. Useful for debugging Google Sheets issues

### Check Deploys

1. Click **Deploys** tab
2. See build logs for each deployment
3. View build errors if something fails

## Costs

Netlify Free Tier includes:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 125k function requests/month
- ✅ Continuous deployment from Git
- ✅ Free SSL certificate
- ✅ Custom domain support

This is **more than enough** for a draft game with friends/family!

## Next Steps

1. ✅ Test your deployed site thoroughly
2. 📱 Test on mobile devices
3. 👥 Share the URL with your group
4. 📊 Monitor submissions in Google Sheets
5. 🏈 Run the game on draft day!

## Helpful Links

- Your Netlify Dashboard: [https://app.netlify.com/](https://app.netlify.com/)
- Netlify Docs: [https://docs.netlify.com/](https://docs.netlify.com/)
- Your Google Sheet: (bookmark it!)

## Troubleshooting

**Build fails:**
- Check build logs in Netlify dashboard
- Verify `package.json` has correct dependencies
- Make sure all files are committed to Git

**Environment variables not working:**
- Redeploy after setting env variables
- Check for typos in variable names
- Verify values have proper formatting

**Google Sheets errors:**
- Check service account has Editor access to sheet
- Verify Sheet ID is correct
- Test the private key formatting

Need help? Check the main [README.md](README.md) for more troubleshooting tips!
