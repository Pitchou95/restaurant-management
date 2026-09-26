const Dish = require('../models/Dish');
const Chef = require('../models/Chef');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// List dishes with pagination (6 per page), search, and filtering
exports.getDishes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 6; // Strictly 6 items per page as required
    const skip = (page - 1) * limit;

    const { search, category, chef, sort, maxPrice, vegetarian } = req.query;

    const query = {};

    // Search across name, description, cuisine
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { cuisine: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Chef filter
    if (chef && chef !== 'all') {
      query.chefs = chef;
    }

    // Max price filter
    if (maxPrice && !isNaN(maxPrice)) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    // Vegetarian filter
    if (vegetarian === 'true') {
      query.isVegetarian = true;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'name') sortOption = { name: 1 };

    const totalDishes = await Dish.countDocuments(query);
    const totalPages = Math.ceil(totalDishes / limit) || 1;

    const dishes = await Dish.find(query)
      .populate('chefs', 'name title avatarUrl')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch all chefs and distinct categories for filter dropdowns
    const allChefs = await Chef.find({}, 'name').sort({ name: 1 }).lean();
    const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];

    res.render('dishes/index', {
      title: 'Our Menu - GourmetHub',
      dishes,
      currentPage: page,
      totalPages,
      totalDishes,
      limit,
      query: req.query,
      allChefs,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

// Show a single dish detail
exports.getDishById = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id)
      .populate('chefs')
      .lean();

    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }

    const reviews = await Review.find({ dish: dish._id })
      .sort({ createdAt: -1 })
      .lean();

    res.render('dishes/show', {
      title: `${dish.name} - GourmetHub`,
      dish,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// Render new dish form
exports.renderNewForm = async (req, res, next) => {
  try {
    const chefs = await Chef.find({}, 'name title').sort({ name: 1 }).lean();
    const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];

    res.render('dishes/new', {
      title: 'Add New Dish - GourmetHub',
      dish: {},
      chefs,
      categories,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
};

// Create a new dish
exports.createDish = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const chefs = await Chef.find({}, 'name title').sort({ name: 1 }).lean();
    const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
    return res.status(400).render('dishes/new', {
      title: 'Add New Dish - GourmetHub',
      dish: req.body,
      chefs,
      categories,
      errors: errors.array(),
    });
  }

  try {
    const {
      name,
      description,
      price,
      category,
      cuisine,
      imageUrl,
      prepTime,
      calories,
      isVegetarian,
      isChefSpecial,
      chefs,
    } = req.body;

    // Normalize chefs array from form checkboxes/select
    let chefIds = [];
    if (chefs) {
      chefIds = Array.isArray(chefs) ? chefs : [chefs];
    }

    const dish = new Dish({
      name,
      description,
      price: parseFloat(price),
      category,
      cuisine,
      imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl : undefined,
      prepTime: parseInt(prepTime),
      calories: calories ? parseInt(calories) : 0,
      isVegetarian: isVegetarian === 'on' || isVegetarian === 'true',
      isChefSpecial: isChefSpecial === 'on' || isChefSpecial === 'true',
      chefs: chefIds,
    });

    await dish.save();

    // Many-to-Many Sync: update chefs to include this new dish
    if (chefIds.length > 0) {
      await Chef.updateMany(
        { _id: { $in: chefIds } },
        { $addToSet: { dishes: dish._id } }
      );
    }

    req.flash('success', `"${dish.name}" was successfully added to the menu!`);
    res.redirect(`/dishes/${dish._id}`);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const chefs = await Chef.find({}, 'name title').sort({ name: 1 }).lean();
      const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
      return res.status(400).render('dishes/new', {
        title: 'Add New Dish - GourmetHub',
        dish: req.body,
        chefs,
        categories,
        errors: Object.values(err.errors).map((e) => ({ msg: e.message })),
      });
    }
    next(err);
  }
};

// Render edit form
exports.renderEditForm = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).lean();
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }

    const chefs = await Chef.find({}, 'name title').sort({ name: 1 }).lean();
    const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];

    // Map selected chef IDs to strings for easy template comparison
    const selectedChefIds = (dish.chefs || []).map((id) => id.toString());

    res.render('dishes/edit', {
      title: `Edit ${dish.name} - GourmetHub`,
      dish,
      chefs,
      selectedChefIds,
      categories,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
};

// Update existing dish
exports.updateDish = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const chefs = await Chef.find({}, 'name title').sort({ name: 1 }).lean();
    const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
    const selectedChefIds = Array.isArray(req.body.chefs)
      ? req.body.chefs
      : req.body.chefs ? [req.body.chefs] : [];

    return res.status(400).render('dishes/edit', {
      title: `Edit Dish - GourmetHub`,
      dish: { ...req.body, _id: req.params.id },
      chefs,
      selectedChefIds,
      categories,
      errors: errors.array(),
    });
  }

  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }

    const {
      name,
      description,
      price,
      category,
      cuisine,
      imageUrl,
      prepTime,
      calories,
      isVegetarian,
      isChefSpecial,
      chefs,
    } = req.body;

    let newChefIds = [];
    if (chefs) {
      newChefIds = Array.isArray(chefs) ? chefs : [chefs];
    }

    const oldChefIds = (dish.chefs || []).map((id) => id.toString());

    // Update dish properties
    dish.name = name;
    dish.description = description;
    dish.price = parseFloat(price);
    dish.category = category;
    dish.cuisine = cuisine;
    if (imageUrl && imageUrl.trim() !== '') {
      dish.imageUrl = imageUrl.trim();
    }
    dish.prepTime = parseInt(prepTime);
    dish.calories = calories ? parseInt(calories) : 0;
    dish.isVegetarian = isVegetarian === 'on' || isVegetarian === 'true';
    dish.isChefSpecial = isChefSpecial === 'on' || isChefSpecial === 'true';
    dish.chefs = newChefIds;

    await dish.save();

    // Many-to-Many Sync:
    // Remove dish from chefs that were deselected
    const removedChefs = oldChefIds.filter((id) => !newChefIds.includes(id));
    if (removedChefs.length > 0) {
      await Chef.updateMany(
        { _id: { $in: removedChefs } },
        { $pull: { dishes: dish._id } }
      );
    }

    // Add dish to newly selected chefs
    const addedChefs = newChefIds.filter((id) => !oldChefIds.includes(id));
    if (addedChefs.length > 0) {
      await Chef.updateMany(
        { _id: { $in: addedChefs } },
        { $addToSet: { dishes: dish._id } }
      );
    }

    req.flash('success', `"${dish.name}" was updated successfully!`);
    res.redirect(`/dishes/${dish._id}`);
  } catch (err) {
    next(err);
  }
};

