const { Comparendo, Ciudadano, ActivityLog } = require('../models');

exports.getByCedula = async (req, res) => {
  try {
    const ciudadano = await Ciudadano.findOne({ cedula: req.params.cedula });
    if (!ciudadano) {
      return res.status(404).json({ success: false, message: 'Ciudadano no encontrado.' });
    }

    const comparendos = await Comparendo.find({ ciudadano_id: ciudadano._id });

    // Registrar actividad si es el propio ciudadano consultando
    if (req.user && req.user.role === 'ciudadano') {
      await ActivityLog.create({
        tipo_evento: 'consulta_comparendos',
        canal: 'sistema',
        descripcion: `El ciudadano consultó los comparendos de la cédula ${req.params.cedula}.`,
        metadata: { ciudadano_id: req.user.id }
      });
    }

    res.json({ success: true, data: comparendos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const comparendo = await Comparendo.findById(req.params.id)
      .populate('ciudadano_id', 'nombre apellido cedula');
      
    if (!comparendo) {
      return res.status(404).json({ success: false, message: 'Comparendo no encontrado.' });
    }
    res.json({ success: true, data: comparendo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};
