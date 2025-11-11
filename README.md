# 💨 Pressure Tracker - PWA for Sinus Headache Prevention

A mobile-friendly Progressive Web App (PWA) designed to help track barometric pressure changes and predict sinus headaches before they happen. **Install it on your phone like a native app!**

## ✨ Key Features

**Headache Prevention:**
- 🚨 **Smart Alerts** - Warns 24-48 hours before dangerous pressure drops
- 📊 **48-Hour Forecast Graph** - Visual pressure trends
- 📉 **Real-time Tracking** - 3-hour pressure change monitoring
- ⚡ **Risk Assessment** - Clear Low/Moderate/High indicators
- 🔔 **Push Notifications** - Alerts even when app is closed

**Mobile Optimized:**
- 📱 **Install as App** - Add to home screen, works like native app
- 🔄 **Works Offline** - View last data without internet
- 👆 **Touch-Friendly** - Large buttons, swipe-friendly interface
- ⚡ **Fast & Lightweight** - Loads instantly
- 🎨 **Clean Design** - Easy to read at a glance

## 📱 Installation on Phone

### iPhone/iPad:
1. Open the app in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App appears on your home screen!

### Android:
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"
5. App appears on your home screen!

Or just look for the **"📱 Install app"** banner at the top when you first open the site!

## 🚀 Setup Instructions

### 1. Get a Free API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" (completely free)
3. Navigate to "API Keys" in your account
4. Copy your API key

### 2. Add API Key to App

1. Open `app.js` in a text editor
2. Line 2: Replace `YOUR_OPENWEATHERMAP_API_KEY` with your key
3. Save the file

Example:
```javascript
const API_KEY = 'abc123def456ghi789jkl012mno345pq';
```

### 3. Run the App Locally (for testing)

**Option A: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

**Option B: Python**
```powershell
python -m http.server 8000
```
Open `http://localhost:8000`

**Option C: Node.js**
```powershell
npx http-server
```

### 4. Deploy Online (so she can access on phone)

**GitHub Pages (Recommended - Free & Easy):**
1. Create a GitHub account
2. Create new repository (e.g., "pressure-tracker")
3. Upload all files
4. Go to Settings → Pages
5. Select main branch → Save
6. Your app will be live at: `https://yourusername.github.io/pressure-tracker`

**Netlify (Alternative - Drag & Drop):**
1. Go to [Netlify](https://www.netlify.com/)
2. Drag your folder to deploy
3. Done! You get a live URL instantly

## 📱 How to Use on Mobile

1. **First Time Setup:**
   - Open the app
   - Tap "📍 My Location" OR type city name
   - Tap "Install" banner to add to home screen

2. **Daily Use:**
   - Open app from home screen (like any app!)
   - Check the risk level
   - Read alerts for upcoming pressure drops
   - Plan preventive measures

3. **Enable Notifications:**
   - Go to Settings
   - Enable browser notifications
   - Get alerts even when app is closed

## 🎯 Mobile Features

- **Touch-Optimized:** All buttons are 48px minimum (easy to tap)
- **Responsive Text:** No zooming needed, everything scales perfectly
- **Pull to Refresh:** Swipe down to update data
- **Offline Mode:** See last data even without internet
- **Low Data Usage:** Updates only every 30 minutes
- **Battery Friendly:** Minimal background processing

## 💡 Understanding the Data

- **Current Pressure:** Real-time barometric pressure in hPa
- **3-Hour Change:** How fast pressure is changing (key headache indicator)
- **Risk Level:**
  - ✓ **Low** - Stable pressure, low headache risk
  - ⚡ **Moderate** - Some pressure change expected
  - ⚠️ **High** - Significant drop coming, take preventive action
- **Graph:** Visual forecast for next 48 hours

## 🔧 Troubleshooting

**Can't install on iPhone:**
- Must use Safari browser (not Chrome/Firefox)
- iOS 11.3+ required

**Can't install on Android:**
- Use Chrome browser
- Android 5.0+ required

**"City not found" error:**
- Try adding country: "London,UK" or "Portland,US"
- Check spelling

**No data showing:**
- Verify API key is added in `app.js`
- Check internet connection
- Look for errors in browser console (F12)

**Location button not working:**
- Allow location permissions in browser
- May not work on HTTP (needs HTTPS when deployed)

## 🎨 Mobile UI Optimizations

- Minimum 48px touch targets for accessibility
- 16px font size prevents iOS auto-zoom
- Swipe-friendly chart canvas
- Landscape mode support
- Reduced motion for better battery life
- High contrast for outdoor visibility

## 📊 Technical Features

- **Progressive Web App (PWA)** - Installable, offline-capable
- **Service Worker** - Caches data for offline use
- **Web App Manifest** - Native app experience
- **Responsive Design** - Works on all screen sizes
- **Touch Events** - Optimized for mobile interaction
- **LocalStorage** - Saves last location and data

## 🔒 Privacy

- No data collection or tracking
- Location stays on your device
- No cookies, no analytics
- API calls only to OpenWeatherMap
- All data stored locally

## 📝 Tips for Your Friend

1. **Install it:** Works much better as installed app
2. **Check Morning & Night:** Best times to catch pressure changes
3. **Enable Notifications:** Never miss an alert
4. **Bookmark Multiple Locations:** If she travels
5. **Adjust Sensitivity:** Everyone's trigger is different (Settings)
6. **Keep Notes:** Track which changes actually cause her headaches

## 🆘 Support

If you need help:
- Check browser console (Settings → Developer Tools)
- Verify API key is correct
- Make sure HTTPS is enabled (when deployed)
- Test on different browser

## 📦 What's Included

```
pressure-tracker/
├── index.html          # Main app structure
├── style.css           # Mobile-optimized styling
├── app.js              # Core functionality + PWA
├── manifest.json       # PWA configuration
├── service-worker.js   # Offline support
├── icon-192.png        # App icon (small)
├── icon-512.png        # App icon (large)
└── README.md           # This file
```

## 🎯 Why This Beats Weather Apps

Regular weather apps focus on temperature and rain. This app:
- **Pressure-First Design** - Built specifically for pressure tracking
- **Headache Alerts** - Predicts triggers, not just weather
- **Customizable** - Adjust to her specific sensitivity
- **Cleaner Data** - No clutter, just what matters
- **Mobile-Optimized** - Quick glance on phone

---

**Made for sinus headache sufferers who need reliable pressure tracking on the go!** 💙

Remember: This is informational only. Severe headaches should be checked by a doctor.
