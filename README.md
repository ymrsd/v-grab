# VideoVault - Premium Multi-Platform Video Downloader

A luxury, professional video downloader built with **React**, **Tailwind CSS**, and **Lucide React** icons.

![VideoVault](https://img.shields.io/badge/VideoVault-Premium%20Downloader-purple)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-cyan)

## Features

- **Multi-Platform Support**: YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo
- **Dark Luxury Theme**: Premium dark UI with glassmorphism effects
- **Ad Integration**: Automatic ad display with countdown timer
- **Download Limit**: 20 free downloads per day (configurable)
- **Premium Upgrade**: Unlock unlimited downloads
- **Download History**: Track all your downloads with timestamps
- **Responsive Design**: Works on all devices (desktop, tablet, mobile)
- **Secure API**: RapidAPI integration with Axios
- **Download Progress**: Real-time progress bar during downloads
- **Quality Selection**: Choose from 360p to 4K quality
- **Copy to Clipboard**: Copy video URLs from history
- **Daily Reset**: Download count resets automatically at midnight

## Screenshots

### Home Page
- Beautiful hero section with animated background
- URL input with platform detection
- Download counter with progress bar
- Features grid with hover effects

### Video Results
- Platform-specific color theming
- Thumbnail preview with video info
- Multiple quality options
- Download progress tracking

### History Tab
- Complete download history
- Platform badges with colors
- Copy URL functionality
- Delete individual items or clear all

### Premium Tab
- Pricing comparison
- Feature list
- FAQ section

## Quick Start

### 1. Create React App

```bash
npx create-react-app videovault
cd videovault
```

### 2. Install Dependencies

```bash
npm install axios lucide-react
```

### 3. Setup Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Configure Tailwind

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Add Files

- Copy `App.js` to `src/App.js`
- Copy `index.css` to `src/index.css`
- Copy `index.js` to `src/index.js`

### 6. Start Development

```bash
npm start
```

## Configuration

### API Key Setup

Replace the RapidAPI key in `App.js`:

```javascript
headers: {
  'X-RapidAPI-Key': 'YOUR_API_KEY_HERE',
  'X-RapidAPI-Host': 'social-media-video-downloader.p.rapidapi.com'
}
```

Get your API key from [RapidAPI](https://rapidapi.com/).

### Ad Link

Update the ad link in `App.js`:

```javascript
const AD_LINK = 'https://your-ad-link-here';
```

### Download Limit

Change the free download limit:

```javascript
const MAX_FREE_DOWNLOADS = 20;
```

### Ad Frequency

Modify the ad trigger logic in `App.js`:

```javascript
if ((downloadCount > 0 && downloadCount % 3 === 0) || downloadCount === 0) {
  // Show ad every 3rd download
}
```

## Project Structure

```
videovault/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main application
│   ├── index.css       # Tailwind + custom styles
│   └── index.js        # Entry point
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Customization

### Colors

Edit CSS variables in `index.css` to change the theme colors.

### Platforms

Add new platforms by updating the `detectPlatform` function:

```javascript
const detectPlatform = (url) => {
  const lower = url.toLowerCase();
  if (lower.includes('newplatform.com')) return 'newplatform';
  // ... existing platforms
};
```

### Animations

All animations are defined in `tailwind.config.js`:

- `animate-slide-in`: Slide up animation
- `animate-scale-in`: Scale up animation
- `animate-pulse-glow`: Pulsing glow effect
- `animate-float`: Floating animation
- `animate-shimmer`: Shimmer loading effect

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lazy loading for images
- Optimized animations with `will-change`
- Reduced motion support for accessibility
- Efficient state management with React hooks

## Security

- SSL encrypted downloads
- No personal data storage
- LocalStorage for download count only
- Secure API calls with headers

## License

For personal use only. Respect platform terms of service.

## Disclaimer

This tool is for educational purposes. Respect copyright laws and platform terms.

## Support

For support, contact us at support@videovault.com

---

Built with love using React & Tailwind CSS
