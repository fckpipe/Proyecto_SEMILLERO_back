const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Sede = require('../models/Sede');
const Admin = require('../models/Admin');
const Ciudadano = require('../models/Ciudadano');
const Comparendo = require('../models/Comparendo');
const Horario = require('../models/Horario');
const Cita = require('../models/Cita');
const ActivityLog = require('../models/ActivityLog');
const CursoProgreso = require('../models/CursoProgreso');

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const autoSeedDB = async (force = false) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0 && !force) {
      return; // Ya existen datos
    }

    if (force && adminCount > 0) {
      console.log('🔄 Force mode: limpiando colecciones...');
      await Promise.all([
        Sede.deleteMany(), Horario.deleteMany(), Ciudadano.deleteMany(),
        Comparendo.deleteMany(), ActivityLog.deleteMany(), Admin.deleteMany(),
        Cita.deleteMany(), CursoProgreso.deleteMany()
      ]);
    }

    console.log('⚠️ Base de datos vacía detectada. Iniciando Auto-Seed...');

    // 1. SEDES (5 exactas)
    const sedesData = [
      { nombre: "Centro de Educación Vial Norte", direccion: "Av. 3N # 47-25, Cali", activa: true },
      { nombre: "Centro de Educación Vial Sur", direccion: "Cra 100 # 16-00, Cali", activa: true },
      { nombre: "Centro de Educación Vial Oriente", direccion: "Calle 70 # 26-35, Cali", activa: true },
      { nombre: "Centro de Educación Vial Oeste", direccion: "Av. Roosevelt # 40-61, Cali", activa: true },
      { nombre: "Centro de Educación Vial Centro", direccion: "Cra 8 # 10-27, Cali", activa: true }
    ];
    const sedes = await Sede.insertMany(sedesData);

    // 2. ADMINS
    const adminPass = await bcrypt.hash('Admin123*', 10);
    const admins = [
      { username: "superadmin", password_hash: adminPass, nombre: "Super Administrador", email: 'super@secretaria.gov.co', rol: "super_admin", activo: true },
      { username: "admin_norte", password_hash: adminPass, nombre: "Admin Sede Norte", email: 'norte@secretaria.gov.co', rol: "admin_sede", sede_id: sedes[0]._id, activo: true },
      { username: "admin_sur", password_hash: adminPass, nombre: "Admin Sede Sur", email: 'sur@secretaria.gov.co', rol: "admin_sede", sede_id: sedes[1]._id, activo: true },
      { username: "admin_oriente", password_hash: adminPass, nombre: "Admin Sede Oriente", email: 'oriente@secretaria.gov.co', rol: "admin_sede", sede_id: sedes[2]._id, activo: true },
      { username: "admin_oeste", password_hash: adminPass, nombre: "Admin Sede Oeste", email: 'oeste@secretaria.gov.co', rol: "admin_sede", sede_id: sedes[3]._id, activo: true },
      { username: "admin_centro", password_hash: adminPass, nombre: "Admin Sede Centro", email: 'centro@secretaria.gov.co', rol: "admin_sede", sede_id: sedes[4]._id, activo: true }
    ];
    await Admin.insertMany(admins);

    // 3. CIUDADANOS (20)
    const passwordHashC = await bcrypt.hash('Pass123*', 10);
    const ciudadanosArray = [];
    for (let i = 1; i <= 20; i++) {
        ciudadanosArray.push({
            cedula: `11122233${String(i).padStart(2, '0')}`,
            nombre: `Ciudadano${i}`,
            apellido: `Prueba${i}`,
            telefono: `3${getRandomInt(10, 20)}0000000`,
            email: `ciudadano${i}@prueba.com`,
            password_hash: passwordHashC,
            role: 'citizen'
        });
    }
    const ciudadanos = await Ciudadano.insertMany(ciudadanosArray);

    // 4. COMPARENDOS (30)
    const infracciones = ['C02 - Estacionamiento en zona prohibida', 'C04 - Semáforo en rojo', 'C19 - No usar cinturón de seguridad', 'D02 - Conducir sin licencia', 'A03 - Estacionamiento no permitido'];
    const comparendosArray = [];
    const estadosComparendo = ['pendiente', 'curso_agendado', 'curso_completado'];
    let c_p = 0, c_ca = 0, c_cc = 0; // Contadores de estados exactos
    
    for (let i = 1; i <= 30; i++) {
        let est = 'curso_agendado';
        if (c_p < 15) { est = 'pendiente'; c_p++; }
        else if (c_ca < 10) { est = 'curso_agendado'; c_ca++; }
        else { est = 'curso_completado'; c_cc++; }

        comparendosArray.push({
            numero_comparendo: `CO-2024-${String(i).padStart(6, '0')}`,
            ciudadano_id: getRandomElement(ciudadanos)._id,
            fecha_imposicion: new Date(Date.now() - getRandomInt(1, 60) * 86400000),
            tipo_infraccion: getRandomElement(infracciones),
            requiere_curso: true,
            estado: est
        });
    }
    const comparendos = await Comparendo.insertMany(comparendosArray);

    // 5. HORARIOS (20) próximos 45 días
    const horariosArray = [];
    for (let i = 0; i < 20; i++) {
        const d = new Date();
        d.setDate(d.getDate() + getRandomInt(1, 45));
        d.setHours(getRandomInt(7, 17), 0, 0, 0); // Entre 7am y 5pm
        horariosArray.push({
            sede_id: getRandomElement(sedes)._id,
            fecha: d,
            hora_inicio: `${String(d.getHours()).padStart(2, '0')}:00`,
            hora_fin: `${String(d.getHours()+2).padStart(2, '0')}:00`, // 2 horas
            capacidad_maxima: 20,
            cupos_disponibles: getRandomInt(5, 20),
            activo: true
        });
    }
    const horarios = await Horario.insertMany(horariosArray);

    // 6. CITAS (25)
    const citasArray = [];
    let conf = 0, comp = 0, canc = 0, noa = 0;
    
    for (let i = 0; i < 25; i++) {
        let est = 'confirmada';
        if (conf < 10) { est = 'confirmada'; conf++; }
        else if (comp < 8) { est = 'completada'; comp++; }
        else if (canc < 4) { est = 'cancelada'; canc++; }
        else { est = 'no_asistio'; noa++; }

        const h = getRandomElement(horarios);
        const c = getRandomElement(comparendos); // Solo tomar comparendos que dejen agendar (curso_agendado)
        
        citasArray.push({
            codigo_cita: `CT-${Date.now().toString().slice(-6)}-${String(i).padStart(3, '0')}`,
            ciudadano_id: c.ciudadano_id,
            sede_id: h.sede_id,
            horario_id: h._id,
            canal: Math.random() > 0.5 ? 'chatbot' : 'email',
            estado: est,
            comparendo_id: c._id
        });
    }
    const citas = await Cita.insertMany(citasArray);

    // 7. ACTIVITY LOGS (30)
    const logsArray = [];
    for (let i = 0; i < 30; i++) {
        logsArray.push({
            tipo_evento: 'cita_agendada',
            canal: getRandomElement(['sistema', 'admin', 'chatbot', 'email']),
            descripcion: 'Actividad generada automáticamente en el sistema.',
            createdAt: new Date(Date.now() - getRandomInt(0, 1000000000))
        });
    }
    await ActivityLog.insertMany(logsArray);

    // 8. CURSO PROGRESOS (10)
    const cursosProgreso = [];
    const compConCursoAgendado = comparendos.filter(c => c.estado === 'curso_agendado').slice(0, 10);
    
    for (let i = 0; i < compConCursoAgendado.length; i++) {
        cursosProgreso.push({
            ciudadano_id: compConCursoAgendado[i].ciudadano_id,
            comparendo_id: compConCursoAgendado[i]._id,
            modulo_actual: 'modulo_1',
            modulos_completados: [], 
            trampas_detectadas: 0,
            estado: 'en_progreso',
            fecha_inicio: new Date(),
        });
    }
    await CursoProgreso.insertMany(cursosProgreso);

    console.log('✅ Seed ejecutado:');
    console.log(`   - ${sedes.length} sedes creadas`);
    console.log(`   - ${admins.length} admins creados`);
    console.log(`   - ${ciudadanos.length} ciudadanos creados`);
    console.log(`   - ${comparendos.length} comparendos creados`);
    console.log(`   - ${horarios.length} horarios creados`);
    console.log(`   - ${citas.length} citas creadas`);
    console.log(`   - ${logsArray.length} activity logs creados`);

  } catch (err) {
    console.error('❌ Error en Auto-Seed Masivo:', err);
  }
};

module.exports = autoSeedDB;
