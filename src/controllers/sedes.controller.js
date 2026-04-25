const { Sede, ActivityLog } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const filter = { activa: true };
    
    // Si el usuario es admin_sede, le restringimos la vista a solo SU sede
    if (req.user && req.user.rol === 'admin_sede') {
      filter._id = req.user.sede_id;
    }

    const sedes = await Sede.find(filter);
    res.json({ success: true, data: sedes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener las sedes.' });
  }
};

exports.create = async (req, res) => {
  try {
    // Solo super_admin debería poder crear sedes según el flujo propuesto
    if (req.user.rol !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'No tienes permiso para crear sedes.' });
    }

    const { nombre, direccion } = req.body;
    const sede = await Sede.create({ nombre, direccion, activa: true });

    await ActivityLog.create({
      tipo_evento: 'creacion_sede',
      canal: 'admin',
      descripcion: `Sede ${nombre} creada por Super Admin.`,
      metadata: { admin_id: req.user.id, sede_id: sede._id }
    });

    res.status(201).json({ success: true, data: sede });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear la sede.' });
  }
};

exports.update = async (req, res) => {
  try {
    // Solo super_admin (o el admin_sede de esta sede en particular si se permite)
    if (req.user.rol !== 'super_admin' && (req.user.rol === 'admin_sede' && req.params.id !== req.user.sede_id.toString())) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta sede.' });
    }

    const sede = await Sede.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!sede) {
      return res.status(404).json({ success: false, message: 'Sede no encontrada.' });
    }

    await ActivityLog.create({
      tipo_evento: 'edicion_sede',
      canal: 'admin',
      descripcion: `Sede ${sede.nombre} editada.`,
      metadata: { admin_id: req.user.id, sede_id: sede._id }
    });

    res.json({ success: true, data: sede });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al actualizar la sede.' });
  }
};
