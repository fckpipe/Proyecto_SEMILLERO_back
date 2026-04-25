const mongoose = require('mongoose');

const cursoProgresoSchema = new mongoose.Schema({
  ciudadano_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciudadano', required: true },
  comparendo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comparendo' },
  modulo_actual: { type: String },
  modulos_completados: [{ type: Number }], // Number type as requested by frontend logic
  trampas_detectadas: { type: Number, default: 0 },
  estado: { type: String, enum: ['no_iniciado', 'en_progreso', 'completado'], default: 'no_iniciado' },
  bloqueado: { type: Boolean, default: false },
  ultimo_acceso: { type: Date },
  fecha_inicio: { type: Date },
  fecha_completado: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('CursoProgreso', cursoProgresoSchema);
