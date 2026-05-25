import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

const daysBetween = (start, end) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
};

export const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Room, check-in and check-out dates are required' });
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const room = await Room.findById(roomId);
    if (!room || room.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    const totalPrice = daysBetween(checkInDate, checkOutDate) * room.price;
    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'pending'
    });

    const populated = await booking.populate('roomId');
    res.status(201).json({ booking: populated });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (_req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'nickname email phone')
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'checked-in', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('userId', 'nickname email phone')
      .populate('roomId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteBookings = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) {
      return res.status(400).json({ message: 'Booking ids are required' });
    }

    const result = await Booking.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Bookings deleted', deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};
