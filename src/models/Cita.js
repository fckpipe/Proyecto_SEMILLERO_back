const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  codigo_cita: { type: String, required: true, unique: true },
  ciudadano_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciudadano', required: true },
  comparendo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comparendo', required: true },
  horario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Horario', required: true },
  sede_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
  canal: { type: String, enum: ['chatbot', 'email'], required: true },
  estado: { 
    type: String, 
    enum: ['confirmada', 'cancelada', 'completada', 'no_asistio'], 
    default: 'confirmada' 
  },
  recordatorio_enviado: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Cita', citaSchema);
