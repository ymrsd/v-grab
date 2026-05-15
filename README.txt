# Video Snapper Pro - CORS Fix

## Files Added/Changed:

1. **netlify/functions/download.js** - Serverless function to bypass CORS
2. **netlify.toml** - Netlify config for functions
3. **src/App.js** - Updated to call Netlify function + 5s ad modal
4. **public/index.html** - Ad modal system (no changes to your existing SEO)

## Deploy Steps:

```bash
# 1. Copy these files to your project
# 2. Install netlify-cli (if not installed)
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod
```

Or push to GitHub - Netlify auto-deploys.

## How it works:
- Browser calls `/.netlify/functions/download` (same origin = no CORS)
- Netlify server calls `api.cobalt.tools` (server-to-server = no CORS)
- Response forwarded back to browser
- Video auto-downloads after 5s ad

## Ad System:
- Ad modal shows only on Download button click
- 5 second countdown timer
- Auto hides after 5s
- Video download starts automatically
