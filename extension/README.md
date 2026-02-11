# Reway Browser Extension

This Chrome extension lets you save pages (and link batches) directly into your Reway dashboard.

## Installation (Manual)

1. **Download the extension ZIP**
   - Download the ZIP file you received
   - Unzip it into a folder (keep the folder contents intact)

2. **Enable Developer Mode**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" in the top-right corner

3. **Load the extension**
   - Click "Load unpacked"
   - Select the unzipped extension folder (the one that contains `manifest.json`)
   - The Reway icon should appear in your browser toolbar

## Setup

1. **Log in to Reway**
   - Open the Reway dashboard and log in

2. **Open the extension**
   - Click the Reway extension icon
   - If you’re not logged in, the extension will ask you to log in

## Features

- **Save Page**: Save the current tab with title/description and an optional group
- **Save Links**: Build a list of links and save them as a group
- **Tab Session**: Save your current window’s tabs as a group
- **Dashboard integration**: If the dashboard is open, the extension broadcasts new saves

## Testing

Open `test.html` in Chrome to verify the extension is properly installed and communicating.

## Troubleshooting

- **Extension not detected**: Ensure all files are in place and developer mode is enabled
- **Icons not showing**: Make sure the `icons` folder contains all three PNG files
- **Login required**: Open the Reway dashboard and log in first, then reopen the extension popup
- **Saving fails**: Check the extension popup for error messages and ensure the extension has access to your Reway domain

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
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
