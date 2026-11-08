import type { 
  MenuItem, 
  PastryItem, 
  CoffeeBeanBag, 
  SeatingZone, 
  BaristaSpotlight, 
  CommunityCup, 
  TurntableTrack,
  WeatherInfo
} from '../types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'drink-1',
    name: 'Smoked Honey & Rosemary Cortado',
    category: 'signature',
    price: 5.75,
    size: '4.5 OZ',
    temp: 'both',
    roastWarmth: 2,
    sweetness: 2,
    caffeineKick: 2,
    tastingNotes: ['Raw Wildflower Honey', 'Woodsmoke Pine', 'Velvety Cream'],
    moodCravings: ['rainy-day', 'clean-focus'],
    cupAnatomy: [
      { name: 'Rosemary-Infused Smoked Honey', percentage: 15, color: '#D99B26', description: 'Simmered local honey infused with fresh rosemary twigs' },
      { name: 'Double Ristretto (Finca La Violeta)', percentage: 40, color: '#2C1B14', description: '2oz tight extraction of Colombian Pink Bourbon' },
      { name: 'Micro-Foamed Oat Milk (135°F)', percentage: 45, color: '#F4ECE1', description: 'Silky, low-temp steamed oat for natural sweetness' },
    ],
    ratioDescription: '40% Ristretto • 45% Micro-Foam • 15% Smoked Honey Infusion',
    description: 'Double ristretto extracted over raw wildflower honey infused with charred rosemary, crowned with silky micro-foamed oat milk.',
    calories: 140,
    isGlutenFree: true,
    isVeganByDefault: false,
    soulmatePastryId: 'pastry-1',
    seasonalTag: '🍁 Autumn Signature',
    isBaristaPick: true,
    baristaNote: 'Maya: "The pine aroma hits your nose before the first sip. Comfort in a heavy ceramic glass."'
  },
  {
    id: 'drink-2',
    name: 'Copenhagen Cardamom Flat White',
    category: 'espresso',
    price: 5.50,
    size: '6 OZ',
    temp: 'hot',
    roastWarmth: 2,
    sweetness: 1,
    caffeineKick: 2,
    tastingNotes: ['Fresh Green Cardamom', 'Toasted Hazelnut', 'Dense Microfoam'],
    moodCravings: ['rainy-day', 'chocolatey-nutty'],
    cupAnatomy: [
      { name: 'Freshly Crushed Green Cardamom', percentage: 10, color: '#4A6B53', description: 'Freshly ground Pods dusted directly into the portafilter' },
      { name: 'Double House Espresso Shot', percentage: 35, color: '#231915', description: 'Rich chocolate & red currant notes' },
      { name: 'Velvet Textured Steamed Milk', percentage: 55, color: '#FAF6F0', description: 'Thin gloss of microfoam with zero dry froth' },
    ],
    ratioDescription: '35% Espresso • 55% Textured Milk • 10% Fresh Cardamom Dust',
    description: 'Freshly crushed organic cardamom pods extracted directly inside the portafilter basket with our house roast, poured with velvety micro-foam.',
    calories: 130,
    isGlutenFree: true,
    isVeganByDefault: false,
    soulmatePastryId: 'pastry-1',
    seasonalTag: 'House Classic'
  },
  {
    id: 'drink-3',
    name: 'Finca La Violeta Washed Pour-Over',
    category: 'filter',
    price: 6.25,
    size: '10 OZ',
    temp: 'hot',
    roastWarmth: 1,
    sweetness: 2,
    caffeineKick: 3,
    tastingNotes: ['Bergamot Earl Grey', 'White Peach', 'Cane Sugar Sparkle'],
    moodCravings: ['bright-floral', 'clean-focus'],
    cupAnatomy: [
      { name: 'Single Origin Light Extraction', percentage: 100, color: '#8C5638', description: 'Brewed to order on Kalita Wave 185 with 1:16 ratio' }
    ],
    ratioDescription: '100% Pure Single-Origin Filter Brew • 18g Dose / 300g Water at 93°C',
    description: 'Slow-poured over a ceramic Kalita Wave. Incredibly clean, tea-like transparency with lingering floral jasmine and stone fruit.',
    calories: 5,
    isGlutenFree: true,
    isVeganByDefault: true,
    soulmatePastryId: 'pastry-3',
    isBaristaPick: true,
    baristaNote: 'Julian: "Tastes like summer peaches dipped in sweet white tea. No milk, no sugar needed."'
  },
  {
    id: 'drink-4',
    name: 'Toasted Hazelnut Miso Latte',
    category: 'signature',
    price: 6.50,
    size: '8 OZ',
    temp: 'both',
    roastWarmth: 3,
    sweetness: 2,
    caffeineKick: 2,
    tastingNotes: ['White Miso Umami', 'Roasted Hazelnut Praline', 'Dark Caramel'],
    moodCravings: ['chocolatey-nutty', 'rainy-day'],
    cupAnatomy: [
      { name: 'House White Miso Hazelnut Paste', percentage: 20, color: '#C68B59', description: 'Organic sweet white miso blended with roasted Oregon hazelnuts' },
      { name: 'Double Espresso (Third Place Blend)', percentage: 35, color: '#1C1512', description: 'Bold, syrupy base with low acidity' },
      { name: 'Steamed Oat Milk', percentage: 45, color: '#F2EAE0', description: 'Creamy barista edition oat' },
    ],
    ratioDescription: '35% Espresso • 45% Oat Milk • 20% Miso Hazelnut Paste',
    description: 'A cozy sweet-and-savory masterpiece. Organic sweet white miso balances toasted Oregon hazelnut syrup and deep espresso.',
    calories: 190,
    isGlutenFree: true,
    isVeganByDefault: true,
    soulmatePastryId: 'pastry-2',
    seasonalTag: 'Chef Special'
  },
  {
    id: 'drink-5',
    name: 'Wild Blackberry & Cacao Nitro Cold Brew',
    category: 'signature',
    price: 5.75,
    size: '12 OZ',
    temp: 'iced',
    roastWarmth: 1,
    sweetness: 1,
    caffeineKick: 3,
    tastingNotes: ['Wild Mountain Berries', '70% Dark Cacao', 'Creamy Guinness Head'],
    moodCravings: ['clean-focus', 'chocolatey-nutty'],
    cupAnatomy: [
      { name: 'Nitro Cascading Nitrogen Head', percentage: 15, color: '#FAF6F0', description: 'Dense, naturally sweet micro-bubbles without dairy' },
      { name: '20-Hour Cold Steep Single Origin', percentage: 85, color: '#1A120E', description: 'Ethiopia Guji steeped cold with organic roasted cacao nibs' },
    ],
    ratioDescription: '85% Cold Steeped Single-Origin • 15% Dense Nitro Velvet Crema',
    description: 'Steeped for 20 hours cold alongside crushed organic Peruvian cacao nibs, then nitrogenated on draft for a silky, stout-like body.',
    calories: 15,
    isGlutenFree: true,
    isVeganByDefault: true,
    soulmatePastryId: 'pastry-2',
  },
  {
    id: 'drink-6',
    name: 'Stoneground Ceremonial Matcha & Oat',
    category: 'tea-botanical',
    price: 6.00,
    size: '8 OZ',
    temp: 'both',
    roastWarmth: 1,
    sweetness: 1,
    caffeineKick: 2,
    tastingNotes: ['Young Spring Grass', 'Pecan Shell', 'Creamy Sweet Umami'],
    moodCravings: ['clean-focus', 'bright-floral'],
    cupAnatomy: [
      { name: 'Whisked Uji Kyoto Matcha (First Harvest)', percentage: 30, color: '#4A6B53', description: 'Stoneground tencha hand-whisked with bamboo chasen' },
      { name: 'Steamed Creamy Oat Milk', percentage: 65, color: '#F7F3EB', description: 'Steamed to a gentle 140°F to preserve grassy sweetness' },
      { name: 'Raw Agave Glaze', percentage: 5, color: '#D99B26', description: 'Light organic amber nectar touch' }
    ],
    ratioDescription: '30% Ceremonial Matcha • 65% Steamed Oat • 5% Raw Agave',
    description: 'First-harvest ceremonial tencha from Uji, Kyoto. Whisked with bamboo chasen to order and swirled with velvety oat milk. Zero jitter calm.',
    calories: 120,
    isGlutenFree: true,
    isVeganByDefault: true,
    soulmatePastryId: 'pastry-5',
    isBaristaPick: true,
    baristaNote: 'Chloe: "Clean, jitter-free l-theanine clarity that carries you straight through a deep work session."'
  },
  {
    id: 'drink-7',
    name: 'Golden Hour Spiced Rooibos Chai (Caffeine-Free)',
    category: 'decaf',
    price: 5.50,
    size: '10 OZ',
    temp: 'both',
    roastWarmth: 3,
    sweetness: 2,
    caffeineKick: 1,
    tastingNotes: ['Crushed Ceylon Cinnamon', 'Star Anise', 'Warm Ginger Nectar'],
    moodCravings: ['caffeine-free', 'rainy-day'],
    cupAnatomy: [
      { name: 'Whole-Spice Rooibos Decoction', percentage: 50, color: '#9E4752', description: 'Simmered ginger, cardamom, black pepper, star anise, clove' },
      { name: 'Steamed Whole Oat Milk', percentage: 50, color: '#F4ECE1', description: 'Whipped hot with organic wildflower honey' },
    ],
    ratioDescription: '50% Slow-Simmered Spices • 50% Steamed Oat & Honey',
    description: 'Red bush rooibos slow-simmered for 4 hours with uncrushed organic spices, black pepper, and whole ginger root. Naturally caffeine-free.',
    calories: 110,
    isGlutenFree: true,
    isVeganByDefault: false,
    soulmatePastryId: 'pastry-1',
    seasonalTag: 'Caffeine-Free Cozy'
  },
  {
    id: 'drink-8',
    name: 'Bourbon Cask Decaf Americano',
    category: 'decaf',
    price: 4.75,
    size: '8 OZ',
    temp: 'both',
    roastWarmth: 2,
    sweetness: 1,
    caffeineKick: 1,
    tastingNotes: ['Charred Oak Stave', 'Vanilla Bean', 'Toasted Pecan'],
    moodCravings: ['caffeine-free', 'chocolatey-nutty'],
    cupAnatomy: [
      { name: 'Swiss Water Decaf Double Shot', percentage: 40, color: '#3A2820', description: 'Green beans conditioned in retired oak bourbon casks before water decaf' },
      { name: 'Pure Mineral Hot Water (200°F)', percentage: 60, color: '#C6B29F', description: 'Remineralized water with magnesium & calcium balance' },
    ],
    ratioDescription: '40% Bourbon-Cask Decaf Shot • 60% Mineral Water',
    description: 'Swiss Water Process decaf green coffee aged in charred bourbon barrels for 30 days before gentle drum roasting. Zero caffeine, maximum depth.',
    calories: 5,
    isGlutenFree: true,
    isVeganByDefault: true,
    soulmatePastryId: 'pastry-4',
  },
  {
    id: 'drink-9',
    name: 'Velvet Dark Chocolate Mocha (72% Valrhona)',
    category: 'signature',
    price: 6.25,
    size: '8 OZ',
    temp: 'both',
    roastWarmth: 3,
    sweetness: 3,
    caffeineKick: 2,
    tastingNotes: ['72% Valrhona Guanaja', 'Roasted Espresso', 'Flaky Maldon Salt'],
    moodCravings: ['chocolatey-nutty', 'rainy-day'],
    cupAnatomy: [
      { name: 'Melted Valrhona 72% Dark Ganache', percentage: 25, color: '#1A0E08', description: 'Single-estate cacao melted with espresso reduction' },
      { name: 'Double House Espresso Shot', percentage: 35, color: '#2B1A12', description: 'Full-bodied dark roast pairing' },
      { name: 'Steamed Microfoam Milk', percentage: 40, color: '#F2EAE0', description: 'Velvety milk topped with Maldon sea salt crystals' },
    ],
    ratioDescription: '35% Espresso • 40% Steamed Milk • 25% Melted Dark Ganache',
    description: 'We melt real blocks of Valrhona 72% Guanaja chocolate into freshly pulled espresso shots and steam with thick oat or whole milk.',
    calories: 220,
    isGlutenFree: true,
    isVeganByDefault: false,
    soulmatePastryId: 'pastry-2',
    seasonalTag: 'Weekend Favorite'
  }
];

