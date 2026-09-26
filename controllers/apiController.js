const Dish = require('../models/Dish');
const Chef = require('../models/Chef');

// GET /api/dishes
exports.getAllDishes = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { description: regex }, { cuisine: regex }];
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const dishes = await Dish.find(query)
      .populate('chefs', 'name title')
      .sort(sortOption)
      .lean();

    res.json({
      success: true,
      count: dishes.length,
      data: dishes,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/dishes/:id
exports.getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)
      .populate('chefs', 'name title specialty avatarUrl')
      .populate('reviews')
      .lean();

    if (!dish) {
      return res.status(404).json({ success: false, error: 'Dish not found' });
    }

    res.json({ success: true, data: dish });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/chefs
exports.getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find()
      .populate('dishes', 'name category price')
      .sort({ experienceYears: -1 })
      .lean();

    res.json({
      success: true,
      count: chefs.length,
      data: chefs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/chefs/:id
exports.getChefById = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id)
      .populate('dishes', 'name category price imageUrl rating')
      .lean();

    if (!chef) {
      return res.status(404).json({ success: false, error: 'Chef not found' });
    }

    res.json({ success: true, data: chef });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/stats (Aggregate data for charts and analytics)
exports.getStats = async (req, res) => {
  try {
    const categoryAggregation = await Dish.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const specialtyAggregation = await Chef.aggregate([
      {
        $group: {
          _id: '$specialty',
          count: { $sum: 1 },
          avgExperience: { $avg: '$experienceYears' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dietaryAggregation = await Dish.aggregate([
      {
        $group: {
          _id: '$isVegetarian',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalDishes = await Dish.countDocuments();
    const totalChefs = await Chef.countDocuments();

    res.json({
      success: true,
      data: {
        totalDishes,
        totalChefs,
        categoryAggregation,
        specialtyAggregation,
        dietaryAggregation,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
