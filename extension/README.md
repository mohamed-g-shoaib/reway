# Reway Browser Extension

This Chrome extension allows you to quickly save bookmarks to your Reway dashboard and open groups of bookmarks.

## Installation

1. **Enable Developer Mode**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" in the top-right corner

2. **Load the Extension**
   - Click "Load unpacked"
   - Select this `extension` folder
   - The Reway icon should appear in your browser toolbar

3. **Add Required Icons** (IMPORTANT)
   - Create an `icons` folder inside this directory
   - Add the following PNG files:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - These icons are required for Chrome to display the extension properly

## Setup

1. **Get API Token**
   - Open your Reway dashboard
   - Click on your avatar → "Manage access tokens"
   - Generate a new token

2. **Configure Extension**
   - Click the Reway extension icon in Chrome
   - Enter your API token in the "Extension Token" field
   - Enter your dashboard URL (e.g., `https://your-app.vercel.app`)
   - Click "Save Settings"

## Features

- **Save Current Page**: Quickly bookmark the current tab
- **Auto-fill**: Automatically detects page title and description
- **Group Selection**: Choose which group to save bookmarks to
- **Dashboard Integration**: Seamlessly works with the Reway dashboard

## Testing

Open `test.html` in Chrome to verify the extension is properly installed and communicating.

## Troubleshooting

- **Extension not detected**: Ensure all files are in place and developer mode is enabled
- **Icons not showing**: Make sure the `icons` folder contains all three PNG files
- **API errors**: Verify your token is correct and your dashboard URL is accessible
- **Saving fails**: Check the extension popup for error messages

## File Structure

```
extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js           # Popup logic and API calls
├── popup.css          # Popup styling
├── background.js      # Service worker for tab management
├── content-script.js  # Page content interaction
├── test.html          # Installation test page
└── icons/             # Extension icons (you need to add these)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