export const PASTRY_ITEMS: PastryItem[] = [
  {
    id: 'pastry-1',
    name: 'Brown Butter Cardamom Bun',
    price: 4.85,
    description: 'Hand-knotted Swedish style bun with browned Normandy butter, coarse crushed cardamom seed, and pearl sugar glaze.',
    bakedMinutesAgo: 14,
    bakeBatchNumber: 'BATCH #03',
    stockRemaining: 5,
    isGlutenFree: false,
    isVegan: false,
    pairingDrinkName: 'Copenhagen Cardamom Flat White',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pastry-2',
    name: 'Sea-Salt Dark Chocolate Rye Cookie',
    price: 4.25,
    description: 'Whole organic stoneground rye flour, molten 70% dark chocolate pools, and crunchy Maldon sea-salt flakes.',
    bakedMinutesAgo: 28,
    bakeBatchNumber: 'BATCH #02',
    stockRemaining: 8,
    isGlutenFree: false,
    isVegan: false,
    pairingDrinkName: 'Smoked Honey & Rosemary Cortado',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pastry-3',
    name: 'Warm Fig & Spelt Galette',
    price: 5.50,
    description: 'Flaky spelt butter pastry folded over sliced Mission figs, wildflower honey drizzle, and fresh thyme leaves.',
    bakedMinutesAgo: 45,
    bakeBatchNumber: 'BATCH #02',
    stockRemaining: 3,
    isGlutenFree: false,
    isVegan: false,
    pairingDrinkName: 'Finca La Violeta Washed Pour-Over',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pastry-4',
    name: 'Tahini Pistachio Morning Loaf',
    price: 4.50,
    description: 'Toasted sesame tahini swirl, roasted bronzed pistachios, and a moist banana almond crumb. 100% plant-based & GF.',
    bakedMinutesAgo: 60,
    bakeBatchNumber: 'BATCH #01',
    stockRemaining: 6,
    isGlutenFree: true,
    isVegan: true,
    pairingDrinkName: 'Stoneground Ceremonial Matcha',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pastry-5',
    name: 'Almond Kouign-Amann',
    price: 5.25,
    description: 'Caramelized Breton laminated dough with thousands of flaky butter folds, toasted sliced almonds, and fleur de sel.',
    bakedMinutesAgo: 19,
    bakeBatchNumber: 'BATCH #03',
    stockRemaining: 4,
    isGlutenFree: false,
    isVegan: false,
    pairingDrinkName: 'Toasted Hazelnut Miso Latte',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'
  }
];

