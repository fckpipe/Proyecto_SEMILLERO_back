const { Admin, ActivityLog, Sede } = require('../models');
const bcrypt = require('bcryptjs');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('sede_id', 'nombre')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener la lista de administradores.' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password, nombre, email, rol, sede_id } = req.body;
    
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ 
      username, password_hash, nombre, email, rol, sede_id, activo: true 
    });

    await ActivityLog.create({
      tipo_evento: 'creacion_admin',
      canal: 'admin',
      descripcion: `Super Admin creó nuevo administrador: ${username} (${rol}).`,
      metadata: { admin_id: req.user.id, target_admin_id: admin._id }
    });

    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear el administrador.' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Administrador no encontrado.' });
    }

    await ActivityLog.create({
      tipo_evento: 'edicion_admin',
      canal: 'admin',
      descripcion: `Super Admin editó el administrador: ${admin.username}.`,
      metadata: { admin_id: req.user.id, target_admin_id: admin._id }
    });

    res.json({ success: true, data: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al actualizar el administrador.' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Administrador no encontrado.' });
    }

    admin.activo = !admin.activo;
    await admin.save();

    await ActivityLog.create({
      tipo_evento: 'cambio_estado_admin',
      canal: 'admin',
      descripcion: `Administrador ${admin.username} ${admin.activo ? 'activado' : 'desactivado'}.`,
      metadata: { admin_id: req.user.id, target_admin_id: admin._id }
    });

    res.json({ success: true, data: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al cambiar el estado del administrador.' });
  }
};
