const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  tipo_evento: { type: String, required: true },
  canal: { type: String, enum: ['chatbot', 'chatbot_ia', 'email', 'sistema', 'admin', 'pqr'], required: true },
  descripcion: { type: String, required: true },
  cita_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita' },
  email_log_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailLog' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
