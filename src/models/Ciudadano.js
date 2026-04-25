const mongoose = require('mongoose');

const ciudadanoSchema = new mongoose.Schema({
  cedula: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  telefono: { type: String },
  email: { type: String },
  placa_vehiculo: { type: String }, // Nueva: Vincular vehículo al ciudadano
  password_hash: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Ciudadano', ciudadanoSchema);
