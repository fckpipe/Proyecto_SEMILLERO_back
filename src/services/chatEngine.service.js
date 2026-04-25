const { v4: uuidv4 } = require('uuid');
const Ciudadano = require('../models/Ciudadano');
const Comparendo = require('../models/Comparendo');
const ActivityLog = require('../models/ActivityLog');

// TTL en memoria (30 min)
const SESSION_TTL = 30 * 60 * 1000;
const sessions = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivity > SESSION_TTL) sessions.delete(id);
  }
}, 5 * 60 * 1000);

const STATES = {
  INICIO: 'INICIO',
  // ── SIMIT Flow ────────────────────────────
  CONSULTAR_TIPO: 'CONSULTAR_TIPO',      // Paso 1: Elegir cédula o placa
  ESPERAR_CEDULA: 'ESPERAR_CEDULA',      // Paso 2a: Pedir cédula
  ESPERAR_PLACA: 'ESPERAR_PLACA',        // Paso 2b: Pedir placa
  POST_MULTAS: 'POST_MULTAS',            // Paso 6: Quiere el descuento?
  // ── Comparendo manual ─────────────────────
  PEDIR_CEDULA_COMP: 'PEDIR_CEDULA_COMP',
  PEDIR_COMPARENDO: 'PEDIR_COMPARENDO',
};

function getSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    const newId = sessionId || uuidv4();
    sessions.set(newId, { id: newId, state: STATES.INICIO, data: {}, lastActivity: Date.now() });
    return sessions.get(newId);
  }
  const s = sessions.get(sessionId);
  s.lastActivity = Date.now();
  return s;
}

const cleanText = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// ── Validaciones ──────────────────────────────────────────────────────────────
const validarCedula = (v) => /^\d{6,10}$/.test(v.replace(/\D/g, ''));
const validarPlaca  = (v) => /^[A-Za-z]{3}\d{3}$|^[A-Za-z]{3}\d{2}[A-Za-z]$/i.test(v.trim());

