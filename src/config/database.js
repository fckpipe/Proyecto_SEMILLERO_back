const mongoose = require('mongoose');
require('dotenv').config();
const autoSeedDB = require('./seed');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movilidad_cali';
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB conectado: ${conn.connection.name}`);
    await autoSeedDB();
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
