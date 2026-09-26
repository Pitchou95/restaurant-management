const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const Chef = require('../models/Chef');
const fallbackStore = require('../db/fallbackStore');

// Home page
exports.getHome = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = fallbackStore.getHomeData();
      return res.render('index', {
        title: 'GourmetHub - Premium Restaurant Management & Culinary Catalog',
        ...data,
      });
    }

    const featuredDishes = await Dish.find({ isChefSpecial: true })
      .populate('chefs', 'name title avatarUrl')
      .limit(3)
      .lean();

    const topRatedDishes = await Dish.find()
      .sort({ rating: -1, reviewsCount: -1 })
      .populate('chefs', 'name')
      .limit(4)
      .lean();

    const spotlightChefs = await Chef.find()
      .sort({ experienceYears: -1 })
      .limit(3)
      .lean();

    const totalDishes = await Dish.countDocuments();
    const totalChefs = await Chef.countDocuments();
    const categoriesCount = (await Dish.distinct('category')).length;

    res.render('index', {
      title: 'GourmetHub - Premium Restaurant Management & Culinary Catalog',
      featuredDishes,
      topRatedDishes,
      spotlightChefs,
      stats: {
        totalDishes,
        totalChefs,
        categoriesCount,
      },
    });
  } catch (err) {
    console.warn('Recovering home page with fallback store:', err.message);
    const data = fallbackStore.getHomeData();
    res.render('index', {
      title: 'GourmetHub - Premium Restaurant Management & Culinary Catalog',
      ...data,
    });
  }
};

// Analytics and Dashboard with Aggregate Queries
exports.getDashboard = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = fallbackStore.getDashboardData();
      return res.render('dashboard/index', {
        title: 'Restaurant Analytics & Statistics - GourmetHub',
        ...data,
      });
    }

    // 1. Total counts & KPI metrics
    const totalDishes = await Dish.countDocuments();
    const totalChefs = await Chef.countDocuments();

    // 2. Aggregate: Dishes count and average price grouped by Category
    const categoryStats = await Dish.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Aggregate: Overall average price & calories
    const overallStats = await Dish.aggregate([
      {
        $group: {
          _id: null,
          avgOverallPrice: { $avg: '$price' },
          avgCalories: { $avg: '$calories' },
          avgPrepTime: { $avg: '$prepTime' },
        },
      },
    ]);

    // 4. Aggregate: Dietary breakdown (Vegetarian vs Non-Vegetarian)
    const dietaryStats = await Dish.aggregate([
      {
        $group: {
          _id: '$isVegetarian',
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Aggregate: Chef specialty breakdown & average experience
    const chefStats = await Chef.aggregate([
      {
        $group: {
          _id: '$specialty',
          count: { $sum: 1 },
          avgExperience: { $avg: '$experienceYears' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 6. Top 5 highest rated dishes
    const topDishes = await Dish.find()
      .sort({ rating: -1, price: -1 })
      .limit(5)
      .populate('chefs', 'name')
      .lean();

    // 7. Price bracket distribution
    const priceBrackets = await Dish.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 15, 25, 40, 100],
          default: 'Premium $100+',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    res.render('dashboard/index', {
      title: 'Restaurant Analytics & Statistics - GourmetHub',
      totalDishes,
      totalChefs,
      categoryStats,
      overallStats: overallStats[0] || { avgOverallPrice: 0, avgCalories: 0, avgPrepTime: 0 },
      dietaryStats,
      chefStats,
      topDishes,
      priceBrackets,
    });
  } catch (err) {
    console.warn('Recovering dashboard with fallback store:', err.message);
    const data = fallbackStore.getDashboardData();
    res.render('dashboard/index', {
      title: 'Restaurant Analytics & Statistics - GourmetHub',
      ...data,
    });
  }
};