// ── Main processor ────────────────────────────────────────────────────────────
async function processMessage(sessionId, message, userContext = null) {
  const session = getSession(sessionId);
  if (userContext) session.user = userContext; // Guardar contexto del usuario logueado

  const text = cleanText(message);
  let response = '';
  let quickReplies = [];
  let action = null;
  let simitData = null;

  switch (session.state) {

    // ─────────────────────────────────────────────────
    case STATES.INICIO: {
      const isMultas   = text.includes('multa') || text.includes('comparendo') ||
                         text.includes('consultar mis multas') || text.includes('deuda');
      const isCurso    = text.includes('curso') || text.includes('estadisticas') || text.includes('estadística');
      const isCert     = text.includes('certificado') || text.includes('mis certificados');
      const isEstado   = text.includes('estado') || text.includes('estado de mi comparendo');
      const isHumano   = text.includes('humano') || text.includes('hablar con');
      const isDescuento = text.includes('descuento') || text.includes('50%');

      if (isMultas) {
        // → Paso 1
        session.state = STATES.CONSULTAR_TIPO;
        response = 'Perfecto, puedo consultar tus multas de varias formas.\n\n¿Cómo prefieres buscar?';
        quickReplies = ['🪪 Por número de cédula', '🚗 Por placa del vehículo'];
        
        // Si el usuario tiene datos vinculados, agregar opción rápida
        if (session.user?.cedula || session.user?.placa_vehiculo) {
          quickReplies.unshift('🚀 Consultar mis datos guardados');
        }
      } else if (text.includes('mis datos guardados') || text.includes('🚀')) {
        // ── CONSULTA DUAL AUTOMÁTICA ──
        if (!session.user?.cedula) {
          response = 'Aún no tengo tu número de cédula vinculado. ¿Cómo prefieres buscar hoy?';
          quickReplies = ['🪪 Por número de cédula', '🚗 Por placa del vehículo'];
          session.state = STATES.CONSULTAR_TIPO;
        } else {
          return await processDualConsultation(session);
        }
      } else if (isCurso || isCert) {
        response = '🎓 Para acceder al curso virtual y tus certificados ingresa a tu portal de ciudadano. Todo es 100% virtual desde cualquier dispositivo.';
        quickReplies = ['🚀 Ir al curso ahora', '🔍 Consultar mis multas'];
        action = 'redirect_curso';
      } else if (isEstado) {
        session.state = STATES.PEDIR_CEDULA_COMP;
        response = 'Claro. Para consultar el estado de tu comparendo, ingresa tu número de **cédula** (solo números, sin puntos ni espacios):';
      } else if (isDescuento) {
        response = 'El **descuento del 50%** aplica a ciudadanos que completen el Curso Virtual Pedagógico de Seguridad Vial gratuitamente.\n\n1️⃣ Regístrate o inicia sesión\n2️⃣ Completa los 5 módulos virtuales\n3️⃣ Aprueba el examen (mínimo 70%)\n4️⃣ Descarga tu certificado de descuento\n\nTodo desde tu celular o computador, sin filas 🎉';
        quickReplies = ['🚀 Ir al curso ahora', '🔍 Consultar mis multas'];
        action = 'redirect_curso';
      } else if (isHumano) {
        response = 'Un asesor humano está disponible en:\n\n📞 **602 445 9000 ext. 1**\n🌐 movilidadcali.gov.co\n\nHorario: Lunes a Viernes 8am–5pm';
        quickReplies = ['🔍 Consultar mis multas', '💰 Info sobre el descuento del 50%'];
      } else {
        response = '¡Hola! Soy **MOV-IA** 🤖, el asistente virtual de la Secretaría de Movilidad de Cali.\n\n¿En qué te puedo ayudar hoy?';
        quickReplies = [
          '🔍 Consultar mis multas',
          '📚 Cómo tomar el curso virtual',
          '💰 Descuento del 50%',
          '📋 Estado de mi comparendo',
          '🆘 Hablar con un humano',
        ];
      }
      break;
    }

    // ─────────────────────────────────────────────────
    // PASO 1: elegir tipo de consulta
    case STATES.CONSULTAR_TIPO: {
      if (text.includes('cedula') || text.includes('cédula')) {
        session.data.tipo_consulta = 'cedula';
        session.state = STATES.ESPERAR_CEDULA;
        response = '🪪 Ingresa tu número de **cédula** (solo números, sin puntos ni espacios):';
      } else if (text.includes('placa')) {
        session.data.tipo_consulta = 'placa';
        session.state = STATES.ESPERAR_PLACA;
        response = '🚗 Ingresa la **placa** de tu vehículo (ejemplo: ABC123 o ABC12D para motos):';
      } else if (text.includes('volver') || text.includes('menu') || text.includes('menú')) {
        session.state = STATES.INICIO;
        return await processMessage(session.id, 'hola');
      } else {
        response = '¿Cómo prefieres buscar tus multas?';
        quickReplies = ['🪪 Por número de cédula', '🚗 Por placa del vehículo'];
      }
      break;
    }

    // ─────────────────────────────────────────────────
    // PASO 2a: recibir cédula y validar
    case STATES.ESPERAR_CEDULA: {
      const raw = message.trim().replace(/\D/g, '');
      if (text === 'volver' || text === 'cancelar') {
        session.state = STATES.CONSULTAR_TIPO;
        return await processMessage(session.id, 'cedula'); // re-trigger
      }
      if (!validarCedula(raw)) {
        response = '⚠️ Ese no parece un número de cédula válido. Ingresa solo números sin espacios (entre 6 y 10 dígitos).';
        quickReplies = ['Cancelar'];
        break;
      }
      // Válida → consultar SIMIT
      session.data.valor = raw;
      session.state = STATES.INICIO;
      return await processSimitConsultation(session, 'cedula', raw);
    }

    // ─────────────────────────────────────────────────
    // PASO 2b: recibir placa y validar
    case STATES.ESPERAR_PLACA: {
      const raw = message.trim().toUpperCase();
      if (text === 'volver' || text === 'cancelar') {
        session.state = STATES.CONSULTAR_TIPO;
        return await processMessage(session.id, 'placa');
      }
      if (!validarPlaca(raw)) {
        response = '⚠️ Formato de placa incorrecto.\n\nEjemplos válidos:\n• Carro: **ABC123**\n• Moto: **ABC12D**';
        quickReplies = ['Cancelar'];
        break;
      }
      session.data.valor = raw;
      session.state = STATES.INICIO;
      return await processSimitConsultation(session, 'placa', raw);
    }

    // ─────────────────────────────────────────────────
    // Estado de comparendo manual
    case STATES.PEDIR_CEDULA_COMP: {
      const raw = message.trim().replace(/\D/g, '');
      if (text === 'cancelar' || text === 'volver') {
        session.state = STATES.INICIO;
        response = 'Operación cancelada. ¿En qué más te puedo ayudar?';
        quickReplies = ['🔍 Consultar mis multas'];
        break;
      }
      if (!validarCedula(raw)) {
        response = 'La cédula ingresada no parece válida. Ingresa solo números (6–10 dígitos).';
        break;
      }
      session.data.cedula = raw;
      session.state = STATES.PEDIR_COMPARENDO;
      response = `Cédula registrada ✅\n\nAhora ingresa el **número de comparendo** (ej: CO-2024-000001):`;
      break;
    }

    case STATES.PEDIR_COMPARENDO: {
      if (text === 'cancelar' || text === 'volver') {
        session.state = STATES.INICIO;
        response = 'Operación cancelada.';
        quickReplies = ['🔍 Consultar mis multas'];
        break;
      }
      const numComp = message.toUpperCase().trim();
      try {
        const ciudadano = await Ciudadano.findOne({ cedula: session.data.cedula });
        if (!ciudadano) {
          session.state = STATES.INICIO;
          response = `No encontré ningún ciudadano con cédula **${session.data.cedula}**. Verifica el número e intenta de nuevo.`;
          quickReplies = ['🔍 Consultar mis multas'];
          break;
        }
        const comparendo = await Comparendo.findOne({ numero_comparendo: numComp, ciudadano_id: ciudadano._id });
        if (!comparendo) {
          response = `No encontré el comparendo **${numComp}** asociado a esa cédula. Verifica el número e inténtalo de nuevo, o escribe "cancelar".`;
          quickReplies = ['Cancelar'];
          break;
        }
        const estadoEmoji = { pendiente: '🔴', curso_agendado: '🟡', curso_completado: '🟢' };
        const estadoLabel = { pendiente: 'Pendiente de curso', curso_agendado: 'Curso en progreso', curso_completado: 'Completado ✅' };
        response = `📋 **Comparendo ${numComp}**\n\n• **Estado:** ${estadoEmoji[comparendo.estado] || '⚪'} ${estadoLabel[comparendo.estado] || comparendo.estado}\n• **Infracción:** ${comparendo.tipo_infraccion}\n• **Fecha:** ${new Date(comparendo.fecha_imposicion).toLocaleDateString('es-CO')}`;
        quickReplies = comparendo.estado === 'pendiente'
          ? ['🔍 Consultar mis multas', '🚀 Iniciar curso virtual']
          : ['🔍 Consultar otra', 'Menú Principal'];
        session.state = STATES.INICIO;
      } catch (err) {
        console.error(err);
        response = 'Hubo un error consultando el comparendo. Intenta de nuevo.';
        quickReplies = ['Cancelar'];
      }
      break;
    }

    // ─────────────────────────────────────────────────
    case STATES.POST_MULTAS: {
      if (text.includes('si') || text.includes('quiero') || text.includes('descuento') || text.includes('curso')) {
        session.state = STATES.INICIO;
        response = '¡Perfecto! Para obtener tu **descuento del 50%** debes:\n\n1️⃣ Crear una cuenta o iniciar sesión\n2️⃣ Completar los 5 módulos del curso virtual\n3️⃣ Aprobar el examen final con mínimo 70%\n4️⃣ Descargar tu certificado de descuento\n\nTodo desde tu celular o computador, sin filas 🎉';
        quickReplies = ['🚀 Ir al curso ahora', 'ℹ️ Más información'];
        action = 'redirect_curso';
      } else if (text.includes('funciona') || text.includes('informacion') || text.includes('información')) {
        session.state = STATES.INICIO;
        response = 'El descuento está amparado por la **Ley 769 de 2002** (Código Nacional de Tránsito). Al aprobar el curso pedagógico de seguridad vial en modalidad virtual, obtienes un **50% de descuento** sobre el valor del comparendo, válido por 30 días desde su emisión.';
        quickReplies = ['🚀 Ir al curso ahora', '🔍 Consultar mis multas'];
        action = 'redirect_curso';
      } else {
        session.state = STATES.INICIO;
        response = '¿En qué más te puedo ayudar?';
        quickReplies = ['🔍 Consultar mis multas', 'Menú Principal'];
      }
      break;
    }

    default:
      session.state = STATES.INICIO;
      response = 'Disculpa, algo salió mal. ¿En qué te puedo ayudar?';
      quickReplies = ['🔍 Consultar mis multas'];
  }

  return { response, quickReplies, action, simitData, state: session.state, sessionId: session.id };
}

