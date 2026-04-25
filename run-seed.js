// Wrapper standalone para ejecutar el seed directamente
require('dotenv').config();
const mongoose = require('mongoose');
const autoSeedDB = require('./src/config/seed');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movilidad_cali';
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB conectado: ${conn.connection.name}`);
    await autoSeedDB(true); // force=true para forzar aunque existan datos
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