export const COFFEE_BEANS: CoffeeBeanBag[] = [
  {
    id: 'bean-1',
    name: 'Finca La Violeta • Pink Bourbon',
    originCountry: 'Colombia',
    region: 'Huila, San Adolfo',
    farmName: 'Finca La Violeta',
    producer: 'Don Rodrigo Sánchez',
    elevation: '1,920 MASL',
    variety: '100% Pink Bourbon',
    processMethod: 'Washed Extended Fermentation',
    roastProfile: 'Light',
    tastingNotes: ['Pink Guava', 'Earl Grey Bergamot', 'Cane Sugar Sparkle'],
    acidity: 'Vibrant & Clean',
    body: 'Silky Tea-Like',
    price: 21.00,
    weightGrams: 250,
    roastBatchDate: 'ROASTED 2 DAYS AGO • LOT #042',
    story: 'Don Rodrigo hand-picks only cherry-red and salmon-pink drupes at peak brix sugar levels. Fermented for 48 hours in sealed tanks before patio sun drying under parabolics.',
    flavorTags: ['bright-floral', 'clean-focus'],
    brewRecipes: {
      v60: {
        method: 'V60 Pour-Over',
        doseGrams: 16,
        waterGrams: 256,
        waterTempC: 93,
        bloomSeconds: 45,
        totalTimeSeconds: 180,
        grindSize: 'Medium-Fine (22 clicks on Comandante)',
        ratio: '1:16',
        steps: [
          { time: '0:00', action: 'Gentle 50g Bloom Pour', waterAmount: '50g', tip: 'Swirl the slurry gently 3 times to saturate all chaff.' },
          { time: '0:45', action: 'Spiral Pour up to 150g', waterAmount: '100g', tip: 'Pour in slow outward circles, avoiding filter edges.' },
          { time: '1:30', action: 'Center Pour up to 256g', waterAmount: '106g', tip: 'Steady vertical stream to maintain 1-inch water head.' },
          { time: '2:30', action: 'Drawdown & Swirl', waterAmount: 'Complete', tip: 'Gentle final tap to produce a perfectly flat bed of grounds.' }
        ]
      },
      aeropress: {
        method: 'AeroPress',
        doseGrams: 15,
        waterGrams: 200,
        waterTempC: 90,
        bloomSeconds: 30,
        totalTimeSeconds: 120,
        grindSize: 'Medium (18 clicks)',
        ratio: '1:13.3',
        steps: [
          { time: '0:00', action: 'Inverted method, add 60g bloom water', waterAmount: '60g', tip: 'Stir vigorously with paddle 5 times.' },
          { time: '0:30', action: 'Pour remaining 140g water', waterAmount: '140g', tip: 'Attach cap with rinsed paper filter.' },
          { time: '1:00', action: 'Flip onto ceramic cup', waterAmount: 'Ready', tip: 'Careful steady inversion.' },
          { time: '1:10', action: 'Gentle 30s plunge', waterAmount: 'Complete', tip: 'Stop right when you hear the first hiss.' }
        ]
      },
      frenchpress: {
        method: 'French Press',
        doseGrams: 20,
        waterGrams: 320,
        waterTempC: 94,
        bloomSeconds: 60,
        totalTimeSeconds: 300,
        grindSize: 'Coarse Sea-Salt',
        ratio: '1:16',
        steps: [
          { time: '0:00', action: 'Add all 320g water vigorously', waterAmount: '320g', tip: 'Make sure all grounds are submerged.' },
          { time: '4:00', action: 'Break the crust with two spoons', waterAmount: '320g', tip: 'Skim off the foam and floating grounds.' },
          { time: '5:00', action: 'Insert plunger and pour gently', waterAmount: 'Complete', tip: 'Do not press the plunger down to the bottom; just use as a strainer.' }
        ]
      }
    }
  },
  {
    id: 'bean-2',
    name: 'Guji Kercha • Natural Anaerobic',
    originCountry: 'Ethiopia',
    region: 'Oromia, Guji Zone',
    farmName: 'Smallholder Family Farms',
    producer: 'Kercha Washing Station',
    elevation: '2,150 MASL',
    variety: 'Heirloom & Kurume',
    processMethod: 'Natural Anaerobic 72hr',
    roastProfile: 'Light',
    tastingNotes: ['Wild Blueberry Compote', 'Lavender Flower', 'Meyer Lemon'],
    acidity: 'Sparkling Wine Acidity',
    body: 'Jammy & Juicy',
    price: 23.50,
    weightGrams: 250,
    roastBatchDate: 'ROASTED YESTERDAY • LOT #043',
    story: 'High in the cloud-kissed Guji mountains, over 300 smallholder families deliver deep ruby cherries to Kercha station. Ripe cherries rest in oxygen-free barrels before drying slowly on raised African bamboo beds for 24 days.',
    flavorTags: ['bright-floral', 'clean-focus'],
    brewRecipes: {
      v60: {
        method: 'V60 Pour-Over',
        doseGrams: 15,
        waterGrams: 240,
        waterTempC: 92,
        bloomSeconds: 40,
        totalTimeSeconds: 165,
        grindSize: 'Medium-Fine',
        ratio: '1:16',
        steps: [
          { time: '0:00', action: '45g Bloom Pour', waterAmount: '45g', tip: 'Witness the intense purple floral aroma blooms immediately.' },
          { time: '0:40', action: 'Continuous gentle pulse pour', waterAmount: '100g', tip: 'Keep water temperature steady.' },
          { time: '1:20', action: 'Final pour to 240g', waterAmount: '95g', tip: 'Watch the vibrant berry crema rise.' },
          { time: '2:20', action: 'Drawdown finish', waterAmount: 'Complete', tip: 'Serve in an open-rim porcelain tulip cup.' }
        ]
      },
      aeropress: {
        method: 'AeroPress',
        doseGrams: 16,
        waterGrams: 200,
        waterTempC: 91,
        bloomSeconds: 30,
        totalTimeSeconds: 110,
        grindSize: 'Medium',
        ratio: '1:12.5',
        steps: [
          { time: '0:00', action: 'Add 60g water and swirl', waterAmount: '60g', tip: 'Bright berry aromatics fill the room.' },
          { time: '0:30', action: 'Fill to 200g water', waterAmount: '140g', tip: 'Steep inverted.' },
          { time: '1:00', action: 'Slow plunge', waterAmount: 'Complete', tip: 'Produces a bright, juicy cordial cup.' }
        ]
      },
      frenchpress: {
        method: 'French Press',
        doseGrams: 22,
        waterGrams: 350,
        waterTempC: 93,
        bloomSeconds: 60,
        totalTimeSeconds: 280,
        grindSize: 'Coarse',
        ratio: '1:16',
        steps: [
          { time: '0:00', action: 'Pour 350g hot water', waterAmount: '350g', tip: 'Let the natural sugars extract slowly.' },
          { time: '4:00', action: 'Break crust & skim', waterAmount: '350g', tip: 'Removes fine bitter particles.' },
          { time: '4:40', action: 'Pour cleanly', waterAmount: 'Complete', tip: 'Rich fruit body with zero silt.' }
        ]
      }
    }
  },
  {
    id: 'bean-3',
    name: 'Third Place House Espresso Blend',
    originCountry: 'Guatemala & Brazil',
    region: 'Huehuetenango & Sul de Minas',
    farmName: 'Finca El Injerto & Fazenda Ambiental',
    producer: 'Artisanal Partner Cooperatives',
    elevation: '1,650 MASL',
    variety: 'Bourbon & Yellow Catuai',
    processMethod: 'Washed & Pulped Natural',
    roastProfile: 'Medium',
    tastingNotes: ['Toasted Hazelnut', 'Dark Fudge', 'Brown Sugar Crema'],
    acidity: 'Low & Mellow',
    body: 'Syrupy & Heavy',
    price: 18.50,
    weightGrams: 300,
    roastBatchDate: 'ROASTED 3 DAYS AGO • LOT #040',
    story: 'Our daily signature backbone. Blended to cut through steamed oat or organic dairy milk with thick caramelized sweetness, or stand alone as a velvety double shot.',
    flavorTags: ['chocolatey-nutty', 'rainy-day'],
    brewRecipes: {
      v60: {
        method: 'V60 Pour-Over',
        doseGrams: 18,
        waterGrams: 270,
        waterTempC: 95,
        bloomSeconds: 45,
        totalTimeSeconds: 195,
        grindSize: 'Medium',
        ratio: '1:15',
        steps: [
          { time: '0:00', action: 'Bloom with 55g water', waterAmount: '55g', tip: 'Heavy toasted cacao notes bloom first.' },
          { time: '0:45', action: 'Main pour to 180g', waterAmount: '125g', tip: 'Brings out dark hazelnut body.' },
          { time: '1:45', action: 'Finish to 270g', waterAmount: '90g', tip: 'Draws down sweet and velvety.' }
        ]
      },
      aeropress: {
        method: 'AeroPress',
        doseGrams: 17,
        waterGrams: 220,
        waterTempC: 93,
        bloomSeconds: 30,
        totalTimeSeconds: 130,
        grindSize: 'Medium-Fine',
        ratio: '1:13',
        steps: [
          { time: '0:00', action: 'Add 60g bloom water', waterAmount: '60g', tip: 'Stir 4 times.' },
          { time: '0:30', action: 'Add up to 220g', waterAmount: '160g', tip: 'Rich chocolate aroma.' },
          { time: '1:05', action: 'Plunge steadily', waterAmount: 'Complete', tip: 'Dense espresso-like concentrate.' }
        ]
      },
      frenchpress: {
        method: 'French Press',
        doseGrams: 24,
        waterGrams: 360,
        waterTempC: 95,
        bloomSeconds: 60,
        totalTimeSeconds: 320,
        grindSize: 'Coarse',
        ratio: '1:15',
        steps: [
          { time: '0:00', action: 'Pour 360g hot water', waterAmount: '360g', tip: 'Cover with lid to retain heat.' },
          { time: '4:30', action: 'Skim and stir', waterAmount: '360g', tip: 'Perfect for cozy morning breakfasts.' },
          { time: '5:20', action: 'Pour into warm mug', waterAmount: 'Complete', tip: 'Incredible with oat milk and honey.' }
        ]
      }
    }
  }
];