// ── SIMIT Consultation ────────────────────────────────────────────────────────
async function processSimitConsultation(session, tipo, valor) {
  try {
    const simitService = require('./simit.service');
    const fn = tipo === 'cedula' ? simitService.consultarPorCedula : simitService.consultarPorPlaca;
    const result = await fn(valor);

    const FUENTE_LABELS = {
      SIMIT_REAL:            '🟢 *Datos en tiempo real del SIMIT*',
      SIMIT_REAL_VERIFICADO: '✅ *Datos Reales Verificados (SIMIT Palmira)*',
      BASE_LOCAL:            '🔵 *Sistema local Movilidad Cali*',
      MOTOR_PEDAGOGICO:      '⚙️  *Base pedagógica de infracciones*',
    };
    const fuenteText = FUENTE_LABELS[result.fuente] || '';

    // ── Sin multas ──
    if (!result.encontrado || !result.comparendos || result.comparendos.length === 0) {
      session.state = STATES.INICIO;
      return {
        response: `✅ ¡Buenas noticias! No encontré comparendos pendientes asociados a ${tipo === 'cedula' ? 'la cédula' : 'la placa'} **${valor}**.\n\n${fuenteText}\n\nSi crees que hay un error, puedes:\n📞 Llamar al **123** (línea de movilidad Cali)\n🌐 Consultar directamente en **fcm.org.co/simit**`,
        quickReplies: ['🔍 Consultar otra', 'Menú Principal'],
        state: session.state,
        sessionId: session.id
      };
    }

    // ── Con multas: estructurar datos para las cards ──
    const comparendosCards = result.comparendos.map(c => ({
      numero:          c.numero || 'N/D',
      fecha:           c.fecha  || new Date().toLocaleDateString('es-CO'),
      codigo:          c.codigo || 'C03',
      descripcion:     c.descripcion || 'Infracción de tránsito',
      valor_original:  Number(c.valor_original) || 520000,
      valor_descuento: Math.round((Number(c.valor_original) || 520000) * 0.5),
      ahorro:          Math.round((Number(c.valor_original) || 520000) * 0.5),
      estado:          c.estado || 'Pendiente',
      organismo:       c.organismo || 'Secretaría de Movilidad',
    }));

    const totalOriginal  = result.total_deuda || comparendosCards.reduce((a, c) => a + c.valor_original, 0);
    const totalDescuento = Math.round(totalOriginal * 0.5);
    const totalAhorro    = totalOriginal - totalDescuento;

    const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`;

    const summaryText =
      `${fuenteText}\n\n` +
      `✅ Encontré **${comparendosCards.length}** comparendo(s) a tu nombre:\n\n` +
      `💰 Total deuda: **${fmt(totalOriginal)}**\n` +
      `✅ Pagando con descuento: **${fmt(totalDescuento)}**\n` +
      `🎉 Ahorro potencial: **${fmt(totalAhorro)}**\n\n` +
      `¿Deseas tomar el curso virtual **GRATIS** y obtener tu descuento del 50%?`;

    session.state = STATES.POST_MULTAS;

    await ActivityLog.create({
      tipo_evento: 'consulta_simit_chat',
      canal: 'chatbot',
      descripcion: `[${result.fuente}] Consulta MOV-IA por ${tipo}: ${valor}. ${comparendosCards.length} comparendos.`,
      metadata: { tipo, valor, fuente: result.fuente, count: comparendosCards.length, total: totalOriginal }
    }).catch(() => {});

    return {
      response: summaryText,
      quickReplies: ['✅ Sí, quiero el descuento', '❓ ¿Cómo funciona el descuento?'],
      simitData: {
        comparendos: comparendosCards,
        fuente: result.fuente,
        totales: { original: totalOriginal, descuento: totalDescuento, ahorro: totalAhorro }
      },
      state: session.state,
      sessionId: session.id
    };

  } catch (error) {
    console.error('[chatEngine] SIMIT error:', error);
    session.state = STATES.INICIO;
    return {
      response: '⚠️ El servicio del SIMIT está presentando intermitencias. Por favor intenta de nuevo en unos minutos o consulta en **fcm.org.co/simit**',
      quickReplies: ['🔄 Intentar de nuevo', 'Menú Principal'],
      state: session.state,
      sessionId: session.id
    };
  }
}

// ── Dual Consultation (C.C. + Placa del Perfil) ────────────────────────────────
async function processDualConsultation(session) {
  try {
    const simitService = require('./simit.service');
    const { cedula, placa_vehiculo, nombre } = session.user;

    // Consultar ambos en paralelo
    const [resDoc, resPlaca] = await Promise.all([
      simitService.consultarPorCedula(cedula),
      placa_vehiculo ? simitService.consultarPorPlaca(placa_vehiculo) : Promise.resolve({ comparendos: [] })
    ]);

    // Unir comparendos
    const map = new Map();
    [...(resDoc.comparendos || []), ...(resPlaca.comparendos || [])].forEach(c => {
      map.set(c.numero, {
        ...c,
        valor_original: Number(c.valor_original) || 520000,
        valor_descuento: Math.round((Number(c.valor_original) || 520000) * 0.5),
        ahorro: Math.round((Number(c.valor_original) || 520000) * 0.5),
      });
    });

    const comparendosCards = Array.from(map.values());
    const totalOriginal = comparendosCards.reduce((a, c) => a + c.valor_original, 0);
    const totalDescuento = Math.round(totalOriginal * 0.5);
    const totalAhorro = totalOriginal - totalDescuento;

    const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`;

    if (comparendosCards.length === 0) {
      session.state = STATES.INICIO;
      return {
        response: `✅ ¡Buenas noticias ${nombre}! No encontré comparendos pendientes asociados a tu cédula **${cedula}**${placa_vehiculo ? ' ni a tu placa **' + placa_vehiculo + '**' : ''}.`,
        quickReplies: ['Menú Principal', '🆘 Hablar con un humano'],
        state: session.state,
        sessionId: session.id
      };
    }

    const summaryText = 
      `✅ ¡Hola ${nombre}! He realizado una búsqueda completa en el SIMIT.\n\n` +
      `🔍 **Resultados vinculados:**\n` +
      `• Cédula: **${cedula}**\n` +
      (placa_vehiculo ? `• Placa: **${placa_vehiculo}**\n` : '') +
      `\nEncontré **${comparendosCards.length}** comparendo(s) asociados.\n\n` +
      `💰 Total deuda: **${fmt(totalOriginal)}**\n` +
      `🎉 Ahorro con curso: **${fmt(totalAhorro)}**\n\n` +
      `¿Deseas iniciar tu curso virtual ahora para aplicar este descuento?`;

    session.state = STATES.POST_MULTAS;
    
    return {
      response: summaryText,
      quickReplies: ['✅ Sí, quiero el descuento', 'Menú Principal'],
      simitData: {
        comparendos: comparendosCards,
        totales: { original: totalOriginal, descuento: totalDescuento, ahorro: totalAhorro }
      },
      state: session.state,
      sessionId: session.id
    };
  } catch (error) {
    console.error('[processDualConsultation] Error:', error);
    return {
      response: '⚠️ Tuve un problema al consultar tus datos guardados. Por favor intenta buscando manualmente por cédula o placa.',
      quickReplies: ['🪪 Por número de cédula', '🚗 Por placa del vehículo'],
      state: STATES.CONSULTAR_TIPO,
      sessionId: session.id
    };
  }
}


module.exports = { processMessage, getSession };
