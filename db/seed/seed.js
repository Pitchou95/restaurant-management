const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Dish = require('../../models/Dish');
const Chef = require('../../models/Chef');
const Review = require('../../models/Review');

const chefsData = [
  {
    name: 'Marco Rossi',
    title: 'Executive Chef',
    bio: 'Born in Florence, Chef Marco has spent over 18 years refining classic Tuscan flavors with contemporary Michelin-level precision.',
    specialty: 'Italian & Mediterranean Cuisine',
    experienceYears: 18,
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80',
    email: 'marco.rossi@gourmethub.com',
    phone: '+1 (555) 234-5678',
    rating: 4.9,
  },
  {
    name: 'Hélène Dupont',
    title: 'Head Pastry Master',
    bio: 'Trained at the prestigious Le Cordon Bleu in Paris, Hélène transforms simple ingredients into symphonies of delicate textures.',
    specialty: 'French Patisserie & Desserts',
    experienceYears: 14,
    avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    email: 'helene.dupont@gourmethub.com',
    phone: '+1 (555) 345-6789',
    rating: 4.9,
  },
  {
    name: 'Kenji Takahashi',
    title: 'Master Sushi Chef',
    bio: 'With 16 years perfecting the art of Edomae sushi in Tokyo and Kyoto, Kenji brings an obsession with fish freshness and knife technique.',
    specialty: 'Japanese Kaiseki & Robata',
    experienceYears: 16,
    avatarUrl: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&auto=format&fit=crop&q=80',
    email: 'kenji.takahashi@gourmethub.com',
    phone: '+1 (555) 456-7890',
    rating: 5.0,
  },
  {
    name: 'Fatima Zahra El-Amrani',
    title: 'Culinary Director',
    bio: 'Celebrated for revitalizing ancient Maghreb palace recipes with modern organic gastronomy and aromatic slow-cooking techniques.',
    specialty: 'Moroccan & North African Cuisine',
    experienceYears: 15,
    avatarUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=600&auto=format&fit=crop&q=80',
    email: 'fatima.zahra@gourmethub.com',
    phone: '+1 (555) 567-8901',
    rating: 4.9,
  },
  {
    name: 'Carlos Mendoza',
    title: 'Asado & Grill Virtuoso',
    bio: 'Hailing from Buenos Aires, Carlos commands live-wood fires and dry-aging techniques to deliver unrivaled steak and roast experiences.',
    specialty: 'Latin American Grill & Steaks',
    experienceYears: 12,
    avatarUrl: 'https://images.unsplash.com/photo-1574966739985-e11a3fb98730?w=600&auto=format&fit=crop&q=80',
    email: 'carlos.mendoza@gourmethub.com',
    phone: '+1 (555) 678-9012',
    rating: 4.8,
  },
  {
    name: 'Priya Sharma',
    title: 'Master of Spices',
    bio: 'A culinary storyteller blending regional Indian herbs, royal Mughal recipes, and modern slow reductions.',
    specialty: 'Contemporary Indian & Spice Craft',
    experienceYears: 11,
    avatarUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=600&auto=format&fit=crop&q=80',
    email: 'priya.sharma@gourmethub.com',
    phone: '+1 (555) 789-0123',
    rating: 4.8,
  },
  {
    name: 'Antoine Laurent',
    title: 'Executive Sous Chef',
    bio: 'Specialist in sauces, stocks, and delicate seafood preparations honed across 3-star kitchens in Lyon and Provence.',
    specialty: 'French Bistro & Seafood',
    experienceYears: 9,
    avatarUrl: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=600&auto=format&fit=crop&q=80',
    email: 'antoine.laurent@gourmethub.com',
    phone: '+1 (555) 890-1234',
    rating: 4.7,
  },
  {
    name: 'Elena Rostova',
    title: 'Artisan Baker & Chocolatier',
    bio: 'Renowned for wild yeast sourdoughs, viennoiseries, and bean-to-bar dark chocolate sculptures.',
    specialty: 'Artisan Baking & Chocolate',
    experienceYears: 8,
    avatarUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&auto=format&fit=crop&q=80',
    email: 'elena.rostova@gourmethub.com',
    phone: '+1 (555) 901-2345',
    rating: 4.8,
  },
  {
    name: 'David Miller',
    title: 'Beverage Director & Mixologist',
    bio: 'Master of barrel aging, botanical distillations, and farm-to-glass mocktails that harmonize with every dining course.',
    specialty: 'Mixology & Craft Beverages',
    experienceYears: 10,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
    email: 'david.miller@gourmethub.com',
    phone: '+1 (555) 012-3456',
    rating: 4.7,
  },
  {
    name: 'Mei-Ling Chen',
    title: 'Wok Master & Dim Sum Specialist',
    bio: 'Trained in Hong Kong, Mei-Ling commands high-heat wok techniques and intricate crystal dumpling artistry.',
    specialty: 'Cantonese & Dim Sum Artistry',
    experienceYears: 13,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    email: 'meiling.chen@gourmethub.com',
    phone: '+1 (555) 123-4567',
    rating: 4.9,
  },
];

