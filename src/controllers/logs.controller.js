const { ActivityLog, EmailLog } = require('../models');

exports.getActivityLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tipo_evento) filter.tipo_evento = req.query.tipo_evento;
    if (req.query.canal) filter.canal = req.query.canal;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .populate('cita_id')
      .populate('email_log_id');

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

exports.getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find()
      .sort({ createdAt: -1 })
      .populate('cita_id');
      
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};
