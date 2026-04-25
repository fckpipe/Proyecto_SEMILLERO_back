const pqrService = require('../services/pqr.service');
const ActivityLog = require('../models/ActivityLog');

exports.manejarMensajeStr = async (req, res) => {
  try {
    const { history, message } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback simple si no configuró API
      return res.status(200).json({ 
        status: 'error', 
        message: 'El módulo inteligente PQR no está configurado (Falta ANTHROPIC_API_KEY).' 
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await pqrService.getAnthropicStream(history, message);

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.text) {
        // Enviar delta de texto
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error en PQR AI:', error);
    res.write(`data: ${JSON.stringify({ error: 'Hubo un problema de conexión con el agente PQR. Intente nuevamente.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
};

exports.escalarHumano = async (req, res) => {
  try {
    const { history, motivo } = req.body;
    
    // Registrar escala en BD
    await ActivityLog.create({
      tipo_evento: 'pqr_escalado',
      canal: 'chatbot_ia',
      descripcion: `Una solicitud PQR fue escalada a agente humano. Motivo: ${motivo || 'No resuelto por IA'}.`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Tu solicitud ha sido radicada. Te contactaremos pronto o puedes llamar directamente al 602 445 9000 ext 1.'
    });
  } catch (error) {
    console.error('Error al escalar a humano:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
  }
};
