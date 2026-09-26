const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Chef name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      default: 'Sous Chef',
    },
    bio: {
      type: String,
      trim: true,
      default: 'Passionate culinary professional with expertise in gourmet cuisine.',
    },
    specialty: {
      type: String,
      required: [true, 'Culinary specialty is required'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience are required'],
      min: [1, 'Must have at least 1 year of culinary experience'],
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=60',
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '+1 (555) 019-2834',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.8,
    },
    // Many-to-Many Reference with Dish
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade cleanup when a chef is deleted:
// Remove this chef ID from all dishes that reference it
chefSchema.pre('findOneAndDelete', async function (next) {
  const docToDel = await this.model.findOne(this.getQuery());
  if (docToDel) {
    const Dish = mongoose.model('Dish');
    await Dish.updateMany(
      { chefs: docToDel._id },
      { $pull: { chefs: docToDel._id } }
    );
  }
  next();
});

module.exports = mongoose.model('Chef', chefSchema);