// Delete dish with cascade cleanup
exports.deleteDish = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }

    const dishName = dish.name;
    const dishId = dish._id;

    // Delete dish document
    await Dish.findByIdAndDelete(dishId);

    // Cascade: clean up references from all chefs
    await Chef.updateMany(
      { dishes: dishId },
      { $pull: { dishes: dishId } }
    );

    // Clean up reviews
    await Review.deleteMany({ dish: dishId });

    req.flash('success', `"${dishName}" was deleted successfully.`);
    res.redirect('/dishes');
  } catch (err) {
    next(err);
  }
};

// Post a review for a dish
exports.addReview = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }

    const { authorName, rating, comment } = req.body;
    const review = new Review({
      dish: dish._id,
      authorName,
      rating: parseInt(rating),
      comment,
    });

    await review.save();
    req.flash('success', 'Your review and rating have been posted!');
    res.redirect(`/dishes/${dish._id}`);
  } catch (err) {
    next(err);
  }
};

// Bonus: Export dishes to CSV
exports.exportCSV = async (req, res, next) => {
  try {
    const dishes = await Dish.find().populate('chefs', 'name').lean();

    const headers = ['ID', 'Name', 'Category', 'Cuisine', 'Price', 'PrepTime(min)', 'Calories', 'Rating', 'Vegetarian', 'Chefs'];
    const rows = dishes.map((d) => [
      `"${d._id}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.category}"`,
      `"${d.cuisine}"`,
      d.price.toFixed(2),
      d.prepTime,
      d.calories,
      d.rating,
      d.isVegetarian ? 'Yes' : 'No',
      `"${(d.chefs || []).map((c) => c.name).join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=gourmethub_menu.csv');
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
};
