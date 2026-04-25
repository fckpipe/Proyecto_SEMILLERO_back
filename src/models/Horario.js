const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  sede_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
  fecha: { type: Date, required: true },
  hora_inicio: { type: String, required: true },
  hora_fin: { type: String, required: true },
  capacidad_maxima: { type: Number, required: true },
  cupos_disponibles: { type: Number, required: true },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Horario', horarioSchema);
