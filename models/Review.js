const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: [true, 'Review must be associated with a dish'],
    },
    authorName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [5, 'Comment must be at least 5 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// After saving a review, recalculate the average rating and review count of the dish
reviewSchema.post('save', async function () {
  const Dish = mongoose.model('Dish');
  const reviews = await this.constructor.find({ dish: this.dish });
  if (reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Dish.findByIdAndUpdate(this.dish, {
      rating: parseFloat(avg.toFixed(1)),
      reviewsCount: reviews.length,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
