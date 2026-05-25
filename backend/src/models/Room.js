import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['single', 'double', 'vip'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'maintenance'],
      default: 'available'
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true
          },
          filename: {
            type: String,
            required: true
          },
          originalName: {
            type: String,
            default: ''
          }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