const dishesRawData = [
  {
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
    chefIndexes: [0, 6], // Marco Rossi, Antoine Laurent
  },
  {
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
    chefIndexes: [4, 6], // Carlos Mendoza, Antoine Laurent
  },
  {
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
    chefIndexes: [3], // Fatima Zahra
  },
  {
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
    chefIndexes: [2], // Kenji Takahashi
  },
  {
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
    chefIndexes: [0], // Marco Rossi
  },
  {
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
    chefIndexes: [0, 6], // Marco Rossi, Antoine Laurent
  },
  {
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
    chefIndexes: [3], // Fatima Zahra
  },
  {
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
    chefIndexes: [0], // Marco Rossi
  },
  {
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
    chefIndexes: [1, 7], // Hélène Dupont, Elena Rostova
  },
  {
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
    chefIndexes: [1], // Hélène Dupont
  },
  {
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
    chefIndexes: [8], // David Miller
  },
  {
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
    chefIndexes: [8], // David Miller
  },
  {
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
    chefIndexes: [9], // Mei-Ling Chen
  },
  {
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
    chefIndexes: [5], // Priya Sharma
  },
];

async function seedData() {
  try {
    console.log('--- Commencing Database Seeding ---');

    // 1. Clear existing collections
    await Dish.deleteMany({});
    await Chef.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data from collections.');

    // 2. Insert all 10 Chefs
    const createdChefs = await Chef.insertMany(chefsData);
    console.log(`Inserted ${createdChefs.length} Master Chefs.`);

    // 3. Prepare Dishes with Mongoose ObjectId references to Chefs
    const dishesToInsert = dishesRawData.map((dishItem) => {
      const assignedChefIds = dishItem.chefIndexes.map((idx) => createdChefs[idx]._id);
      return {
        name: dishItem.name,
        description: dishItem.description,
        price: dishItem.price,
        category: dishItem.category,
        cuisine: dishItem.cuisine,
        imageUrl: dishItem.imageUrl,
        prepTime: dishItem.prepTime,
        calories: dishItem.calories,
        isVegetarian: dishItem.isVegetarian,
        isChefSpecial: dishItem.isChefSpecial,
        rating: dishItem.rating,
        chefs: assignedChefIds,
      };
    });

    const createdDishes = await Dish.insertMany(dishesToInsert);
    console.log(`Inserted ${createdDishes.length} Signature Dishes.`);

    // 4. Bidirectional relationship synchronization:
    // Update each Chef's `dishes` array with the ObjectId of the dishes they are assigned to
    for (let i = 0; i < dishesRawData.length; i++) {
      const dishDoc = createdDishes[i];
      const chefIndexes = dishesRawData[i].chefIndexes;
      for (const idx of chefIndexes) {
        const chefDoc = createdChefs[idx];
        await Chef.findByIdAndUpdate(chefDoc._id, {
          $addToSet: { dishes: dishDoc._id },
        });
      }
    }
    console.log('Successfully established bidirectional Many-to-Many references.');

    // 5. Insert Sample Customer Reviews
    const sampleReviews = [
      {
        dish: createdDishes[0]._id, // Truffle Tagliolini
        authorName: 'Sophie Moreau',
        rating: 5,
        comment: 'Absolute perfection! The truffle aroma hit the table before the plate was even set down. The fresh pasta was sublime.',
      },
      {
        dish: createdDishes[0]._id,
        authorName: 'Julian Vance',
        rating: 5,
        comment: 'Creamy, rich, yet perfectly balanced. Will definitely order this again next week.',
      },
      {
        dish: createdDishes[1]._id, // Wagyu
        authorName: 'Marcus Sterling',
        rating: 5,
        comment: 'Melt-in-your-mouth Wagyu. The peppercorn glaze with cognac is pure genius.',
      },
      {
        dish: createdDishes[2]._id, // Lamb Tagine
        authorName: 'Yassine B.',
        rating: 5,
        comment: 'Tastes just like the authentic imperial tagines in Fes. The meat was falling off the bone.',
      },
      {
        dish: createdDishes[3]._id, // Sushi Platter
        authorName: 'Dr. Emily Chen',
        rating: 5,
        comment: 'Otoro was unimaginably fresh. Chef Kenji Takahashi’s knife work is world class.',
      },
      {
        dish: createdDishes[8]._id, // Lava Cake
        authorName: 'Claire Bennet',
        rating: 5,
        comment: 'The best chocolate fondant in the city. The warm molten chocolate paired with the bourbon vanilla gelato is heavenly.',
      },
    ];

    await Review.insertMany(sampleReviews);
    console.log(`Inserted ${sampleReviews.length} sample reviews.`);

    // Update review counts on dishes
    for (const d of createdDishes) {
      const count = await Review.countDocuments({ dish: d._id });
      if (count > 0) {
        await Dish.findByIdAndUpdate(d._id, { reviewsCount: count });
      }
    }

    console.log('--- Database Seeding Completed Successfully! ---');
    return true;
  } catch (err) {
    console.error('Error during database seeding:', err);
    throw err;
  }
}

// Allow direct execution via `npm run seed` or `node db/seed/seed.js`
if (require.main === module) {
  const { connectDB, closeDB } = require('../connection');
  (async () => {
    try {
      await connectDB();
      await seedData();
      await closeDB();
      console.log('Seeding script finished and database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Seeding execution failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedData };
