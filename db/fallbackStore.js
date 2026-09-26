/**
 * In-Memory Fallback Store & Data Provider for Serverless & Offline Environments
 * Ensures GourmetHub never crashes with 500 errors if MongoDB Atlas is disconnected.
 */

const baseChefs = [
  {
    _id: '65e010000000000000000001',
    name: 'Marco Rossi',
    title: 'Executive Chef',
    bio: 'Born in Florence, Chef Marco has spent over 18 years refining classic Tuscan flavors with contemporary Michelin-level precision.',
    specialty: 'Italian & Mediterranean Cuisine',
    experienceYears: 18,
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80',
    email: 'marco.rossi@gourmethub.com',
    phone: '+1 (555) 234-5678',
    rating: 4.9,
    dishes: [],
  },
  {
    _id: '65e010000000000000000002',
    name: 'Hélène Dupont',
    title: 'Head Pastry Master',
    bio: 'Trained at the prestigious Le Cordon Bleu in Paris, Hélène transforms simple ingredients into symphonies of delicate textures.',
    specialty: 'French Patisserie & Desserts',
    experienceYears: 14,
    avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    email: 'helene.dupont@gourmethub.com',
    phone: '+1 (555) 345-6789',
    rating: 4.9,
    dishes: [],
  },
  {
    _id: '65e010000000000000000003',
    name: 'Kenji Takahashi',
    title: 'Master Sushi Chef',
    bio: 'With 16 years perfecting the art of Edomae sushi in Tokyo and Kyoto, Kenji brings an obsession with fish freshness and knife technique.',
    specialty: 'Japanese Kaiseki & Robata',
    experienceYears: 16,
    avatarUrl: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&auto=format&fit=crop&q=80',
    email: 'kenji.takahashi@gourmethub.com',
    phone: '+1 (555) 456-7890',
    rating: 5.0,
    dishes: [],
  },
  {
    _id: '65e010000000000000000004',
    name: 'Fatima Zahra El-Amrani',
    title: 'Culinary Director',
    bio: 'Celebrated for revitalizing ancient Maghreb palace recipes with modern organic gastronomy and aromatic slow-cooking techniques.',
    specialty: 'Moroccan & North African Cuisine',
    experienceYears: 15,
    avatarUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=600&auto=format&fit=crop&q=80',
    email: 'fatima.zahra@gourmethub.com',
    phone: '+1 (555) 567-8901',
    rating: 4.9,
    dishes: [],
  },
  {
    _id: '65e010000000000000000005',
    name: 'Carlos Mendoza',
    title: 'Asado & Grill Virtuoso',
    bio: 'Hailing from Buenos Aires, Carlos commands live-wood fires and dry-aging techniques to deliver unrivaled steak and roast experiences.',
    specialty: 'Latin American Grill & Steaks',
    experienceYears: 12,
    avatarUrl: 'https://images.unsplash.com/photo-1574966739985-e11a3fb98730?w=600&auto=format&fit=crop&q=80',
    email: 'carlos.mendoza@gourmethub.com',
    phone: '+1 (555) 678-9012',
    rating: 4.8,
    dishes: [],
  },
  {
    _id: '65e010000000000000000006',
    name: 'Priya Sharma',
    title: 'Master of Spices',
    bio: 'A culinary storyteller blending regional Indian herbs, royal Mughal recipes, and modern slow reductions.',
    specialty: 'Contemporary Indian & Spice Craft',
    experienceYears: 11,
    avatarUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=600&auto=format&fit=crop&q=80',
    email: 'priya.sharma@gourmethub.com',
    phone: '+1 (555) 789-0123',
    rating: 4.8,
    dishes: [],
  },
  {
    _id: '65e010000000000000000007',
    name: 'Antoine Laurent',
    title: 'Executive Sous Chef',
    bio: 'Specialist in sauces, stocks, and delicate seafood preparations honed across 3-star kitchens in Lyon and Provence.',
    specialty: 'French Bistro & Seafood',
    experienceYears: 9,
    avatarUrl: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=600&auto=format&fit=crop&q=80',
    email: 'antoine.laurent@gourmethub.com',
    phone: '+1 (555) 890-1234',
    rating: 4.7,
    dishes: [],
  },
  {
    _id: '65e010000000000000000008',
    name: 'Elena Rostova',
    title: 'Artisan Baker & Chocolatier',
    bio: 'Renowned for wild yeast sourdoughs, viennoiseries, and bean-to-bar dark chocolate sculptures.',
    specialty: 'Artisan Baking & Chocolate',
    experienceYears: 8,
    avatarUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&auto=format&fit=crop&q=80',
    email: 'elena.rostova@gourmethub.com',
    phone: '+1 (555) 901-2345',
    rating: 4.8,
    dishes: [],
  },
  {
    _id: '65e010000000000000000009',
    name: 'David Miller',
    title: 'Beverage Director & Mixologist',
    bio: 'Master of barrel aging, botanical distillations, and farm-to-glass mocktails that harmonize with every dining course.',
    specialty: 'Mixology & Craft Beverages',
    experienceYears: 10,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
    email: 'david.miller@gourmethub.com',
    phone: '+1 (555) 012-3456',
    rating: 4.7,
    dishes: [],
  },
  {
    _id: '65e010000000000000000010',
    name: 'Mei-Ling Chen',
    title: 'Wok Master & Dim Sum Specialist',
    bio: 'Trained in Hong Kong, Mei-Ling commands high-heat wok techniques and intricate crystal dumpling artistry.',
    specialty: 'Cantonese & Dim Sum Artistry',
    experienceYears: 13,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    email: 'meiling.chen@gourmethub.com',
    phone: '+1 (555) 123-4567',
    rating: 4.9,
    dishes: [],
  },
];

const baseDishes = [
  {
    _id: '65e020000000000000000001',
    name: 'Truffle Tagliolini al Tartufo',
    description: 'Handmade fresh egg pasta tossed with cultured Normandy butter, 36-month Parmigiano-Reggiano, and freshly shaved black winter truffles from Norcia.',
    price: 28.5,
    category: 'Mains',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    prepTime: 20,
    calories: 680,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 2,
    chefIds: ['65e010000000000000000001', '65e010000000000000000007'],
    createdAt: new Date('2026-01-01'),
  },
  {
    _id: '65e020000000000000000002',
    name: 'Wagyu Ribeye Steak au Poivre',
    description: 'A5 Miyazaki Wagyu ribeye flame-seared over white oak, cracked Tellicherry peppercorn cognac glaze, and roasted marrow bone butter.',
    price: 58.0,
    category: 'Chef Specials',
    cuisine: 'French',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    prepTime: 25,
    calories: 890,
    isVegetarian: false,
    isChefSpecial: true,
    rating: 5.0,
    reviewsCount: 1,
    chefIds: ['65e010000000000000000005', '65e010000000000000000007'],
    createdAt: new Date('2026-01-02'),
  },
  {
    _id: '65e020000000000000000003',
    name: 'Royal Moroccan Lamb Tagine',
    description: 'Tender milk-fed lamb shank slow-braised for 7 hours with saffron, medjool dates, toasted Marcona almonds, and sesame honey jus in a clay tagine.',
    price: 34.0,
    category: 'Chef Specials',
    cuisine: 'Moroccan',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
    prepTime: 40,
    calories: 780,
    isVegetarian: false,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 1,
    chefIds: ['65e010000000000000000004'],
    createdAt: new Date('2026-01-03'),
  },
  {
    _id: '65e020000000000000000004',
    name: 'Dragon Roll & Otoro Nigiri Platter',
    description: 'Bluefin fatty tuna (Otoro), king salmon, and broiled freshwater eel roll adorned with avocado, flying fish roe, and gold leaf.',
    price: 42.0,
    category: 'Mains',
    cuisine: 'Japanese',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    prepTime: 18,
    calories: 520,
    isVegetarian: false,
    isChefSpecial: true,
    rating: 5.0,
    reviewsCount: 1,
    chefIds: ['65e010000000000000000003'],
    createdAt: new Date('2026-01-04'),
  },
  {
    _id: '65e020000000000000000005',
    name: 'Burrata di Puglia & Heirloom Carpaccio',
    description: 'Creamy artisanal burrata accompanied by multi-colored heirloom tomatoes, basil-infused Ligurian olive oil, and aged Modena balsamic drizzle.',
    price: 18.5,
    category: 'Appetizers',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80',
    prepTime: 12,
    calories: 420,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.8,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000001'],
    createdAt: new Date('2026-01-05'),
  },
  {
    _id: '65e020000000000000000006',
    name: 'Crispy Calamari & Tiger Prawns Fritti',
    description: 'Lightly semolina-crusted baby squid and Mediterranean wild prawns served with preserved lemon saffron aioli and pickled fresno chiles.',
    price: 19.0,
    category: 'Appetizers',
    cuisine: 'Mediterranean',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
    prepTime: 15,
    calories: 490,
    isVegetarian: false,
    isChefSpecial: false,
    rating: 4.7,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000001', '65e010000000000000000007'],
    createdAt: new Date('2026-01-06'),
  },
  {
    _id: '65e020000000000000000007',
    name: 'Moroccan Chicken & Almond Pastilla',
    description: 'Golden layers of delicate warqa pastry encasing shredded organic chicken braised with cinnamon, crushed almonds, orange blossom water, and dusted with powdered sugar.',
    price: 22.0,
    category: 'Appetizers',
    cuisine: 'Moroccan',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    prepTime: 30,
    calories: 610,
    isVegetarian: false,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000004'],
    createdAt: new Date('2026-01-07'),
  },
  {
    _id: '65e020000000000000000008',
    name: 'Porcini & Morel Forest Risotto',
    description: 'Acquerello carnaroli rice simmered in rich mushroom broth with sautéed wild chanterelles, black garlic purée, and white truffle oil.',
    price: 26.0,
    category: 'Mains',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80',
    prepTime: 25,
    calories: 580,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.8,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000001'],
    createdAt: new Date('2026-01-08'),
  },
  {
    _id: '65e020000000000000000009',
    name: 'Grand Cru Valrhona Chocolate Lava Cake',
    description: 'Warm, molten center dark chocolate cake made with 72% Araguani cocoa, Madagascar bourbon vanilla bean gelato, and raspberry coulis.',
    price: 14.5,
    category: 'Desserts',
    cuisine: 'French',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    prepTime: 15,
    calories: 550,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 1,
    chefIds: ['65e010000000000000000002', '65e010000000000000000008'],
    createdAt: new Date('2026-01-09'),
  },
  {
    _id: '65e020000000000000000010',
    name: 'Tahitian Vanilla & Lavender Crème Brûlée',
    description: 'Silky smooth baked custard infused with pure Tahitian vanilla pods and delicate lavender, topped with glass-like caramelized turbinado sugar.',
    price: 13.0,
    category: 'Desserts',
    cuisine: 'French',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80',
    prepTime: 10,
    calories: 430,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.8,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000002'],
    createdAt: new Date('2026-01-10'),
  },
  {
    _id: '65e020000000000000000011',
    name: 'Smoked Rosemary Old Fashioned',
    description: 'Small-batch bourbon infused with charred rosemary, bitters, Demerara syrup, and presented under a dome of aromatic cherrywood smoke.',
    price: 16.0,
    category: 'Beverages',
    cuisine: 'American',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
    prepTime: 8,
    calories: 190,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000009'],
    createdAt: new Date('2026-01-11'),
  },
  {
    _id: '65e020000000000000000012',
    name: 'Sparkling Hibiscus & Ginger Elixir',
    description: 'Refreshing cold-pressed Egyptian hibiscus blossom infusion, organic pressed ginger juice, fresh mint, and effervescent sparkling mountain water.',
    price: 9.5,
    category: 'Beverages',
    cuisine: 'International',
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
    prepTime: 6,
    calories: 85,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.7,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000009'],
    createdAt: new Date('2026-01-12'),
  },
  {
    _id: '65e020000000000000000013',
    name: 'Peking Spiced Glazed Duck Breast',
    description: 'Crisp-skinned duck breast marinated in five-spice and wild clover honey, served with steamed bao buns, scallion ribbons, and hoisin reduction.',
    price: 38.0,
    category: 'Chef Specials',
    cuisine: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1514944298350-f89a94157143?w=800&auto=format&fit=crop&q=80',
    prepTime: 30,
    calories: 740,
    isVegetarian: false,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000010'],
    createdAt: new Date('2026-01-13'),
  },
  {
    _id: '65e020000000000000000014',
    name: 'Paneer Tikka & Wild Garlic Naan',
    description: 'Charred tandoor-roasted cottage cheese marinated in strained yogurt, Kashmiri chilies, and fenugreek, served with clay oven garlic butter naan.',
    price: 24.5,
    category: 'Mains',
    cuisine: 'Indian',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
    prepTime: 22,
    calories: 620,
    isVegetarian: true,
    isChefSpecial: false,
    rating: 4.8,
    reviewsCount: 0,
    chefIds: ['65e010000000000000000006'],
    createdAt: new Date('2026-01-14'),
  },
];

