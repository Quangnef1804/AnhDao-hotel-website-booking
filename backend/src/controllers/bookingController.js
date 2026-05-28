import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Room from '../models/Room.js';

const daysBetween = (start, end) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
};

const roomStatusForBookingStatus = {
  pending: 'booked',
  'checked-in': 'occupied',
  completed: 'available',
  cancelled: 'available'
};

const updateRoomForBookingStatus = async (booking) => {
  const roomStatus = roomStatusForBookingStatus[booking.status];
  if (roomStatus) {
    await Room.findByIdAndUpdate(booking.roomId, { status: roomStatus });
  }
};

const createReviewNotification = async (booking) => {
  const populatedBooking = await Booking.findById(booking._id).populate('roomId');
  if (!populatedBooking) return;

  const roomLabel = populatedBooking.roomId?.roomNumber || populatedBooking.roomId?.name || 'your room';

  await Notification.findOneAndUpdate(
    {
      bookingId: populatedBooking._id,
      type: 'review_request'
    },
    {
      userId: populatedBooking.userId,
      bookingId: populatedBooking._id,
      type: 'review_request',
      isRead: false,
      message: `Cảm ơn bạn đã ở tại Anh Đào, hãy để lại đánh giá cho phòng ${roomLabel}.`
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
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

    await Room.findByIdAndUpdate(roomId, { status: 'booked' });

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

    const currentBooking = await Booking.findById(req.params.id);
    if (!currentBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const wasCompleted = currentBooking.status === 'completed';
    currentBooking.status = status;
    await currentBooking.save();
    await updateRoomForBookingStatus(currentBooking);

    if (status === 'completed' && !wasCompleted) {
      await createReviewNotification(currentBooking);
    }

    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'nickname email phone')
      .populate('roomId');


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
