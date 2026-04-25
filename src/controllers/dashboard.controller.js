const { Cita, Ciudadano, Sede, Comparendo, ActivityLog, CursoProgreso, ExamenResultado } = require('../models');
const mongoose = require('mongoose');

exports.getMetrics = async (req, res) => {
  try {
    const filter = req.sedeFilter || {};
    console.log(`[DEBUG Dashboard] Cargando métricas. Filtro aplicado:`, JSON.stringify(filter));

    // Base fechas
    const ahora = new Date();
    const startOfMonth = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // 1. Métricas Base Citas
    const citasMes = await Cita.find({ ...filter, createdAt: { $gte: startOfMonth } }).catch(() => []);
    
    // Contadores de estado
    let cfm = 0, cmp = 0, cnl = 0, noa = 0;
    citasMes.forEach(c => {
        if(c.estado === 'confirmada') cfm++;
        else if(c.estado === 'completada') cmp++;
        else if(c.estado === 'cancelada') cnl++;
        else if(c.estado === 'no_asistio') noa++;
    });

    // 2. Cursos Virtuales
    const [cursosEnProgreso, cursosCompletados] = await Promise.all([
        CursoProgreso.countDocuments({ estado: 'en_progreso' }).catch(() => 0),
        CursoProgreso.countDocuments({ estado: 'completado' }).catch(() => 0)
    ]);

    // Cálculo Tasa de Aprobación
    const totalExamenes = await ExamenResultado.countDocuments().catch(() => 0);
    const examenesAprobados = await ExamenResultado.countDocuments({ aprobado: true }).catch(() => 0);
    const tasaAprobacion = totalExamenes > 0 ? Math.round((examenesAprobados / totalExamenes) * 100) : 0;

    // 3. PQR (Calculadas desde ActivityLog ya que no hay modelo PQR)
    const [pqrRecibidas, pqrResueltas] = await Promise.all([
        ActivityLog.countDocuments({ tipo_evento: 'pqr_escalado' }).catch(() => 0),
        ActivityLog.countDocuments({ tipo_evento: 'pqr_resuelto' }).catch(() => 0) // Placeholder si existiera
    ]);

    // 4. Canales
    let chatbotC = 0, webC = 0;
    citasMes.forEach(c => {
        if(c.canal === 'chatbot') chatbotC++;
        else webC++;
    });

    // 5. Citas Por Sede
    let citasPorSede = [];
    try {
        const sedesList = await Sede.find() || [];
        const aggregateMatch = { createdAt: { $gte: startOfMonth } };
        
        const aggregateData = await Cita.aggregate([
            { $match: aggregateMatch },
            { $group: { 
                _id: "$sede_id", 
                total: { $sum: 1 }, 
                confirmadas: { $sum: { $cond: [{ $eq: ["$estado", "confirmada"] }, 1, 0] } },
                completadas: { $sum: { $cond: [{ $eq: ["$estado", "completada"] }, 1, 0] } }
            }}
        ]);
        
        citasPorSede = aggregateData.map(ag => {
            const s = sedesList.find(sede => sede._id.toString() === ag._id?.toString());
            return {
                sede: s ? s.nombre : 'Sin Sede',
                total: ag.total,
                confirmadas: ag.confirmadas,
                completadas: ag.completadas
            };
        });

        if (req.user && req.user.rol === 'admin_sede' && req.user.sede_id) {
            const adminSede = sedesList.find(s => s._id.toString() === req.user.sede_id.toString());
            if (adminSede) {
                citasPorSede = citasPorSede.filter(s => s.sede === adminSede.nombre);
            }
        }
    } catch (err) { console.error('Agg Err:', err); }

    // 6. Próximas Citas
    let proximasCitasHoy = [];
    try {
        const futures = await Cita.find({ ...filter, estado: 'confirmada' })
            .populate('ciudadano_id', 'nombre apellido cedula')
            .populate('sede_id', 'nombre')
            .populate('horario_id', 'fecha hora_inicio')
            .sort({ createdAt: 1 })
            .limit(10);

        proximasCitasHoy = futures.map(c => ({
            codigo: c._id.toString().substring(18),
            ciudadano: c.ciudadano_id ? `${c.ciudadano_id.nombre} ${c.ciudadano_id.apellido}` : 'Desconocido',
            cedula: c.ciudadano_id?.cedula || 'N/A',
            hora: c.horario_id?.hora_inicio || '00:00',
            sede: c.sede_id?.nombre || 'Sede N/A',
            canal: c.canal,
            estado: c.estado
        }));
    } catch (err) { console.error('Citas Err:', err); }

    // 7. Actividad
    let actividadReciente = [];
    try {
        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(15);

        actividadReciente = logs.map(l => ({
            tipo: l.tipo_evento,
            canal: l.canal,
            descripcion: l.descripcion,
            fecha: l.createdAt,
            referencia: 'Sistema'
        }));
    } catch (err) { console.error('Logs Err:', err); }

    res.json({
      success: true,
      data: {
          metricas: {
              totalCitasMes: citasMes.length,
              citasConfirmadas: cfm,
              citasCompletadas: cmp,
              citasCanceladas: cnl,
              citasNoAsistio: noa,
              cursosEnProgreso,
              cursosCompletados,
              tasaAprobacion,
              pqrRecibidas,
              pqrResueltas
          },
          citasPorCanal: { chatbot: chatbotC, email: webC },
          citasPorSede,
          comparativaSemanal: [
            { dia: 'Lun', virtuales: 12, presenciales: 8 },
            { dia: 'Mar', virtuales: 19, presenciales: 15 },
            { dia: 'Mie', virtuales: 15, presenciales: 22 },
            { dia: 'Jue', virtuales: 22, presenciales: 18 },
            { dia: 'Vie', virtuales: 28, presenciales: Math.floor(citasMes.length/3) || 5 },
            { dia: 'Sab', virtuales: 10, presenciales: 4 },
            { dia: 'Dom', virtuales: 30, presenciales: 0 },
          ],
          proximasCitasHoy,
          actividadReciente
      }
    });

  } catch (error) {
    console.error('[CRITICAL Dashboard]', error);
    res.status(500).json({ success: false, message: 'Fallo al cargar tablero' });
  }
};
