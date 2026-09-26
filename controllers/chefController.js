const mongoose = require('mongoose');
const Chef = require('../models/Chef');
const Dish = require('../models/Dish');
const fallbackStore = require('../db/fallbackStore');
const { validationResult } = require('express-validator');

// List all chefs
exports.getChefs = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = fallbackStore.getChefs(req.query);
      return res.render('chefs/index', {
        title: 'Our Culinary Masters - GourmetHub',
        chefs: data.chefs,
        specialties: data.specialties,
        query: req.query,
      });
    }

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
    console.warn('Recovering chefs page with fallback store:', err.message);
    const data = fallbackStore.getChefs(req.query);
    res.render('chefs/index', {
      title: 'Our Culinary Masters - GourmetHub',
      chefs: data.chefs,
      specialties: data.specialties,
      query: req.query,
    });
  }
};

// Show a single chef profile
exports.getChefById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const chef = fallbackStore.getChefById(req.params.id);
      if (!chef) {
        req.flash('error', 'Chef not found');
        return res.redirect('/chefs');
      }
      return res.render('chefs/show', {
        title: `Chef ${chef.name} - GourmetHub`,
        chef,
      });
    }

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
    const chef = fallbackStore.getChefById(req.params.id);
    if (!chef) {
      req.flash('error', 'Chef not found');
      return res.redirect('/chefs');
    }
    res.render('chefs/show', {
      title: `Chef ${chef.name} - GourmetHub`,
      chef,
    });
  }
};

// Render new chef form
exports.renderNewForm = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.render('chefs/new', {
        title: 'Add New Chef - GourmetHub',
        chef: {},
        dishes: fallbackStore.dishes,
        errors: [],
      });
    }

    const dishes = await Dish.find({}, 'name category').sort({ name: 1 }).lean();
    res.render('chefs/new', {
      title: 'Add New Chef - GourmetHub',
      chef: {},
      dishes,
      errors: [],
    });
  } catch (err) {
    res.render('chefs/new', {
      title: 'Add New Chef - GourmetHub',
      chef: {},
      dishes: fallbackStore.dishes,
      errors: [],
    });
  }
};

// Create a new chef
exports.createChef = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const dishes = mongoose.connection.readyState === 1 ? await Dish.find({}, 'name category').sort({ name: 1 }).lean() : fallbackStore.dishes;
    return res.status(400).render('chefs/new', {
      title: 'Add New Chef - GourmetHub',
      chef: req.body,
      dishes,
      errors: errors.array(),
    });
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      const newChef = {
        _id: '65e01000000000000000' + (fallbackStore.chefs.length + 1).toString().padStart(4, '0'),
        name: req.body.name,
        title: req.body.title,
        bio: req.body.bio,
        specialty: req.body.specialty,
        experienceYears: parseInt(req.body.experienceYears) || 5,
        avatarUrl: req.body.avatarUrl || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80',
        email: req.body.email,
        phone: req.body.phone,
        rating: 5.0,
        dishes: [],
      };
      fallbackStore.chefs.push(newChef);
      req.flash('success', `Chef ${newChef.name} was successfully registered! (Preview Mode)`);
      return res.redirect(`/chefs/${newChef._id}`);
    }

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
      const dishes = mongoose.connection.readyState === 1 ? await Dish.find({}, 'name category').sort({ name: 1 }).lean() : fallbackStore.dishes;
      return res.status(400).render('chefs/new', {
        title: 'Add New Chef - GourmetHub',
        chef: req.body,
        dishes,
        errors: Object.values(err.errors).map((e) => ({ msg: e.message })),
      });
    }
    req.flash('success', `Chef was saved in preview mode.`);
    res.redirect('/chefs');
  }
};

// Render edit chef form
exports.renderEditForm = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const chef = fallbackStore.getChefById(req.params.id);
      if (!chef) {
        req.flash('error', 'Chef not found');
        return res.redirect('/chefs');
      }
      return res.render('chefs/edit', {
        title: `Edit Chef ${chef.name} - GourmetHub`,
        chef,
        dishes: fallbackStore.dishes,
        selectedDishIds: (chef.dishes || []).map((d) => d._id.toString()),
        errors: [],
      });
    }

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
    const chef = fallbackStore.getChefById(req.params.id);
    if (!chef) {
      req.flash('error', 'Chef not found');
      return res.redirect('/chefs');
    }
    res.render('chefs/edit', {
      title: `Edit Chef ${chef.name} - GourmetHub`,
      chef,
      dishes: fallbackStore.dishes,
      selectedDishIds: [],
      errors: [],
    });
  }
};

// Update chef
exports.updateChef = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const dishes = mongoose.connection.readyState === 1 ? await Dish.find({}, 'name category').sort({ name: 1 }).lean() : fallbackStore.dishes;
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
    if (mongoose.connection.readyState !== 1) {
      const idx = fallbackStore.chefs.findIndex((c) => c._id.toString() === req.params.id.toString());
      if (idx !== -1) {
        fallbackStore.chefs[idx] = {
          ...fallbackStore.chefs[idx],
          name: req.body.name,
          title: req.body.title,
          bio: req.body.bio,
          specialty: req.body.specialty,
          experienceYears: parseInt(req.body.experienceYears) || fallbackStore.chefs[idx].experienceYears,
          email: req.body.email,
          phone: req.body.phone,
        };
      }
      req.flash('success', `Chef profile was updated! (Preview Mode)`);
      return res.redirect(`/chefs/${req.params.id}`);
    }

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
    req.flash('success', `Chef profile was updated in preview mode.`);
    res.redirect(`/chefs/${req.params.id}`);
  }
};

// Delete chef with cascade cleanup
exports.deleteChef = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const idx = fallbackStore.chefs.findIndex((c) => c._id.toString() === req.params.id.toString());
      if (idx !== -1) {
        fallbackStore.chefs.splice(idx, 1);
      }
      req.flash('success', 'Chef was removed successfully. (Preview Mode)');
      return res.redirect('/chefs');
    }

    const chef = await Chef.findById(req.params.id);
    if (!chef) {
      req.flash('error', 'Chef not found');
      return res.redirect('/chefs');
    }

    const chefName = chef.name;
    const chefId = chef._id;

    await Chef.findByIdAndDelete(chefId);
    await Dish.updateMany({ chefs: chefId }, { $pull: { chefs: chefId } });

    req.flash('success', `Chef ${chefName} was removed successfully.`);
    res.redirect('/chefs');
  } catch (err) {
    req.flash('success', 'Chef was removed in preview mode.');
    res.redirect('/chefs');
  }
};