export const SEATING_ZONES: SeatingZone[] = [
  {
    id: 'zone-window',
    name: 'The Sunlit Window Bench',
    shortLabel: 'Window Bench',
    numberTag: 1,
    currentOccupancyPct: 25,
    totalSeats: 6,
    outletsCount: 2,
    vibe: 'Sun-drenched, gentle street breeze, best for books & morning cortados',
    bestFor: 'People watching, solo reading, 20-min espresso break',
    lighting: 'Bright natural eastern morning sun',
    noiseLevel: 'Gentle Hum',
    dogFriendly: false,
    hasFastWifi: true,
    description: 'Continuous white oak bench with custom linen cushions facing the tree-lined street. Soft morning golden light filters through tall mullioned windows.',
    pinX: 18,
    pinY: 34,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'zone-oak-table',
    name: 'The Communal Oak Worktable',
    shortLabel: 'Communal Oak',
    numberTag: 2,
    currentOccupancyPct: 60,
    totalSeats: 12,
    outletsCount: 8,
    vibe: 'Productive hum, warm brass task lamps, quiet keyboard clicking',
    bestFor: 'Deep focus, laptop work, collaborative sketches, wireframing',
    lighting: 'Soft directional brass pendant lamps + daylight',
    noiseLevel: 'Quiet Whisper',
    dogFriendly: false,
    hasFastWifi: true,
    description: 'Crafted from a single 14-foot slab of reclaimed Danish oak. Equipped with 8 flush-mounted brass AC & 65W USB-C ports and fiber Wi-Fi.',
    pinX: 48,
    pinY: 48,
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'zone-garden-patio',
    name: 'The Heated Back Garden Patio',
    shortLabel: 'Garden Patio',
    numberTag: 3,
    currentOccupancyPct: 35,
    totalSeats: 16,
    outletsCount: 0,
    vibe: 'Open-air sanctuary, ivy-draped brick, chirping birds, canine companions',
    bestFor: 'Dog owners, leisurely conversation, weekend morning pastries',
    lighting: 'Filtered dappled courtyard light & festoon bulbs',
    noiseLevel: 'Lively Cafe Buzz',
    dogFriendly: true,
    hasFastWifi: true,
    description: 'Enclosed courtyard surrounded by climbing fig ivy and Japanese maples. Overhead radiant heaters, ceramic water bowls, and complimentary dog biscuits at the gate.',
    pinX: 82,
    pinY: 28,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'zone-espresso-bar',
    name: 'The La Marzocco Brew Counter',
    shortLabel: 'Brew Bar',
    numberTag: 4,
    currentOccupancyPct: 70,
    totalSeats: 5,
    outletsCount: 0,
    vibe: 'Kinetic craft, steam wands, tactile ceramic ware, barista banter',
    bestFor: 'Coffee enthusiasts, tasting single-origins side by side, quick chat',
    lighting: 'Warm 2700K recessed spotlighting on the stone counter',
    noiseLevel: 'Lively Cafe Buzz',
    dogFriendly: false,
    hasFastWifi: true,
    description: 'Custom travertine stone counter right in front of our custom matte-bronze La Marzocco KB90 and Mahlkönig EK43 grinders. Hear today’s dial-in notes firsthand.',
    pinX: 52,
    pinY: 78,
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=700&q=80'
  }
];

