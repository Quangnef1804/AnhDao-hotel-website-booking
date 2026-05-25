import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/anhdao_hotel';
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);

    if (error.message.includes('mongo')) {
      console.error(
        'Hint: hostname "mongo" only works inside Docker Compose. Use MONGO_URI=mongodb://localhost:27017/anhdao_hotel when running backend with nodemon.'
      );
    }

    process.exit(1);
  }
};

export default connectDB;
