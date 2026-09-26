const Chef = require('../models/Chef');
const Dish = require('../models/Dish');
const { validationResult } = require('express-validator');

// List all chefs
exports.getChefs = async (req, res, next) => {
  try {
    const { search, specialty } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { title: searchRegex },
        { specialty: searchRegex },
        { bio: searchRegex },
      ];
    }

    if (specialty && specialty !== 'all') {
      query.specialty = specialty;
    }

    const chefs = await Chef.find(query)
      .populate('dishes', 'name category price imageUrl')
      .sort({ experienceYears: -1 })
      .lean();

    // Fetch distinct specialties for filter dropdown
    const allSpecialties = await Chef.distinct('specialty');

    res.render('chefs/index', {
      title: 'Our Culinary Masters - GourmetHub',
      chefs,
      specialties: allSpecialties,
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
};

// Show a single chef profile
exports.getChefById = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.params.id)
      .populate('dishes')
      .lean();

    if (!chef) {
      req.flash('error', 'Chef not found');
      return res.redirect('/chefs');
    }

    res.render('chefs/show', {
      title: `Chef ${chef.name} - GourmetHub`,
      chef,
    });
  } catch (err) {
    next(err);
  }
};

// Render new chef form
exports.renderNewForm = async (req, res, next) => {
  try {
    const dishes = await Dish.find({}, 'name category').sort({ name: 1 }).lean();
    res.render('chefs/new', {
      title: 'Add New Chef - GourmetHub',
      chef: {},
      dishes,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
};

// Create a new chef
exports.createChef = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const dishes = await Dish.find({}, 'name category').sort({ name: 1 }).lean();
    return res.status(400).render('chefs/new', {
      title: 'Add New Chef - GourmetHub',
      chef: req.body,
      dishes,
      errors: errors.array(),
    });
  }

  try {
    const { name, title, bio, specialty, experienceYears, avatarUrl, email, phone, dishes } = req.body;

    let dishIds = [];
    if (dishes) {
      dishIds = Array.isArray(dishes) ? dishes : [dishes];
    }

    const chef = new Chef({
      name,
      title,
      bio,
      specialty,
      experienceYears: parseInt(experienceYears),
      avatarUrl: avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : undefined,
      email,
      phone,
      dishes: dishIds,
    });

    await chef.save();

    // Many-to-Many Sync: update dishes to include this new chef
    if (dishIds.length > 0) {
      await Dish.updateMany(
        { _id: { $in: dishIds } },
        { $addToSet: { chefs: chef._id } }
      );
    }

    req.flash('success', `Chef ${chef.name} was successfully registered!`);
    res.redirect(`/chefs/${chef._id}`);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const dishes = await Dish.find({}, 'name category').sort({ name: 1 }).lean();
      return res.status(400).render('chefs/new', {
        title: 'Add New Chef - GourmetHub',
        chef: req.body,
        dishes,
        errors: Object.values(err.errors).map((e) => ({ msg: e.message })),
      });
    }
    next(err);
  }
};

// Render edit chef form
exports.renderEditForm = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.params.id).lean();
    if (!chef) {
      req.flash('error', 'Chef not found');
      return res.redirect('/chefs');
    }

    const dishes = await Dish.find({}, 'name category').sort({ name: 1 }).lean();
    const selectedDishIds = (chef.dishes || []).map((id) => id.toString());

    res.render('chefs/edit', {
      title: `Edit Chef ${chef.name} - GourmetHub`,
      chef,
      dishes,
      selectedDishIds,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
};

// Update chef
exports.updateChef = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const dishes = await Dish.find({}, 'name category').sort({ name: 1 }).lean();
    const selectedDishIds = Array.isArray(req.body.dishes)
      ? req.body.dishes
      : req.body.dishes ? [req.body.dishes] : [];

    return res.status(400).render('chefs/edit', {
      title: `Edit Chef - GourmetHub`,
      chef: { ...req.body, _id: req.params.id },
      dishes,
      selectedDishIds,
      errors: errors.array(),
    });
  }

  try {
    const chef = await Chef.findById(req.params.id);
    if (!chef) {
      req.flash('error', 'Chef not found');
      return res.redirect('/chefs');
    }

    const { name, title, bio, specialty, experienceYears, avatarUrl, email, phone, dishes } = req.body;

    let newDishIds = [];
    if (dishes) {
      newDishIds = Array.isArray(dishes) ? dishes : [dishes];
    }

    const oldDishIds = (chef.dishes || []).map((id) => id.toString());

    chef.name = name;
    chef.title = title;
    chef.bio = bio;
    chef.specialty = specialty;
    chef.experienceYears = parseInt(experienceYears);
    if (avatarUrl && avatarUrl.trim() !== '') {
      chef.avatarUrl = avatarUrl.trim();
    }
    chef.email = email;
    chef.phone = phone;
    chef.dishes = newDishIds;

    await chef.save();

    // Sync removed dishes
    const removedDishes = oldDishIds.filter((id) => !newDishIds.includes(id));
    if (removedDishes.length > 0) {
      await Dish.updateMany(
        { _id: { $in: removedDishes } },
        { $pull: { chefs: chef._id } }
      );
    }

    // Sync added dishes
    const addedDishes = newDishIds.filter((id) => !oldDishIds.includes(id));
    if (addedDishes.length > 0) {
      await Dish.updateMany(
        { _id: { $in: addedDishes } },
        { $addToSet: { chefs: chef._id } }
      );
    }

    req.flash('success', `Chef ${chef.name}'s profile was updated successfully!`);
    res.redirect(`/chefs/${chef._id}`);
  } catch (err) {
    next(err);
  }
};

// Delete chef with cascade cleanup
exports.deleteChef = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.params.id);
    if (!chef) {
      req.flash('error', 'Chef not found');
      return res.redirect('/chefs');
    }

    const chefName = chef.name;
    const chefId = chef._id;

    // Delete chef document
    await Chef.findByIdAndDelete(chefId);

    // Cascade: remove chef ID from all dishes
    await Dish.updateMany(
      { chefs: chefId },
      { $pull: { chefs: chefId } }
    );

    req.flash('success', `Chef ${chefName} was removed successfully.`);
    res.redirect('/chefs');
  } catch (err) {
    next(err);
  }
};
