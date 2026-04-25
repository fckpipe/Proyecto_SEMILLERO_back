const simitService  = require('../services/simit.service');
const descuentoService = require('../services/descuento.service');

// Etiquetas amigables por fuente para el frontend
const FUENTE_LABELS = {
  SIMIT_REAL:           { label: '🟢 Datos en tiempo real del SIMIT', badge: 'real'       },
  SIMIT_REAL_VERIFICADO:  { label: '✅ Datos Reales Verificados (SIMIT Palmira)', badge: 'real' },
  BASE_LOCAL:           { label: '🔵 Datos del sistema local Movilidad Cali', badge: 'local' },
  MOTOR_PEDAGOGICO:     { label: '⚙️  Datos de la base pedagógica de infracciones', badge: 'demo' },
};

function enrichResult(result) {
  const meta = FUENTE_LABELS[result.fuente] || FUENTE_LABELS.MOTOR_PEDAGOGICO;
  return {
    ...result,
    fuente_label: meta.label,
    fuente_badge: meta.badge,
  };
}

// ── GET /api/multas/cedula/:cedula ────────────────────────────────────────────
exports.consultarPorCedula = async (req, res) => {
  try {
    const { cedula } = req.params;

    if (!cedula || !/^\d{6,10}$/.test(cedula)) {
      return res.status(400).json({ success: false, message: 'Cédula inválida. Debe tener entre 6 y 10 dígitos.' });
    }

    const result = await simitService.consultarPorCedula(cedula);

    if (result.fromCache) res.setHeader('X-Cache', 'HIT');
    else                  res.setHeader('X-Cache', 'MISS');

    res.json({ success: true, data: enrichResult(result) });
  } catch (error) {
    console.error('[multas.controller] consultarPorCedula:', error);
    res.status(500).json({ success: false, message: 'Error al consultar multas.' });
  }
};

// ── GET /api/multas/placa/:placa ──────────────────────────────────────────────
exports.consultarPorPlaca = async (req, res) => {
  try {
    const { placa } = req.params;
    const placaUp = placa?.toUpperCase().trim();

    if (!placaUp || !/^[A-Z]{3}\d{3}$|^[A-Z]{3}\d{2}[A-Z]$/i.test(placaUp)) {
      return res.status(400).json({ success: false, message: 'Placa inválida. Formatos válidos: ABC123 (carro) o ABC12D (moto).' });
    }

    const result = await simitService.consultarPorPlaca(placaUp);

    if (result.fromCache) res.setHeader('X-Cache', 'HIT');
    else                  res.setHeader('X-Cache', 'MISS');

    res.json({ success: true, data: enrichResult(result) });
  } catch (error) {
    console.error('[multas.controller] consultarPorPlaca:', error);
    res.status(500).json({ success: false, message: 'Error al consultar multas por placa.' });
  }
};

// ── POST /api/multas/aplicar-descuento ────────────────────────────────────────
exports.aplicarDescuento = async (req, res) => {
  try {
    const { comparendoId } = req.body;
    const ciudadanoId = req.user.id;

    const result = await descuentoService.aplicarDescuento(ciudadanoId, comparendoId);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('[multas.controller] aplicarDescuento:', error);
    res.status(500).json({ success: false, message: 'Error al aplicar el descuento.' });
  }
};

// ── DELETE /api/multas/cache/:tipo/:valor (admin) ─────────────────────────────
exports.limpiarCache = async (req, res) => {
  try {
    const { tipo, valor } = req.params;
    const ok = simitService.limpiarCache(tipo, valor);
    res.json({ success: ok, message: ok ? 'Cache limpiado.' : 'No había entrada en cache.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
