const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const Chef = require('../models/Chef');
const Review = require('../models/Review');
const fallbackStore = require('../db/fallbackStore');
const { validationResult } = require('express-validator');

// List dishes with pagination (6 per page), search, and filtering
exports.getDishes = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = fallbackStore.getDishes(req.query);
      return res.render('dishes/index', {
        title: 'Our Menu - GourmetHub',
        ...data,
        query: req.query,
      });
    }

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
    console.warn('Recovering dishes page with fallback store:', err.message);
    const data = fallbackStore.getDishes(req.query);
    res.render('dishes/index', {
      title: 'Our Menu - GourmetHub',
      ...data,
      query: req.query,
    });
  }
};

// Show a single dish detail
exports.getDishById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const dish = fallbackStore.getDishById(req.params.id);
      if (!dish) {
        req.flash('error', 'Dish not found');
        return res.redirect('/dishes');
      }
      return res.render('dishes/show', {
        title: `${dish.name} - GourmetHub`,
        dish,
        reviews: dish.reviews || [],
      });
    }

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
    console.warn('Recovering single dish with fallback store:', err.message);
    const dish = fallbackStore.getDishById(req.params.id);
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }
    res.render('dishes/show', {
      title: `${dish.name} - GourmetHub`,
      dish,
      reviews: dish.reviews || [],
    });
  }
};

// Render new dish form
exports.renderNewForm = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.render('dishes/new', {
        title: 'Add New Dish - GourmetHub',
        dish: {},
        chefs: fallbackStore.getAllChefs(),
        categories: fallbackStore.getAllCategories(),
        errors: [],
      });
    }

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
    res.render('dishes/new', {
      title: 'Add New Dish - GourmetHub',
      dish: {},
      chefs: fallbackStore.getAllChefs(),
      categories: fallbackStore.getAllCategories(),
      errors: [],
    });
  }
};

// Create a new dish
exports.createDish = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const chefs = mongoose.connection.readyState === 1 ? await Chef.find({}, 'name title').sort({ name: 1 }).lean() : fallbackStore.getAllChefs();
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
    if (mongoose.connection.readyState !== 1) {
      const created = fallbackStore.createDish(req.body);
      req.flash('success', `"${created.name}" was successfully added to the menu! (Preview Mode)`);
      return res.redirect(`/dishes/${created._id}`);
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
      const chefs = mongoose.connection.readyState === 1 ? await Chef.find({}, 'name title').sort({ name: 1 }).lean() : fallbackStore.getAllChefs();
      const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
      return res.status(400).render('dishes/new', {
        title: 'Add New Dish - GourmetHub',
        dish: req.body,
        chefs,
        categories,
        errors: Object.values(err.errors).map((e) => ({ msg: e.message })),
      });
    }
    const created = fallbackStore.createDish(req.body);
    req.flash('success', `"${created.name}" was saved in preview mode.`);
    res.redirect(`/dishes/${created._id}`);
  }
};

// Render edit form
exports.renderEditForm = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const dish = fallbackStore.getDishById(req.params.id);
      if (!dish) {
        req.flash('error', 'Dish not found');
        return res.redirect('/dishes');
      }
      return res.render('dishes/edit', {
        title: `Edit ${dish.name} - GourmetHub`,
        dish,
        chefs: fallbackStore.getAllChefs(),
        selectedChefIds: dish.chefIds || [],
        categories: fallbackStore.getAllCategories(),
        errors: [],
      });
    }

    const dish = await Dish.findById(req.params.id).lean();
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }

    const chefs = await Chef.find({}, 'name title').sort({ name: 1 }).lean();
    const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
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
    const dish = fallbackStore.getDishById(req.params.id);
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }
    res.render('dishes/edit', {
      title: `Edit ${dish.name} - GourmetHub`,
      dish,
      chefs: fallbackStore.getAllChefs(),
      selectedChefIds: dish.chefIds || [],
      categories: fallbackStore.getAllCategories(),
      errors: [],
    });
  }
};

// Update existing dish
exports.updateDish = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const chefs = mongoose.connection.readyState === 1 ? await Chef.find({}, 'name title').sort({ name: 1 }).lean() : fallbackStore.getAllChefs();
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
    if (mongoose.connection.readyState !== 1) {
      const updated = fallbackStore.updateDish(req.params.id, req.body);
      req.flash('success', `"${updated ? updated.name : 'Dish'}" was updated successfully! (Preview Mode)`);
      return res.redirect(`/dishes/${req.params.id}`);
    }

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
    const updated = fallbackStore.updateDish(req.params.id, req.body);
    req.flash('success', `"${updated ? updated.name : 'Dish'}" was updated in preview mode.`);
    res.redirect(`/dishes/${req.params.id}`);
  }
};

// Delete dish with cascade cleanup
exports.deleteDish = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      fallbackStore.deleteDish(req.params.id);
      req.flash('success', 'Dish was deleted successfully. (Preview Mode)');
      return res.redirect('/dishes');
    }

    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      req.flash('error', 'Dish not found');
      return res.redirect('/dishes');
    }

    const dishName = dish.name;
    const dishId = dish._id;

    await Dish.findByIdAndDelete(dishId);
    await Chef.updateMany({ dishes: dishId }, { $pull: { dishes: dishId } });
    await Review.deleteMany({ dish: dishId });

    req.flash('success', `"${dishName}" was deleted successfully.`);
    res.redirect('/dishes');
  } catch (err) {
    fallbackStore.deleteDish(req.params.id);
    req.flash('success', 'Dish deleted in preview mode.');
    res.redirect('/dishes');
  }
};

// Post a review for a dish
exports.addReview = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      fallbackStore.createReview(req.params.id, req.body);
      req.flash('success', 'Your review and rating have been posted! (Preview Mode)');
      return res.redirect(`/dishes/${req.params.id}`);
    }

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
    fallbackStore.createReview(req.params.id, req.body);
    req.flash('success', 'Your review was posted in preview mode.');
    res.redirect(`/dishes/${req.params.id}`);
  }
};

// Bonus: Export dishes to CSV
exports.exportCSV = async (req, res, next) => {
  try {
    let dishes = [];
    if (mongoose.connection.readyState === 1) {
      dishes = await Dish.find().populate('chefs', 'name').lean();
    } else {
      dishes = fallbackStore.dishes.map((d) => ({
        ...d,
        chefs: (d.chefIds || []).map((id) => fallbackStore.chefs.find((c) => c._id === id) || { name: 'Chef' }),
      }));
    }

    const headers = ['ID', 'Name', 'Category', 'Cuisine', 'Price', 'PrepTime(min)', 'Calories', 'Rating', 'Vegetarian', 'Chefs'];
    const rows = dishes.map((d) => [
      `"${d._id}"`,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${d.category || ''}"`,
      `"${d.cuisine || ''}"`,
      (d.price || 0).toFixed(2),
      d.prepTime || 0,
      d.calories || 0,
      d.rating || 5,
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
