# Vercel Deployment Guide

## Steps to Deploy on Vercel:

1. **Install Vercel CLI** (if not already installed):
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```powershell
   vercel login
   ```

3. **Deploy**:
   ```powershell
   vercel
   ```
   - Follow the prompts
   - It will ask if you want to link to an existing project or create new
   - Choose your settings

4. **Set Environment Variable**:
   After deployment, you need to add your API key:
   
   - Go to your project dashboard on Vercel
   - Click on "Settings" → "Environment Variables"
   - Add: 
     - Key: `GEMENAI_API_KEY`
     - Value: `AIzaSyArZOA0qRtb6r5u8MAd_gXih_-sUTNLgLc`
   - Click "Save"

5. **Redeploy** (after adding env variable):
   ```powershell
   vercel --prod
   ```

## Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variable `GEMENAI_API_KEY` in project settings
6. Deploy!

Your chatbot will be live with a URL like: `your-project.vercel.app`

## Important Notes:
- The `vercel.json` file is already configured
- Your API key will be securely stored in Vercel's environment variables
- Both frontend and backend will work seamlessly together
- No code changes needed - it works with your existing setup!
