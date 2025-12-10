# API Integration Guide

## Edamam Food Database API

The application uses the Edamam Food Database API for food search and nutrition tracking.

### Current Configuration

The API credentials are configured in `app/api/food-search/route.ts`:
- **App ID**: `ac0bdd79`
- **App Key**: `bf724b9a4a0aee9b161f8db9d37fd958`

### How It Works

1. **Food Search** (GET `/api/food-search`)
   - User searches for a food item
   - Frontend calls Next.js API route
   - API route calls Edamam Food Database Parser API
   - Results are returned to the frontend
   - User can select foods to add to their log

2. **Nutrition Data**
   - Edamam provides nutrition data per 100g
   - Values include:
     - Calories (ENERC_KCAL)
     - Protein (PROCNT)
     - Carbohydrates (CHOCDF)
     - Fats (FAT)

### API Endpoints Used

1. **Parser API** - `/api/food-database/v2/parser`
   - Used for searching foods
   - Returns food matches with basic nutrition info

2. **Nutrients API** - `/api/food-database/v2/nutrients` (available for future use)
   - Can be used for detailed nutrition analysis
   - Requires food IDs from parser results

### Security Note

Currently, API keys are stored directly in the code. For production:

1. Create a `.env.local` file:
   ```
   EDAMAM_APP_ID=ac0bdd79
   EDAMAM_APP_KEY=bf724b9a4a0aee9b161f8db9d37fd958
   ```

2. Update `app/api/food-search/route.ts`:
   ```typescript
   const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID!;
   const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY!;
   ```

3. Add `.env.local` to `.gitignore` (already done)

### API Rate Limits

Edamam free tier typically allows:
- 10,000 API calls per month
- Reasonable request rate (avoid rapid-fire requests)

### Testing the API

1. Start the development server: `npm run dev`
2. Navigate to the Daily Tracker section
3. Search for foods like:
   - "chicken breast"
   - "brown rice"
   - "banana"
   - "salmon"
4. Click on results to add them to your food log

### Troubleshooting

**No results found:**
- Try different search terms
- Check API credentials are correct
- Verify API quota hasn't been exceeded

**API errors:**
- Check browser console for error messages
- Verify network connectivity
- Check Edamam API status

### Future Enhancements

- Add food images from Edamam
- Implement portion size selection
- Add meal timing (breakfast, lunch, dinner)
- Save food logs to database
- Add favorite foods
- Implement barcode scanning (requires additional API)
