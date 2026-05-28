import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';

export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!bookingId || !numericRating) {
      return res.status(400).json({ message: 'Booking and rating are required' });
    }

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
      status: 'completed'
    });

    if (!booking) {
      return res.status(403).json({ message: 'Review is only available after checkout' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(409).json({ message: 'This booking has already been reviewed' });
    }

    const review = await Review.create({
      userId: req.user._id,
      roomId: booking.roomId,
      bookingId,
      rating: numericRating,
      comment
    });

    await Notification.updateMany(
      { bookingId, userId: req.user._id, type: 'review_request' },
      { isRead: true }
    );

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
};

export const getRoomReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ roomId: req.params.roomId })
      .populate('userId', 'nickname')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};

