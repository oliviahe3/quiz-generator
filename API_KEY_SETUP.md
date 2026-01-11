# How to Get Your Gemini API Key

## Step 1: Get Your API Key

1. **Visit**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key" or "Get API Key"
4. **Copy** the API key that appears

## Step 2: Update the .env File

1. **Open** the file: `server\.env` in a text editor (Notepad, VS Code, etc.)
2. **Find** this line:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. **Replace** `your_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   ```
4. **Save** the file

## Step 3: Restart the Backend Server

After updating the API key, you need to restart the backend server:

1. **Find** the PowerShell window running the backend server (it should say "Backend Server - Port 5000")
2. **Press** `Ctrl+C` to stop it
3. **Run** this command in that window:
   ```powershell
   npm start
   ```

Or I can restart it for you after you update the key!

## Quick Test

Once you've added your API key and restarted the server, try generating a quiz again. It should work!

---

**Note**: The API key should look something like: `AIzaSyC...` (it's a long string of letters and numbers)