const baseReviews = [
  {
    _id: '65e030000000000000000001',
    dish: '65e020000000000000000001',
    authorName: 'Sophie Moreau',
    rating: 5,
    comment: 'Absolute perfection! The truffle aroma hit the table before the plate was even set down. The fresh pasta was sublime.',
    createdAt: new Date('2026-01-15'),
  },
  {
    _id: '65e030000000000000000002',
    dish: '65e020000000000000000001',
    authorName: 'Julian Vance',
    rating: 5,
    comment: 'Creamy, rich, yet perfectly balanced. Will definitely order this again next week.',
    createdAt: new Date('2026-01-16'),
  },
  {
    _id: '65e030000000000000000003',
    dish: '65e020000000000000000002',
    authorName: 'Marcus Sterling',
    rating: 5,
    comment: 'Melt-in-your-mouth Wagyu. The peppercorn glaze with cognac is pure genius.',
    createdAt: new Date('2026-01-17'),
  },
  {
    _id: '65e030000000000000000004',
    dish: '65e020000000000000000003',
    authorName: 'Yassine B.',
    rating: 5,
    comment: 'Tastes just like the authentic imperial tagines in Fes. The meat was falling off the bone.',
    createdAt: new Date('2026-01-18'),
  },
  {
    _id: '65e030000000000000000005',
    dish: '65e020000000000000000004',
    authorName: 'Dr. Emily Chen',
    rating: 5,
    comment: 'Otoro was unimaginably fresh. Chef Kenji Takahashi’s knife work is world class.',
    createdAt: new Date('2026-01-19'),
  },
  {
    _id: '65e030000000000000000006',
    dish: '65e020000000000000000009',
    authorName: 'Claire Bennet',
    rating: 5,
    comment: 'The best chocolate fondant in the city. The warm molten chocolate paired with the bourbon vanilla gelato is heavenly.',
    createdAt: new Date('2026-01-20'),
  },
];

