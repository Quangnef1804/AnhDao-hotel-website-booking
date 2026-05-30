import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['single', 'double', 'family', 'vip'],
      default: 'single'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'booked', 'maintenance'],
      default: 'available'
    },
    images: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
