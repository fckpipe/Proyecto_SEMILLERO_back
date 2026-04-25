const { CursoProgreso, Comparendo, ExamenResultado, ActivityLog, Sede } = require('../models');
const { MODULOS, PREGUNTAS_BANCO } = require('../data/modulos');
const mongoose = require('mongoose');

exports.getModulos = (req, res) => {
  res.json({ success: true, data: MODULOS.map(m => ({ ...m, contenidoHtml: m.contenido })) });
};

exports.getProgreso = async (req, res) => {
  try {
    const ciudadano_id = req.user.id;
    console.log(`[DEBUG Curso] Obteniendo progreso para Ciudadano ID: ${ciudadano_id}`);
    
    let progreso = await CursoProgreso.findOne({ ciudadano_id });
    if (!progreso) {
      console.log(`[DEBUG Curso] No se encontró progreso, creando record inicial para: ${ciudadano_id}`);
      progreso = await CursoProgreso.create({ 
        ciudadano_id, 
        estado: 'no_iniciado', 
        modulos_completados: [], 
        trampas_detectadas: 0,
        fecha_inicio: new Date()
      });
    }
    
    const examenes = await ExamenResultado.find({ ciudadano_id }).sort({ createdAt: -1 });
    const hasPassed = examenes.some(e => e.aprobado);

    console.log(`[DEBUG Curso] Progreso recuperado: ${progreso.modulos_completados.length} módulos, Estado: ${progreso.estado}`);

    res.json({ 
      success: true, 
      data: { 
        progreso, 
        examenes: examenes,
        cursoCompletado: progreso.modulos_completados.length >= MODULOS.length,
        certificadoDesbloqueado: hasPassed
      } 
    });
  } catch (error) {
    console.error('[EROR Curso getProgreso]', error);
    res.status(500).json({ success: false, message: 'Error interno al obtener progreso' });
  }
};

