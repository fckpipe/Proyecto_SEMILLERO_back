const { Comparendo, ExamenResultado, ActivityLog, Ciudadano } = require('../models');

async function aplicarDescuento(ciudadanoId, comparendoId) {
  try {
    // 1. Verificar aprobación del curso (min 70%)
    const ultimoExamen = await ExamenResultado.findOne({ 
      ciudadano_id: ciudadanoId, 
      aprobado: true,
      puntaje: { $gte: 70 }
    }).sort({ createdAt: -1 });

    if (!ultimoExamen) {
      return { 
        success: false, 
        message: 'No se encontró un examen aprobado con el puntaje mínimo requerido (70%).' 
      };
    }

    // 2. Verificar comparendo
    const comparendo = await Comparendo.findById(comparendoId);
    if (!comparendo) {
      return { success: false, message: 'Comparendo no encontrado.' };
    }

    if (comparendo.estado !== 'pendiente') {
      return { success: false, message: `El comparendo ya se encuentra en estado: ${comparendo.estado}.` };
    }

    if (comparendo.descuentoAplicado) {
      return { success: false, message: 'Este comparendo ya tiene un descuento aplicado.' };
    }

    // 3. Calcular descuento (50%)
    // Nota: El valor original debería estar en el modelo Comparendo. 
    // Si no está, lo estimamos o lo traemos de la tabla de multas.
    const valorOriginal = comparendo.valor || 520000; 
    const valorConDescuento = valorOriginal * 0.5;
    const ahorro = valorOriginal - valorConDescuento;

    const fechaHoy = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaHoy.getDate() + 30); // 30 días de vigencia

    // 4. Actualizar comparendo
    comparendo.descuentoAplicado = true;
    comparendo.valorConDescuento = valorConDescuento;
    comparendo.fechaDescuento = fechaHoy;
    comparendo.fechaVencimientoDescuento = fechaVencimiento;
    comparendo.estado = 'descuento_aplicado';
    await comparendo.save();

    // 5. Registrar en ActivityLog
    const ciudadano = await Ciudadano.findById(ciudadanoId);
    await ActivityLog.create({
      tipo_evento: 'descuento_aplicado',
      canal: 'sistema',
      descripcion: `Se aplicó un descuento del 50% al comparendo ${comparendo.numero_comparendo} para el ciudadano ${ciudadano?.nombre}. Ahorro: $${ahorro.toLocaleString()}.`,
      metadata: { ciudadanoId, comparendoId, ahorro }
    });

    return {
      success: true,
      data: {
        numero_comparendo: comparendo.numero_comparendo,
        valor_original: valorOriginal,
        valor_pagar: valorConDescuento,
        ahorro,
        fecha_vencimiento: fechaVencimiento
      }
    };

  } catch (error) {
    console.error('[DESCUENTO SERVICE ERROR]', error);
    return { success: false, message: 'Error interno al aplicar el descuento.', error: error.message };
  }
}

module.exports = {
  aplicarDescuento
};
