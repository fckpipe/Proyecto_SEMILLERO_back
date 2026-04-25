const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { 
    type: String, 
    enum: ['admin_sede', 'super_admin'], 
    default: 'admin_sede' 
  },
  sede_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sede',
    required: function() { return this.rol === 'admin_sede'; }
  },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
