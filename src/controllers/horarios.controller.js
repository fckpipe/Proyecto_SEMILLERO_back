const { Horario, ActivityLog } = require('../models');

exports.getAvailable = async (req, res) => {
  try {
    const filter = {
      cupos_disponibles: { $gt: 0 },
      fecha: { $gte: new Date() },
      activo: true
    };

    // Si es un admin pidiendo la lista desde la gestión de horarios, aplicamos su filtro de sede
    if (req.sedeFilter && Object.keys(req.sedeFilter).length > 0) {
      filter.sede_id = req.sedeFilter.sede_id;
    }

    const horarios = await Horario.find(filter).populate('sede_id', 'nombre direccion');

    res.json({ success: true, data: horarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener horarios disponibles.' });
  }
};

exports.create = async (req, res) => {
  try {
    let { sede_id, fecha, hora_inicio, hora_fin, capacidad_maxima } = req.body;
    
    // Si el usuario es admin_sede, forzamos que use SU sede_id
    if (req.user.rol === 'admin_sede') {
      sede_id = req.user.sede_id;
    }

    const horario = await Horario.create({
      sede_id, 
      fecha, 
      hora_inicio, 
      hora_fin, 
      capacidad_maxima, 
      cupos_disponibles: capacidad_maxima
    });

    await ActivityLog.create({
      tipo_evento: 'creacion_horario',
      canal: 'admin',
      descripcion: `Nuevo horario creado para sede ${sede_id} el ${fecha}.`,
      metadata: { admin_id: req.user.id, horario_id: horario._id }
    });

    res.status(201).json({ success: true, data: horario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear el horario.' });
  }
};

exports.update = async (req, res) => {
  try {
    // Verificar si el admin tiene permiso para esta sede
    const existing = await Horario.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Horario no encontrado.' });
    }

    if (req.user.rol === 'admin_sede' && existing.sede_id.toString() !== req.user.sede_id.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para modificar horarios de esta sede.' });
    }

    const horario = await Horario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    await ActivityLog.create({
      tipo_evento: 'edicion_horario',
      canal: 'admin',
      descripcion: `Horario ${horario._id} editado.`,
      metadata: { admin_id: req.user.id }
    });

    res.json({ success: true, data: horario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al actualizar el horario.' });
  }
};

exports.deactivate = async (req, res) => {
  try {
    const existing = await Horario.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Horario no encontrado.' });
    }

    if (req.user.rol === 'admin_sede' && existing.sede_id.toString() !== req.user.sede_id.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para desactivar horarios de esta sede.' });
    }

    const horario = await Horario.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    
    await ActivityLog.create({
      tipo_evento: 'desactivacion_horario',
      canal: 'admin',
      descripcion: `Horario ${horario._id} desactivado.`,
      metadata: { admin_id: req.user.id }
    });

    res.json({ success: true, data: { message: 'Horario desactivado exitosamente.' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al desactivar el horario.' });
  }
};
