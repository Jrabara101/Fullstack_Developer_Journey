// Generate image URLs from Unsplash based on recipe name and category
export function generateImageUrl(recipeName: string, category: string, index: number): string {
  // Map categories to search terms for better image matching
  const categoryTerms: Record<string, string> = {
    'breakfast': 'breakfast-food',
    'lunch': 'lunch-meal',
    'dinner': 'dinner-food',
    'dessert': 'dessert-sweet',
    'pre-workout': 'healthy-snack',
    'post-workout': 'protein-meal',
  };

  const searchTerm = categoryTerms[category] || 'food';
  
  // Use Unsplash Source API (no auth required for basic usage)
  // Format: https://source.unsplash.com/400x300/?{search-term}
  const encodedTerm = encodeURIComponent(searchTerm);
  
  // Use index to vary images
  const imageVariations = [
    `https://source.unsplash.com/400x300/?${encodedTerm}&sig=${index}`,
    `https://images.unsplash.com/photo-${1546069901 + (index % 50)}-ba9599a7e63c?w=400&h=300&fit=crop&q=80`,
    `https://source.unsplash.com/400x300/?food,${encodedTerm}&sig=${index + 100}`,
  ];
  
  return imageVariations[index % imageVariations.length];
}

// Alternative: Use specific Unsplash photo IDs for food images
export function getFoodImageUrl(category: string, index: number): string {
  // Food-related Unsplash photo IDs (these are real food images)
  const foodImageIds: Record<string, number[]> = {
    'breakfast': [
      1551892304, 1556916492, 1525353904163, 1526318898399, 1504113885799,
      1504674900245, 1511933988, 1512621777001, 1506084861290, 1504113885799,
      1525353904163, 1526318898399, 1551892304, 1556916492, 1504674900245,
      1511933988, 1512621777001, 1506084861290, 1504113885799, 1525353904163,
    ],
    'lunch': [
      1556916492, 1504674900245, 1511933988, 1512621777001, 1506084861290,
      1525353904163, 1526318898399, 1551892304, 1556916492, 1504113885799,
      1504674900245, 1511933988, 1512621777001, 1506084861290, 1525353904163,
      1526318898399, 1551892304, 1556916492, 1504113885799, 1504674900245,
    ],
    'dinner': [
      1506084861290, 1525353904163, 1526318898399, 1551892304, 1556916492,
      1504113885799, 1504674900245, 1511933988, 1512621777001, 1506084861290,
      1525353904163, 1526318898399, 1551892304, 1556916492, 1504113885799,
      1504674900245, 1511933988, 1512621777001, 1506084861290, 1525353904163,
    ],
    'dessert': [
      1512621777001, 1506084861290, 1525353904163, 1526318898399, 1551892304,
      1556916492, 1504113885799, 1504674900245, 1511933988, 1512621777001,
      1506084861290, 1525353904163, 1526318898399, 1551892304, 1556916492,
      1504113885799, 1504674900245, 1511933988, 1512621777001, 1506084861290,
    ],
    'pre-workout': [
      1504674900245, 1511933988, 1512621777001, 1506084861290, 1525353904163,
      1526318898399, 1551892304, 1556916492, 1504113885799, 1504674900245,
      1511933988, 1512621777001, 1506084861290, 1525353904163, 1526318898399,
      1551892304, 1556916492, 1504113885799, 1504674900245, 1511933988,
    ],
    'post-workout': [
      1504113885799, 1504674900245, 1511933988, 1512621777001, 1506084861290,
      1525353904163, 1526318898399, 1551892304, 1556916492, 1504113885799,
      1504674900245, 1511933988, 1512621777001, 1506084861290, 1525353904163,
      1526318898399, 1551892304, 1556916492, 1504113885799, 1504674900245,
    ],
  };

  const ids = foodImageIds[category] || foodImageIds['breakfast'];
  const imageId = ids[index % ids.length];
  
  return `https://images.unsplash.com/photo-${imageId}?w=400&h=300&fit=crop&q=80`;
}