// Helper to populate chefs on a dish
function populateDish(dish, chefsList) {
  const populatedChefs = (dish.chefIds || []).map((id) =>
    chefsList.find((c) => c._id.toString() === id.toString()) || { _id: id, name: 'Guest Chef' }
  );
  return {
    ...dish,
    chefs: populatedChefs,
  };
}

class FallbackStore {
  constructor() {
    this.chefs = JSON.parse(JSON.stringify(baseChefs));
    this.dishes = JSON.parse(JSON.stringify(baseDishes));
    this.reviews = JSON.parse(JSON.stringify(baseReviews));

    // Link chefs with their dishes
    this.dishes.forEach((d) => {
      (d.chefIds || []).forEach((cId) => {
        const chef = this.chefs.find((c) => c._id.toString() === cId.toString());
        if (chef && !chef.dishes.includes(d._id)) {
          chef.dishes.push(d._id);
        }
      });
    });
  }

  getHomeData() {
    const populated = this.dishes.map((d) => populateDish(d, this.chefs));
    const featuredDishes = populated.filter((d) => d.isChefSpecial).slice(0, 3);
    const topRatedDishes = [...populated].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const spotlightChefs = [...this.chefs].sort((a, b) => b.experienceYears - a.experienceYears).slice(0, 3);
    const categoriesCount = new Set(this.dishes.map((d) => d.category)).size;

    return {
      featuredDishes,
      topRatedDishes,
      spotlightChefs,
      stats: {
        totalDishes: this.dishes.length,
        totalChefs: this.chefs.length,
        categoriesCount,
      },
    };
  }

