const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Technical', 'Cultural', 'Sports'],
    },
    venue: {
      type: String,
      required: [true, 'Please add an event venue'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add event date and time'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please add a registration deadline'],
      validate: {
        validator: function (value) {
          // Deadline should be before the event date
          return this.date ? value <= this.date : true;
        },
        message: 'Registration deadline must be before or equal to the event date',
      },
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Please specify the maximum capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    registeredParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    bannerImageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function () {
  return this.registeredParticipants.length >= this.maxCapacity;
});

// Ensure virtuals are included in JSON/Object conversions
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
