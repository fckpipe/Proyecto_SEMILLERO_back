const mongoose = require('mongoose');

const sedeSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  activa: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Sede', sedeSchema);
