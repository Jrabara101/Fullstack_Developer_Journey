import { NextRequest, NextResponse } from 'next/server';

// Using Spoonacular API (free tier available)
// You can get a free API key from https://spoonacular.com/food-api
// For now, we'll use a demo approach with Edamam and Unsplash for images

const EDAMAM_APP_ID = 'ac0bdd79';
const EDAMAM_APP_KEY = 'bf724b9a4a0aee9b161f8db9d37fd958';

// Recipe search terms for each category
const categorySearchTerms: Record<string, string[]> = {
  breakfast: ['protein breakfast', 'high protein breakfast', 'eggs protein', 'protein pancakes', 'protein smoothie'],
  lunch: ['protein lunch', 'chicken salad', 'protein bowl', 'grilled chicken', 'protein wrap'],
  dinner: ['protein dinner', 'salmon protein', 'lean beef', 'protein meal', 'chicken breast'],
  dessert: ['protein dessert', 'protein brownie', 'protein ice cream', 'protein pudding', 'protein bar'],
  'pre-workout': ['pre workout meal', 'pre workout snack', 'energy food', 'pre workout protein'],
  'post-workout': ['post workout meal', 'recovery meal', 'post workout protein', 'muscle recovery'],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'breakfast';
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // Generate recipes based on category
    const searchTerms = categorySearchTerms[category] || categorySearchTerms.breakfast;
    const recipes = [];
    const usedIds = new Set<string>(); // Track used IDs to prevent duplicates

    for (let i = 0; i < limit; i++) {
      const searchTerm = searchTerms[i % searchTerms.length];
      
      // Fetch from Edamam for nutrition data
      const searchUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(searchTerm)}&nutrition-type=cooking`;
      
      try {
        const response = await fetch(searchUrl);
        if (response.ok) {
          const data = await response.json();
          const food = data.hints?.[0]?.food;
          
          if (food) {
            const nutrients = food.nutrients || {};
            const protein = Math.round(nutrients.PROCNT || 0);
            const calories = Math.round(nutrients.ENERC_KCAL || 0);
            const carbs = Math.round(nutrients.CHOCDF || 0);
            const fats = Math.round(nutrients.FAT || 0);
            
            // Generate unique ID
            let recipeId = `recipe-${category}-${i + 1}`;
            let counter = 1;
            while (usedIds.has(recipeId)) {
              recipeId = `recipe-${category}-${i + 1}-${counter}`;
              counter++;
            }
            usedIds.add(recipeId);
            
            // Generate recipe data with better image URLs
            const imageIds = [
              1546069901, 1546069902, 1546069903, 1546069904, 1546069905,
              1546069906, 1546069907, 1546069908, 1546069909, 1546069910,
              1546069911, 1546069912, 1546069913, 1546069914, 1546069915,
              1546069916, 1546069917, 1546069918, 1546069919, 1546069920,
            ];
            const imageId = imageIds[i % imageIds.length];
            
            const recipe = {
              id: recipeId,
              name: food.label || `${searchTerm} Recipe ${i + 1}`,
              category: category,
              protein: protein || Math.floor(Math.random() * 30) + 20,
              carbs: carbs || Math.floor(Math.random() * 40) + 20,
              fats: fats || Math.floor(Math.random() * 15) + 5,
              calories: calories || Math.floor(Math.random() * 200) + 200,
              ingredients: generateIngredients(category),
              instructions: generateInstructions(category),
              image: `https://images.unsplash.com/photo-${imageId}-ba9599a7e63c?w=400&h=300&fit=crop&q=80`,
              prepTime: Math.floor(Math.random() * 15) + 5,
              cookTime: Math.floor(Math.random() * 30) + 10,
            };
            
            recipes.push(recipe);
          } else {
            // If no food data, generate fallback
            const recipe = generateFallbackRecipe(category, i, usedIds);
            recipes.push(recipe);
          }
        } else {
          // If API call failed, generate fallback
          const recipe = generateFallbackRecipe(category, i, usedIds);
          recipes.push(recipe);
        }
      } catch (error) {
        // Fallback recipe generation
        const recipe = generateFallbackRecipe(category, i, usedIds);
        recipes.push(recipe);
      }
    }

    // If we don't have enough recipes, generate fallback ones
    let currentIndex = recipes.length;
    while (recipes.length < limit && currentIndex < limit * 2) {
      const recipe = generateFallbackRecipe(category, currentIndex, usedIds);
      recipes.push(recipe);
      currentIndex++;
    }

    // Remove any duplicates by ID (just in case)
    const uniqueRecipes = Array.from(
      new Map(recipes.map(recipe => [recipe.id, recipe])).values()
    );

    return NextResponse.json({ recipes: uniqueRecipes.slice(0, limit), count: uniqueRecipes.length });
  } catch (error) {
    console.error('Recipe fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateIngredients(category: string): string[] {
  const baseIngredients: Record<string, string[]> = {
    breakfast: ['Eggs', 'Protein powder', 'Greek yogurt', 'Oats', 'Berries', 'Nuts'],
    lunch: ['Chicken breast', 'Brown rice', 'Vegetables', 'Olive oil', 'Herbs'],
    dinner: ['Salmon', 'Sweet potato', 'Broccoli', 'Lemon', 'Garlic'],
    dessert: ['Protein powder', 'Greek yogurt', 'Cocoa powder', 'Stevia', 'Almonds'],
    'pre-workout': ['Banana', 'Oats', 'Honey', 'Almond milk', 'Protein powder'],
    'post-workout': ['Chicken', 'Rice', 'Vegetables', 'Protein shake', 'Fruits'],
  };
  
  return baseIngredients[category] || baseIngredients.breakfast;
}

function generateInstructions(category: string): string[] {
  return [
    'Prepare all ingredients',
    'Follow cooking instructions',
    'Combine ingredients as directed',
    'Cook until ready',
    'Serve and enjoy',
  ];
}

function generateFallbackRecipe(category: string, index: number, usedIds: Set<string>) {
  const names: Record<string, string[]> = {
    breakfast: ['Protein Scrambled Eggs', 'Greek Yogurt Bowl', 'Protein Pancakes', 'Egg White Omelet', 'Protein Smoothie'],
    lunch: ['Grilled Chicken Salad', 'Protein Bowl', 'Chicken Wrap', 'Turkey Sandwich', 'Protein Pasta'],
    dinner: ['Grilled Salmon', 'Chicken & Rice', 'Lean Beef Steak', 'Turkey Meatballs', 'Baked Cod'],
    dessert: ['Protein Brownies', 'Protein Pudding', 'Protein Ice Cream', 'Protein Cookies', 'Protein Cheesecake'],
    'pre-workout': ['Banana Smoothie', 'Oatmeal Bowl', 'Energy Bar', 'Pre-Workout Shake', 'Fruit & Nuts'],
    'post-workout': ['Recovery Shake', 'Chicken & Rice', 'Protein Pancakes', 'Post-Workout Bowl', 'Recovery Meal'],
  };
  
  const categoryNames = names[category] || names.breakfast;
  const name = categoryNames[index % categoryNames.length] || `${category} Recipe ${index + 1}`;
  
  // Generate unique ID
  let recipeId = `recipe-${category}-${index + 1}`;
  let counter = 1;
  while (usedIds.has(recipeId)) {
    recipeId = `recipe-${category}-${index + 1}-${counter}`;
    counter++;
  }
  usedIds.add(recipeId);
  
  return {
    id: recipeId,
    name: name,
    category: category,
    protein: Math.floor(Math.random() * 30) + 20,
    carbs: Math.floor(Math.random() * 40) + 20,
    fats: Math.floor(Math.random() * 15) + 5,
    calories: Math.floor(Math.random() * 200) + 200,
    ingredients: generateIngredients(category),
    instructions: generateInstructions(category),
    image: `https://images.unsplash.com/photo-${1546069901 + (index % 50)}-ba9599a7e63c?w=400&h=300&fit=crop&q=80`,
    prepTime: Math.floor(Math.random() * 15) + 5,
    cookTime: Math.floor(Math.random() * 30) + 10,
  };
}
