# Intercom Setup Instructions

## 📍 Where to Find Your Intercom App ID

1. **Log into Intercom**:
   - Go to https://app.intercom.com
   - Use your trial account credentials

2. **Navigate to Installation Settings**:
   - Click on **Settings** (gear icon) in the left sidebar
   - Select **Installation** → **Web**
   - Or go directly to: https://app.intercom.com/a/apps/_/settings/web

3. **Copy Your App ID**:
   - You'll see a section called "Install Intercom on your website"
   - Look for: `app_id: "YOUR_APP_ID"`
   - Your App ID looks like: `abc123def` or similar
   - Copy this ID

## 📝 How to Update Your Application

**File to Edit**: `client/public/index.html`

**Find this line** (appears twice):
```javascript
app_id: "YOUR_INTERCOM_APP_ID"
```

**Replace with**:
```javascript
app_id: "abc123def"  // Your actual App ID
```

**Also find** (in the script src):
```javascript
s.src='https://widget.intercom.io/widget/YOUR_INTERCOM_APP_ID';
```

**Replace with**:
```javascript
s.src='https://widget.intercom.io/widget/abc123def';  // Your actual App ID
```

## 🔄 After Updating

If already deployed:
```bash
git add client/public/index.html
git commit -m "Add Intercom App ID"
git push
```

Netlify will automatically redeploy with the new Intercom integration!

## ✅ How to Verify It's Working

1. Visit your deployed site
2. Look for the Intercom widget (usually bottom-right corner)
3. Open browser console (F12)
4. Look for Intercom-related messages (should not have errors)
5. Run Test #6 (Intercom Widget Test) - it should PASS

## 🚫 Common Issues

**Widget doesn't appear**:
- Double-check App ID is correct
- Disable ad blockers
- Enable third-party cookies
- Check browser console for errors

**Test fails even though widget is visible**:
- Wait 5 seconds for the test (it has a delay)
- Refresh the page and try again
- Check if Intercom script loaded in Network tab

## 📞 Need Help?

If you can't find your App ID or have issues:
- Check Intercom's help docs: https://www.intercom.com/help/en/articles/167-install-intercom-on-your-website
- Contact Intercom support through your trial account