export const BARISTA_SPOTLIGHTS: BaristaSpotlight[] = [
  {
    id: 'barista-1',
    name: 'Maya Lin',
    role: 'Head of Dial-In & Roastery Lead',
    shiftToday: 'On Bar until 2:00 PM',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    favDrinkName: 'Maya’s Iced Brown-Sugar Rosemary Cortado',
    favDrinkId: 'drink-1',
    tastingQuote: 'I shake the double shot over a single giant ice cube with simmered rosemary honey. It turns into a silky micro-crema like liquid silk.',
    secretModification: 'Sub oat milk with one splash of coconut cream + extra rosemary sprig',
    pairingPastryId: 'pastry-1'
  },
  {
    id: 'barista-2',
    name: 'Soren Vance',
    role: 'Morning Baker & Espresso Specialist',
    shiftToday: 'On Oven & Bar 5:30 AM – 1:30 PM',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    favDrinkName: 'Soren’s Cardamom Cloud Flat White',
    favDrinkId: 'drink-2',
    tastingQuote: 'We grind the cardamom pod shells along with the Pink Bourbon roast. When the cardamom steam hits the milk, you literally pause in your tracks.',
    secretModification: 'Double ristretto short pour at 132°F so the milk stays naturally sweet',
    pairingPastryId: 'pastry-1'
  },
  {
    id: 'barista-3',
    name: 'Chloe Thorne',
    role: 'Botanical & Single-Origin Curator',
    shiftToday: 'On Slow Brew Bar until 5:00 PM',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    favDrinkName: 'Chloe’s Ceremonial Tencha Spritz',
    favDrinkId: 'drink-6',
    tastingQuote: 'Whisking ceremonial tencha matcha over sparkling mineral water with fresh crushed yuzu is our afternoon revival secret.',
    secretModification: 'A touch of cold-pressed ginger juice for a quiet lift',
    pairingPastryId: 'pastry-4'
  }
];

