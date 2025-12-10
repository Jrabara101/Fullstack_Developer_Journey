# Quick Start Guide

## Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd recipe-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features Overview

### 🍳 Recipes
- Browse 120 high-protein recipes across 6 categories
- Click any recipe card to see full details
- Filter by category using the category buttons

### 📊 BMI Calculator
- Adjust height and weight sliders
- See real-time BMI calculation
- Get category classification

### 📈 Daily Tracker
- Search for foods (currently using mock data)
- Add foods to your daily log
- Track your nutrition totals
- Adjust quantities with +/- buttons

### 🥗 Diet Programs
- Learn about different diet approaches
- Get information on intermittent fasting methods
- View benefits and recommendations

### 😴 Sleep Tracker
- Log your sleep times
- Rate sleep quality
- View 7-day history
- See average statistics

## API Setup (Optional)

For full food search functionality:

1. Sign up at [Edamam](https://www.edamam.com/)
2. Get your App ID and App Key
3. Create a `.env.local` file:
   ```
   EDAMAM_APP_ID=your_app_id
   EDAMAM_APP_KEY=your_app_key
   ```
4. Update `components/DailyTracker.tsx` to use these environment variables

## Troubleshooting

### Port Already in Use
If port 3000 is busy, Next.js will automatically use the next available port.

### Build Errors
Make sure all dependencies are installed:
```bash
npm install
```

### TypeScript Errors
The project uses TypeScript. Make sure your IDE is configured for TypeScript support.

## Next Steps

- Customize recipes in `lib/recipes.ts`
- Add your own styling in `tailwind.config.ts`
- Integrate real API keys for food search
- Add more features as needed!

Enjoy your Recipe Manager! 🎉

