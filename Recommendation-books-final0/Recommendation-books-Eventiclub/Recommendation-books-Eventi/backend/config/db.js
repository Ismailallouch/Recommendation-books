const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://allouchsmail92:42XUkKFVhEpcJCXJ@cluster0.rrsrp8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB; 