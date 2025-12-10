import { NextRequest, NextResponse } from 'next/server';

// Edamam API credentials
// Note: In production, use environment variables for security
// const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID || 'ac0bdd79';
// const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY || 'bf724b9a4a0aee9b161f8db9d37fd958';
const EDAMAM_APP_ID = 'ac0bdd79';
const EDAMAM_APP_KEY = 'bf724b9a4a0aee9b161f8db9d37fd958';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Search for foods using Edamam Food Database API
    const searchUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}&nutrition-type=cooking`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to match our component's expected format
    const foods = data.hints?.map((hint: any) => ({
      foodId: hint.food?.foodId || hint.food?.uri?.split('#food_')[1] || Math.random().toString(),
      label: hint.food?.label || query,
      nutrients: hint.food?.nutrients || {},
      image: hint.food?.image,
      category: hint.food?.category,
      foodContentsLabel: hint.food?.foodContentsLabel,
    })) || [];

    return NextResponse.json({ foods, count: foods.length });
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json(
      { error: 'Failed to search foods', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients array is required' },
        { status: 400 }
      );
    }

    // Get detailed nutrition info using Edamam Nutrients API
    const nutrientsUrl = `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;
    
    const response = await fetch(nutrientsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients: ingredients.map((ing: any) => ({
          quantity: ing.quantity || 1,
          measureURI: ing.measureURI || 'http://www.edamam.com/ontologies/edamam.owl#Measure_unit',
          foodId: ing.foodId,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Edamam Nutrients API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      nutrients: data.totalNutrients || {},
      calories: data.calories || 0,
      totalWeight: data.totalWeight || 0,
    });
  } catch (error) {
    console.error('Nutrients fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrients', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
