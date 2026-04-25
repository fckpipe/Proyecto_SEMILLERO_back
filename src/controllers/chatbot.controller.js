const chatEngineService = require('../services/chatEngine.service');

exports.manejarMensaje = async (req, res) => {
  try {
    const { sessionId, message, user } = req.body;
    
    if (!message && !sessionId) {
      return res.status(400).json({ status: 'error', message: 'Se requiere mensaje' });
    }

    const result = await chatEngineService.processMessage(sessionId, message || '', user);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error en Chatbot Controller:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del motor de chat.' });
  }
};