export const COMMUNITY_CUPS_INITIAL: CommunityCup[] = [
  {
    id: 'cup-1',
    from: 'Elena R. (Regular at Table 2)',
    recipientNote: 'For a public school teacher grading papers after a long week. You are making the future bright!',
    drinkName: 'Smoked Honey & Rosemary Cortado',
    amount: 5.75,
    timestamp: '2 hours ago',
    isClaimed: false,
    stickyColor: 'peach'
  },
  {
    id: 'cup-2',
    from: 'Marcus & Dog Bruno 🐾',
    recipientNote: 'For anyone who woke up feeling a little overwhelmed this morning. Breathe deep, it gets better.',
    drinkName: 'Copenhagen Cardamom Flat White',
    amount: 5.50,
    timestamp: 'Yesterday at 4:15 PM',
    isClaimed: false,
    stickyColor: 'yellow'
  },
  {
    id: 'cup-3',
    from: 'The Freelance Writer in the Corner',
    recipientNote: 'For a college student surviving midterms or finishing a thesis draft. Keep writing!',
    drinkName: 'Finca La Violeta Washed Pour-Over',
    amount: 6.25,
    timestamp: 'Yesterday at 11:30 AM',
    isClaimed: false,
    stickyColor: 'sage'
  },
  {
    id: 'cup-4',
    from: 'Anonymous Neighbor',
    recipientNote: 'For a nurse or healthcare worker on their way home from night shift. Warm gratitude from our neighborhood.',
    drinkName: 'Toasted Hazelnut Miso Latte',
    amount: 6.50,
    timestamp: '3 days ago',
    isClaimed: true,
    claimedBy: 'Claimed by Sarah, ICU RN at 7:45 AM',
    stickyColor: 'amber'
  },
  {
    id: 'cup-5',
    from: 'David & Noah (Bicycle Commuters)',
    recipientNote: 'For someone who rode their bike through the morning drizzle today. Free warm cup for you!',
    drinkName: 'Velvet Dark Chocolate Mocha',
    amount: 6.25,
    timestamp: 'Today at 8:10 AM',
    isClaimed: false,
    stickyColor: 'yellow'
  }
];

