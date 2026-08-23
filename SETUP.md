# Environment setup instructions

## Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally

## Development Notes

- The app uses Vite for fast development experience
- Hot Module Replacement (HMR) is enabled for instant updates
- React 18 with Strict Mode for better error detection
- CSS uses CSS Variables for consistent theming

## Troubleshooting

If you encounter any issues:

1. **Clear node_modules and reinstall**
   ```bash
   rm -r node_modules package-lock.json
   npm install
   ```

2. **Clear Vite cache**
   ```bash
   rm -r .vite
   npm run dev
   ```

3. **Check Node version**
   ```bash
   node --version
   ```
