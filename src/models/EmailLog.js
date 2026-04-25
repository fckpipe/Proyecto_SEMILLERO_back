const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  remitente: { type: String, required: true },
  asunto: { type: String },
  cuerpo: { type: String },
  tipo_detectado: { 
    type: String, 
    enum: ['nueva_cita', 'consulta', 'cancelacion', 'no_reconocido'], 
    default: 'no_reconocido' 
  },
  cita_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita' },
  procesado: { type: Boolean, default: false },
  respuesta_enviada: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', emailLogSchema);