exports.iniciarCurso = async (req, res) => {
  try {
    const ciudadano_id = req.user.id;
    console.log(`[DEBUG Curso] Iniciando/Actualizando acceso para: ${ciudadano_id}`);
    const progreso = await CursoProgreso.findOneAndUpdate(
       { ciudadano_id },
       { ultimo_acceso: new Date() },
       { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: progreso });
  } catch(error) { 
    console.error('[EROR Curso iniciarCurso]', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

exports.completarModulo = async (req, res) => {
  try {
    const ciudadano_id = req.user.id;
    const modulo_id = parseInt(req.params.id);
    
    console.log(`[DEBUG Curso] Solicitud completar módulo ${modulo_id} para: ${ciudadano_id}`);

    let progreso = await CursoProgreso.findOne({ ciudadano_id });
    if (!progreso) {
      progreso = new CursoProgreso({ ciudadano_id, modulos_completados: [] });
    }

    if (!progreso.modulos_completados.includes(modulo_id)) {
      progreso.modulos_completados.push(modulo_id);
      
      const uniqueModules = [...new Set(progreso.modulos_completados)];
      
      if (uniqueModules.length >= MODULOS.length) {
        progreso.estado = 'completado';
        progreso.fecha_completado = new Date();
      } else {
        progreso.estado = 'en_progreso';
      }
      progreso.ultimo_acceso = new Date();
      await progreso.save();
    }

    res.json({ success: true, data: progreso });
  } catch (error) {
    console.error('[EROR Curso completarModulo]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.iniciarExamen = async (req, res) => {
  try {
    const ciudadano_id = req.user.id;
    const progreso = await CursoProgreso.findOne({ ciudadano_id });
    
    if (!progreso || (progreso.modulos_completados.length < MODULOS.length && progreso.estado !== 'completado')) {
      return res.status(400).json({ success: false, message: 'Debes completar todos los módulos primero' });
    }

    if (progreso.trampas_detectadas >= 3) {
      return res.status(403).json({ success: false, message: 'Examen bloqueado permanentemente por sistema anti-trampas.' });
    }

    // Buscar comparendo para asociar
    const comparendo = await Comparendo.findOne({ ciudadano_id, estado: 'pendiente', requiere_curso: true }).sort({ fecha_imposicion: 1 });

    // Seleccionar aleatoriamente 30 preguntas: 6 por cada módulo
    const selected = [];
    MODULOS.forEach(modulo => {
      const preguntasModulo = PREGUNTAS_BANCO.filter(p => p.modulo_id === modulo.id);
      const shuffledModulo = [...preguntasModulo].sort(() => 0.5 - Math.random());
      selected.push(...shuffledModulo.slice(0, 6));
    });

    const examQuestionsForClient = selected.sort(() => 0.5 - Math.random()).map((q, index) => ({
      _id: index,
      pregunta_id: PREGUNTAS_BANCO.findIndex(pq => pq.id === q.id),
      texto: q.texto,
      tipo: q.tipo,
      opciones: [...q.opciones].sort(() => 0.5 - Math.random()) // Mezclar opciones
    }));

    const examen = await ExamenResultado.create({
      ciudadano_id,
      comparendo_id: comparendo ? comparendo._id : null,
      puntaje: 0,
      respuestas: [],
      aprobado: false
    });

    res.json({ success: true, data: { examen_id: examen._id, preguntas: examQuestionsForClient } });
  } catch (error) {
    console.error('[EROR IniciarExamen]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.entregarExamen = async (req, res) => {
  try {
    const { examen_id, respuestasData } = req.body;
    const examen = await ExamenResultado.findById(examen_id);
    if (!examen) return res.status(404).json({ success: false, message: 'Sesión de examen no encontrada' });

    let correctas = 0;
    const respuestasDetalle = respuestasData.map(r => {
      const q = PREGUNTAS_BANCO[r.pregunta_id];
      const isCorrect = q && q.respuestaCorrecta === r.seleccionada;
      if (isCorrect) correctas++;
      return { pregunta: q ? q.texto : 'Pregunta desconocida', dada: r.seleccionada, correcta: isCorrect };
    });

    const total = respuestasData.length || 30;
    const porcentaje = Math.round((correctas / total) * 100);
    const aprobado = porcentaje >= 70; // Nuevo requisito del 70%

    examen.puntaje = porcentaje;
    examen.respuestas = respuestasDetalle;
    examen.aprobado = aprobado;
    await examen.save();

    const ciudadano_id = req.user.id;

    if (aprobado) {
      // 1. Marcar comparendos como completados
      await Comparendo.updateMany(
        { ciudadano_id, estado: 'pendiente', requiere_curso: true },
        { $set: { estado: 'curso_completado' } }
      );

      // 2. Asegurar estado del curso
      await CursoProgreso.findOneAndUpdate(
        { ciudadano_id },
        { $set: { estado: 'completado', fecha_completado: new Date() } }
      );

      await ActivityLog.create({
        tipo_evento: 'examen_aprobado',
        canal: 'sistema',
        descripcion: `Certificación exitosa: ${req.user.nombre || 'Ciudadano'} aprobó con ${porcentaje}%.`,
        metadata: { ciudadano_id, examen_id: examen._id }
      });
    } else {
        await ActivityLog.create({
            tipo_evento: 'examen_fallido',
            canal: 'sistema',
            descripcion: `${req.user.nombre || 'Ciudadano'} reprobó con ${porcentaje}%.`,
            metadata: { ciudadano_id, examen_id: examen._id }
        });
    }

    res.json({ success: true, data: { aprobado, puntaje: porcentaje, correctas, total } });
  } catch (error) {
     console.error('[EROR EntregarExamen]', error);
     res.status(500).json({ success: false, message: error.message });
  }
};

exports.registrarTrampa = async (req, res) => {
  try {
    const ciudadano_id = req.user.id;
    let progreso = await CursoProgreso.findOne({ ciudadano_id });
    
    if (progreso) {
      progreso.trampas_detectadas += 1;
      await progreso.save();

      await ActivityLog.create({
        tipo_evento: 'trampa_detectada',
        canal: 'sistema',
        descripcion: `Intento de fraude detectado para el usuario ${req.user.nombre}.`,
        metadata: { ciudadano_id }
      });

      res.json({ success: true, data: { bloqueado: progreso.trampas_detectadas >= 3, trampas: progreso.trampas_detectadas } });
    } else {
      res.status(404).json({ success: false, message: 'Progreso no encontrado' });
    }
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCertificado = async (req, res) => {
  try {
    const ciudadano_id = req.user.id;
    const examenes = await ExamenResultado.find({ ciudadano_id, aprobado: true }).sort({ createdAt: -1 }).limit(1);
    if (examenes.length === 0) return res.status(403).json({ success: false, message: 'No cuenta con certificados disponibles.' });

    const comparendo = await Comparendo.findOne({ ciudadano_id, estado: 'curso_completado' }).sort({ updatedAt: -1 });
    
    const certificado = {
      codigo: examenes[0]._id,
      ciudadano: req.user.nombre,
      cedula: req.user.cedula,
      comparendo: comparendo ? comparendo.numero_comparendo : 'Ref: Proceso Pedagógico',
      fecha_expedicion: examenes[0].updatedAt,
      puntaje: examenes[0].puntaje
    };

    res.json({ success: true, data: certificado });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

exports.debugProgreso = async (req, res) => {
  try {
    const progresos = await CursoProgreso.find().populate('ciudadano_id', 'nombre email cedula');
    res.json({ success: true, count: progresos.length, data: progresos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
