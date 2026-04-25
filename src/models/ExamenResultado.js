const mongoose = require('mongoose');

const examenResultadoSchema = new mongoose.Schema({
  ciudadano_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciudadano', required: true },
  comparendo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comparendo', required: false },
  puntaje: { type: Number, required: true },
  aprobado: { type: Boolean, required: true },
  respuestas: [{ type: Object }],
  fecha_examen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ExamenResultado', examenResultadoSchema);