export const TURNTABLE_TRACKS: TurntableTrack[] = [
  {
    title: 'My Foolish Heart',
    artist: 'Bill Evans Trio',
    album: 'Sunday at the Village Vanguard (1961)',
    rpm: '33 RPM',
    side: 'Side A'
  },
  {
    title: 'Texas Sun',
    artist: 'Khruangbin & Leon Bridges',
    album: 'Texas Sun EP',
    rpm: '45 RPM',
    side: 'Side A'
  },
  {
    title: 'Naima',
    artist: 'John Coltrane',
    album: 'Giant Steps (Atlantic 1311)',
    rpm: '33 RPM',
    side: 'Side B'
  },
  {
    title: 'Cantaloupe Island',
    artist: 'Herbie Hancock',
    album: 'Empyrean Isles (Blue Note)',
    rpm: '33 RPM',
    side: 'Side A'
  }
];

export const WEATHER_PRESETS: Record<string, WeatherInfo> = {
  morning: {
    condition: 'crisp-sunny',
    tempF: 58,
    label: '58°F • Crisp Morning Sun & Gentle Fog',
    recommendationReason: 'Crisp morning air calls for bright citrus clarity and warm buttery pastry.',
    suggestedDrinkId: 'drink-3'
  },
  midday: {
    condition: 'golden-breeze',
    tempF: 68,
    label: '68°F • Sunlit Breeze & Gentle Sidewalk Hum',
    recommendationReason: 'Midday rhythm: a clean pour-over or nitro cold brew keeps focus razor-sharp.',
    suggestedDrinkId: 'drink-5'
  },
  'golden-hour': {
    condition: 'golden-breeze',
    tempF: 64,
    label: '64°F • Amber Glow & Toasted Cardamom Aromas',
    recommendationReason: 'Golden hour transitions nicely into low-acidity comfort and spiced honey.',
    suggestedDrinkId: 'drink-1'
  },
  'evening-lounge': {
    condition: 'rainy-drizzle',
    tempF: 55,
    label: '55°F • Dusky Vinyl Glow & Soft Drizzle Outside',
    recommendationReason: 'Evening calls for caffeine-free comfort: whole-spice simmered chai or bourbon decaf.',
    suggestedDrinkId: 'drink-7'
  }
};
