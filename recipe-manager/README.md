# Recipe Manager - High Protein Meal Planner

A comprehensive Next.js 16 application for managing high-protein recipes, tracking nutrition, calculating BMI, and monitoring sleep patterns.

## Features

### 🍳 Recipe Management
- **120 High-Protein Recipes** across 6 categories:
  - Breakfast (20 recipes)
  - Lunch (20 recipes)
  - Dinner (20 recipes)
  - Desserts (20 recipes)
  - Pre-Workout (20 recipes)
  - Post-Workout (20 recipes)
- Each recipe includes:
  - Detailed nutrition information (protein, carbs, fats, calories)
  - Ingredients list
  - Step-by-step instructions
  - Prep and cook times

### 📊 BMI Calculator
- Interactive height and weight sliders
- Real-time BMI calculation
- Category classification (Underweight, Normal, Overweight, Obese)
- Beautiful visual feedback

### 📈 Daily Food Tracker
- Search and add foods to your daily log
- Track calories, protein, carbs, and fats
- Visual progress bars for daily goals
- Quantity adjustment for each food item
- Integration with food APIs (Edamam)

### 🥗 Diet Programs & Intermittent Fasting
- **High Protein Diet** - Focus on lean proteins and complex carbs
- **16:8 Intermittent Fasting** - 16-hour fast, 8-hour eating window
- **18:6 Intermittent Fasting** - 18-hour fast, 6-hour eating window
- **20:4 Intermittent Fasting** - 20-hour fast, 4-hour eating window
- **Keto Diet** - Very low carb, high fat approach
- **Mediterranean Diet** - Heart-healthy whole foods approach

### 😴 Sleep Tracker
- Log bedtime and wake time
- Calculate sleep duration automatically
- Rate sleep quality (1-10 scale)
- View 7-day sleep history
- Average duration and quality statistics

### 🎨 Beautiful UI/UX
- Modern gradient backgrounds
- Smooth GSAP animations
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS styling
- Interactive hover effects
- Scroll-triggered animations

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **GSAP** - Animations
- **React Icons** - Icon library
- **Axios** - HTTP client for API calls

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd recipe-manager
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## API Integration

### Food API (Edamam) ✅ CONFIGURED
The Edamam Food API is already integrated and configured with your credentials:
- **App ID**: Configured in `app/api/food-search/route.ts`
- **App Key**: Configured in `app/api/food-search/route.ts`

The API is called server-side through Next.js API routes for security. The food search feature is fully functional and will:
- Search the Edamam food database
- Return nutrition information (calories, protein, carbs, fats)
- Display food categories and labels
- Allow you to add foods to your daily tracker

**Note**: For production deployments, consider moving API keys to environment variables.

### Recipe Images
The app uses Unsplash for recipe images. For production, consider:
- Using Spoonacular API for recipe images
- Implementing image caching
- Adding fallback images

## Project Structure

```
recipe-manager/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── RecipeCategories.tsx
│   ├── RecipeCard.tsx
│   ├── BMICalculator.tsx
│   ├── DailyTracker.tsx
│   ├── DietPrograms.tsx
│   └── SleepTracker.tsx
├── lib/
│   └── recipes.ts
└── public/
```

## Features in Detail

### Recipe Categories
Browse recipes by category with smooth filtering. Each recipe card shows:
- High-quality images
- Protein content prominently displayed
- Quick nutrition facts
- Expandable details with full ingredients and instructions

### BMI Calculator
- Real-time calculation as you adjust sliders
- Color-coded results based on BMI category
- Smooth animations on value changes

### Daily Tracker
- Search functionality for foods
- Add multiple servings
- Real-time totals calculation
- Visual progress indicators

### Diet Programs
Comprehensive information about different diet approaches:
- Benefits of each program
- Daily calorie recommendations
- Specific targets (protein, carbs, fasting windows)

### Sleep Tracker
- Easy logging interface
- Automatic duration calculation
- Quality rating system
- Historical data visualization

## Customization

### Adding Recipes
Edit `lib/recipes.ts` to add more recipes. Follow the `Recipe` interface structure.

### Styling
Modify `tailwind.config.ts` to customize colors, fonts, and other design tokens.

### Animations
GSAP animations can be customized in each component. See component files for animation code.

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Support

For questions or support, please open an issue on the repository.

