const mongoose = require('mongoose');

const comparendoSchema = new mongoose.Schema({
  numero_comparendo: { type: String, required: true, unique: true },
  ciudadano_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciudadano', required: true },
  fecha_imposicion: { type: Date, required: true },
  tipo_infraccion: { type: String, required: true },
  requiere_curso: { type: Boolean, default: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'curso_agendado', 'curso_completado'], 
    default: 'pendiente' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Comparendo', comparendoSchema);