  getDashboardData() {
    const totalDishes = this.dishes.length;
    const totalChefs = this.chefs.length;

    // Category stats
    const categoryMap = {};
    this.dishes.forEach((d) => {
      if (!categoryMap[d.category]) {
        categoryMap[d.category] = { _id: d.category, count: 0, prices: [] };
      }
      categoryMap[d.category].count += 1;
      categoryMap[d.category].prices.push(d.price);
    });

    const categoryStats = Object.values(categoryMap).map((c) => ({
      _id: c._id,
      count: c.count,
      avgPrice: c.prices.reduce((a, b) => a + b, 0) / c.prices.length,
      minPrice: Math.min(...c.prices),
      maxPrice: Math.max(...c.prices),
    })).sort((a, b) => b.count - a.count);

    // Overall stats
    const avgOverallPrice = this.dishes.reduce((a, b) => a + b.price, 0) / (totalDishes || 1);
    const avgCalories = this.dishes.reduce((a, b) => a + (b.calories || 0), 0) / (totalDishes || 1);
    const avgPrepTime = this.dishes.reduce((a, b) => a + (b.prepTime || 0), 0) / (totalDishes || 1);

    const overallStats = {
      avgOverallPrice,
      avgCalories,
      avgPrepTime,
    };

    // Dietary stats
    const vegCount = this.dishes.filter((d) => d.isVegetarian).length;
    const dietaryStats = [
      { _id: true, count: vegCount },
      { _id: false, count: totalDishes - vegCount },
    ];

    // Chef stats
    const specMap = {};
    this.chefs.forEach((c) => {
      if (!specMap[c.specialty]) {
        specMap[c.specialty] = { _id: c.specialty, count: 0, exp: [] };
      }
      specMap[c.specialty].count += 1;
      specMap[c.specialty].exp.push(c.experienceYears);
    });

    const chefStats = Object.values(specMap).map((s) => ({
      _id: s._id,
      count: s.count,
      avgExperience: s.exp.reduce((a, b) => a + b, 0) / s.exp.length,
    })).sort((a, b) => b.count - a.count);

    const topDishes = [...this.dishes]
      .sort((a, b) => b.rating - a.rating || b.price - a.price)
      .slice(0, 5)
      .map((d) => populateDish(d, this.chefs));

    const priceBrackets = [
      { _id: 0, count: this.dishes.filter((d) => d.price < 15).length },
      { _id: 15, count: this.dishes.filter((d) => d.price >= 15 && d.price < 25).length },
      { _id: 25, count: this.dishes.filter((d) => d.price >= 25 && d.price < 40).length },
      { _id: 40, count: this.dishes.filter((d) => d.price >= 40).length },
    ];

    return {
      totalDishes,
      totalChefs,
      categoryStats,
      overallStats,
      dietaryStats,
      chefStats,
      topDishes,
      priceBrackets,
    };
  }

