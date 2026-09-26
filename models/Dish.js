const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'],
        message: '{VALUE} is not a valid category',
      },
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true,
      default: 'International',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
    },
    prepTime: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: [1, 'Preparation time must be at least 1 minute'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: 350,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isChefSpecial: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    // Many-to-Many Reference with Chef
    chefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chef',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews on this dish
dishSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'dish',
});

// Middleware for cascade cleanup when a dish is removed:
// Remove this dish ID from all chefs that reference it
dishSchema.pre('findOneAndDelete', async function (next) {
  const docToDel = await this.model.findOne(this.getQuery());
  if (docToDel) {
    const Chef = mongoose.model('Chef');
    const Review = mongoose.model('Review');
    await Chef.updateMany(
      { dishes: docToDel._id },
      { $pull: { dishes: docToDel._id } }
    );
    await Review.deleteMany({ dish: docToDel._id });
  }
  next();
});

module.exports = mongoose.model('Dish', dishSchema);
