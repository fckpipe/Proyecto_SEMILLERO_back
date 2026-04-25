const { Cita, Horario, Comparendo, ActivityLog } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const filter = req.sedeFilter || {}; // Injected by filtrarPorSede middleware
    
    const citas = await Cita.find(filter)
      .populate('ciudadano_id', 'nombre apellido cedula')
      .populate('comparendo_id', 'numero_comparendo tipo_infraccion')
      .populate('horario_id')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: citas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener las citas.' });
  }
};

exports.getMyCitas = async (req, res) => {
  try {
    const citas = await Cita.find({ ciudadano_id: req.user.id })
      .populate('comparendo_id', 'numero_comparendo tipo_infraccion')
      .populate({
        path: 'horario_id',
        populate: { path: 'sede_id', select: 'nombre direccion' }
      });

    res.json({ success: true, data: citas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener tus citas.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id)
      .populate('ciudadano_id', 'nombre apellido cedula email')
      .populate('comparendo_id', 'numero_comparendo tipo_infraccion')
      .populate({
        path: 'horario_id',
        populate: { path: 'sede_id', select: 'nombre direccion' }
      });

    if (!cita) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada.' });
    }

    // Si es admin_sede, verificar que la cita pertenezca a su sede
    if (req.user.rol === 'admin_sede' && cita.sede_id.toString() !== req.user.sede_id.toString()) {
      return res.status(403).json({ success: false, message: 'Acceso denegado a esta cita.' });
    }

    res.json({ success: true, data: cita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener la cita.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { comparendo_id, horario_id, canal = 'sistema' } = req.body;
    const ciudadano_id = req.user.id;

    const comparendo = await Comparendo.findOne({ _id: comparendo_id, ciudadano_id });
    if (!comparendo) {
      return res.status(404).json({ success: false, message: 'Comparendo no válido para este ciudadano.' });
    }

    const horario = await Horario.findOne({ _id: horario_id, activo: true });
    if (!horario || horario.cupos_disponibles <= 0) {
      return res.status(400).json({ success: false, message: 'Horario no disponible o sin cupos.' });
    }

    const sede_id = horario.sede_id; // Obtenemos la sede del horario seleccionado

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Descontar cupo atómicamente
      const updatedHorario = await Horario.findOneAndUpdate(
        { _id: horario_id, cupos_disponibles: { $gt: 0 } },
        { $inc: { cupos_disponibles: -1 } },
        { new: true, session }
      );

      if (!updatedHorario) {
        throw new Error('No hay cupos disponibles. Intente nuevamente.');
      }

      // 2. Crear cita incluyendo sede_id
      const codigo_cita = `CITA-${uuidv4().split('-')[0].toUpperCase()}`;
      const cita = await Cita.create([{
        codigo_cita,
        ciudadano_id,
        comparendo_id,
        horario_id,
        sede_id,
        canal,
        estado: 'confirmada'
      }], { session });

      // 3. Actualizar estado del comparendo
      comparendo.estado = 'curso_agendado';
      await comparendo.save({ session });

      // 4. Registrar actividad
      await ActivityLog.create([{
        tipo_evento: 'creacion_cita',
        canal,
        descripcion: `Cita ${codigo_cita} agendada para el comparendo ${comparendo.numero_comparendo}.`,
        cita_id: cita[0]._id,
        metadata: { ciudadano_id, horario_id, sede_id }
      }], { session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ success: true, data: cita[0] });
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Error al agendar la cita.' });
  }
};

exports.updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const cita = await Cita.findById(req.params.id);

    if (!cita) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada.' });
    }

    // Verificar permisos de sede si es admin_sede
    if (req.user.rol === 'admin_sede' && cita.sede_id.toString() !== req.user.sede_id.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta cita.' });
    }

    cita.estado = estado;
    await cita.save();

    await ActivityLog.create({
      tipo_evento: 'cambio_estado_cita',
      canal: (req.user.rol === 'admin_sede' || req.user.rol === 'super_admin') ? 'admin' : 'sistema',
      descripcion: `Estado de la cita ${cita.codigo_cita} cambiado a ${estado}.`,
      cita_id: cita._id,
      metadata: { admin_id: req.user.id }
    });

    res.json({ success: true, data: cita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al actualizar el estado de la cita.' });
  }
};