  getDishes(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = 6;
    const skip = (page - 1) * limit;

    let filtered = this.dishes.map((d) => populateDish(d, this.chefs));

    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.cuisine.toLowerCase().includes(q)
      );
    }

    if (query.category && query.category !== 'all') {
      filtered = filtered.filter((d) => d.category === query.category);
    }

    if (query.chef && query.chef !== 'all') {
      filtered = filtered.filter((d) =>
        (d.chefIds || []).some((cId) => cId.toString() === query.chef.toString())
      );
    }

    if (query.maxPrice && !isNaN(query.maxPrice)) {
      filtered = filtered.filter((d) => d.price <= parseFloat(query.maxPrice));
    }

    if (query.vegetarian === 'true') {
      filtered = filtered.filter((d) => d.isVegetarian);
    }

    if (query.sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (query.sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (query.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (query.sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalDishes = filtered.length;
    const totalPages = Math.ceil(totalDishes / limit) || 1;
    const paginatedDishes = filtered.slice(skip, skip + limit);

    return {
      dishes: paginatedDishes,
      totalDishes,
      totalPages,
      currentPage: page,
      limit,
      allChefs: this.chefs.map((c) => ({ _id: c._id, name: c.name })),
      categories: ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'],
    };
  }

  getDishById(id) {
    const dish = this.dishes.find((d) => d._id.toString() === id.toString());
    if (!dish) return null;

    const populated = populateDish(dish, this.chefs);
    const reviews = this.reviews.filter((r) => r.dish.toString() === id.toString());

    return {
      ...populated,
      reviews,
    };
  }

  getChefs(query = {}) {
    let filtered = [...this.chefs].map((c) => {
      const assignedDishes = this.dishes
        .filter((d) => (d.chefIds || []).includes(c._id))
        .map((d) => ({
          _id: d._id,
          name: d.name,
          category: d.category,
          price: d.price,
          imageUrl: d.imageUrl,
        }));
      return {
        ...c,
        dishes: assignedDishes,
      };
    });

    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.specialty.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q)
      );
    }

    if (query.specialty && query.specialty !== 'all') {
      filtered = filtered.filter((c) => c.specialty === query.specialty);
    }

    filtered.sort((a, b) => b.experienceYears - a.experienceYears);

    const specialties = [...new Set(this.chefs.map((c) => c.specialty))];

    return {
      chefs: filtered,
      specialties,
    };
  }

  getChefById(id) {
    const chef = this.chefs.find((c) => c._id.toString() === id.toString());
    if (!chef) return null;

    const assignedDishes = this.dishes
      .filter((d) => (d.chefIds || []).includes(chef._id))
      .map((d) => ({
        _id: d._id,
        name: d.name,
        category: d.category,
        price: d.price,
        imageUrl: d.imageUrl,
        description: d.description,
        rating: d.rating,
      }));

    return {
      ...chef,
      dishes: assignedDishes,
    };
  }

  getAllCategories() {
    return ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
  }

  getAllChefs() {
    return this.chefs.map((c) => ({ _id: c._id, name: c.name }));
  }

  createDish(data) {
    const newId = '65e02000000000000000' + (this.dishes.length + 1).toString().padStart(4, '0');
    const chefIds = Array.isArray(data.chefs) ? data.chefs : data.chefs ? [data.chefs] : [];
    const newDish = {
      _id: newId,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price) || 0,
      category: data.category,
      cuisine: data.cuisine || 'International',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      prepTime: parseInt(data.prepTime) || 20,
      calories: parseInt(data.calories) || 500,
      isVegetarian: data.isVegetarian === true || data.isVegetarian === 'true',
      isChefSpecial: data.isChefSpecial === true || data.isChefSpecial === 'true',
      rating: 5.0,
      reviewsCount: 0,
      chefIds,
      createdAt: new Date(),
    };
    this.dishes.unshift(newDish);
    return newDish;
  }

  updateDish(id, data) {
    const index = this.dishes.findIndex((d) => d._id.toString() === id.toString());
    if (index === -1) return null;

    const chefIds = Array.isArray(data.chefs) ? data.chefs : data.chefs ? [data.chefs] : this.dishes[index].chefIds;
    this.dishes[index] = {
      ...this.dishes[index],
      name: data.name || this.dishes[index].name,
      description: data.description || this.dishes[index].description,
      price: data.price ? parseFloat(data.price) : this.dishes[index].price,
      category: data.category || this.dishes[index].category,
      cuisine: data.cuisine || this.dishes[index].cuisine,
      imageUrl: data.imageUrl || this.dishes[index].imageUrl,
      prepTime: data.prepTime ? parseInt(data.prepTime) : this.dishes[index].prepTime,
      calories: data.calories ? parseInt(data.calories) : this.dishes[index].calories,
      isVegetarian: data.isVegetarian !== undefined ? (data.isVegetarian === true || data.isVegetarian === 'true') : this.dishes[index].isVegetarian,
      isChefSpecial: data.isChefSpecial !== undefined ? (data.isChefSpecial === true || data.isChefSpecial === 'true') : this.dishes[index].isChefSpecial,
      chefIds,
    };
    return this.dishes[index];
  }

  deleteDish(id) {
    const index = this.dishes.findIndex((d) => d._id.toString() === id.toString());
    if (index !== -1) {
      this.dishes.splice(index, 1);
      return true;
    }
    return false;
  }

  createReview(dishId, data) {
    const newReview = {
      _id: '65e03000000000000000' + (this.reviews.length + 1).toString().padStart(4, '0'),
      dish: dishId,
      authorName: data.authorName || 'Guest Reviewer',
      rating: parseInt(data.rating) || 5,
      comment: data.comment || '',
      createdAt: new Date(),
    };
    this.reviews.unshift(newReview);
    const dish = this.dishes.find((d) => d._id.toString() === dishId.toString());
    if (dish) {
      dish.reviewsCount = (dish.reviewsCount || 0) + 1;
    }
    return newReview;
  }
}

// Export singleton instance
const fallbackStore = new FallbackStore();

module.exports = fallbackStore;
